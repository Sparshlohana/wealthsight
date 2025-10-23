import type { Transaction } from '@/types/finance';
import { Platform } from 'react-native';
import { autoAssignCategory } from './categories';

// NOTE: Expo managed apps cannot read inbox SMS. This module provides parsing utilities and
// Android-only placeholders for permissions. For true auto-import, you need a custom dev client
// and a native SMS-read module. We expose a friendly message via canReadSms().

export async function canReadSms(): Promise<{ supported: boolean; reason?: string }> {
    if (Platform.OS !== 'android') return { supported: false, reason: 'SMS import is Android-only.' };
    // expo-sms supports sending only; inbox read requires native module
    return { supported: false, reason: 'Reading SMS requires a custom dev client with an SMS-read module.' };
}

export function parseTransactionFromMessage(message: string, receivedAt?: Date): Transaction | null {
    // Normalize
    const text = message.replace(/\n/g, ' ').trim();

    // Amount patterns like Rs 1,234.56 or INR 500 or Rs: 1,234.56 or ₹1,234.56
    const amountMatch = text.match(/(?:rs\.?|inr|₹)[:\s]*([,\d]+(?:\.\d{1,2})?)/i);
    const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : undefined;

    // Type detection
    const isDebit = /(debited|spent|paid|purchase|sent|withdrawn|transfer(?:red)?\s+from\s+(?:your\s+)?account)/i.test(text);
    const isCredit = /(credited|received|deposit|refund|transfer(?:red)?\s+to\s+(?:your\s+)?account)/i.test(text);
    let type: 'income' | 'expense' | undefined;
    if (isCredit && !isDebit) type = 'income';
    else if (isDebit && !isCredit) type = 'expense';
    else if (isDebit && isCredit) type = undefined; // ambiguous

    // Merchant extraction (simple heuristics)
    const viaMatch = text.match(/(?:at|to|in|via)\s+([A-Za-z0-9 &@._-]{2,40})/i);
    let merchant = viaMatch?.[1]?.trim();
    // Ignore captures that are actually account placeholders
    if (merchant && /(your\s+account|a\/?c|account|x{4,}|XXXX)/i.test(merchant)) {
        merchant = undefined;
    }
    // Try a 'From <name>' pattern (common in credits)
    if (!merchant) {
        const fromMatch = text.match(/from\s+([A-Za-z][A-Za-z0-9 &._-]{2,40})/i);
        if (fromMatch) merchant = fromMatch[1].trim();
    }

    // Try to parse explicit date like `on 08-Oct-2025`
    let isoDate = (receivedAt ?? new Date()).toISOString();
    const dateMatch = text.match(/\bon\s+(\d{1,2})-([A-Za-z]{3})-(\d{4})\b/);
    if (dateMatch) {
        const [, dStr, monStr, yStr] = dateMatch;
        const months: Record<string, number> = {
            jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
            jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
        };
        const mIdx = months[monStr.toLowerCase()];
        const day = parseInt(dStr, 10);
        const year = parseInt(yStr, 10);
        if (!Number.isNaN(day) && !Number.isNaN(year) && mIdx >= 0 && mIdx <= 11) {
            const d = new Date(Date.UTC(year, mIdx, day));
            isoDate = d.toISOString();
        }
    }

    if (!amount || !type) return null;
    const date = isoDate;
    const categoryGuess = autoAssignCategory(merchant || text) ?? (type === 'income' ? 'salary' : 'misc');

    const tx: Transaction = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        amount,
        type,
        category: categoryGuess,
        description: merchant ? `${type === 'expense' ? 'Spent at' : 'From'} ${merchant}` : undefined,
        date,
        merchant,
        source: 'sms',
        photoUri: null,
    };
    return tx;
}

export function parseMultiple(messages: { body: string; date?: Date }[]): Transaction[] {
    const out: Transaction[] = [];
    for (const m of messages) {
        const tx = parseTransactionFromMessage(m.body, m.date);
        if (tx) out.push(tx);
    }
    return out;
}
