import type { Transaction } from '@/types/finance';
import { PermissionsAndroid, Platform } from 'react-native';
import { autoAssignCategory } from './categories';

// NOTE: Expo managed apps cannot read inbox SMS. This module provides parsing utilities and
// Android-only placeholders for permissions. For true auto-import, you need a custom dev client
// and a native SMS-read module. We expose a friendly message via canReadSms().

// Try to detect a native SMS reader at runtime (works only in a custom dev client / bare app)
async function getSmsReaderModule(): Promise<any | null> {
    if (Platform.OS !== 'android') return null;
    try {
        const mod = await import('react-native-get-sms-android');
        return (mod as any)?.default ?? (mod as any);
    } catch {
        // Not installed
        return null;
    }
}

export async function canReadSms(): Promise<{ supported: boolean; reason?: string }> {
    if (Platform.OS !== 'android') return { supported: false, reason: 'SMS import is Android-only.' };
    const mod = await getSmsReaderModule();
    if (!mod) {
        return { supported: false, reason: 'Reading SMS requires a custom dev client with an SMS-read module.' };
    }
    return { supported: true };
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

// Read recent inbox SMS on Android and parse to transactions.
// Requires a native SMS reader (e.g., react-native-get-sms-android) and a custom dev client.
export async function readTransactionsFromDevice(
    maxCount = 200,
    opts?: { debug?: boolean; logBodies?: boolean; sample?: number }
): Promise<Transaction[]> {
    if (Platform.OS !== 'android') return [];

    const SmsAndroid = await getSmsReaderModule();
    if (!SmsAndroid) {
        throw new Error('No SMS reader module found. Build a custom dev client with an SMS-read module.');
    }

    // Request runtime permission
    const perm = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_SMS,
        {
            title: 'Allow reading SMS',
            message: 'We need access to your SMS inbox to detect bank/UPI transactions.',
            buttonPositive: 'Allow',
            buttonNegative: 'Deny',
        }
    );
    if (perm !== PermissionsAndroid.RESULTS.GRANTED) return [];

    // react-native-get-sms-android API: SmsAndroid.list(JSONFilter, successFn, failFn)
    const filter = {
        box: 'inbox',
        indexFrom: 0,
        maxCount,
        // Try to narrow down to common finance keywords; the parser will still filter precisely
        // bodyRegex is supported by the library; keep it simple to ensure wide match
        bodyRegex: '(?i)(debited|credited|upi|amt|rs|inr|spent|received)'
    } as const;

    const messages = await Promise.race<{ body: string; date?: Date }[]>([
        new Promise<{ body: string; date?: Date }[]>((resolve, reject) => {
            try {
                // API expects a JSON stringified filter, then failCallback, then successCallback
                SmsAndroid.list(
                    JSON.stringify(filter),
                    (fail: unknown) => reject(new Error(typeof fail === 'string' ? fail : 'Failed to read SMS')),
                    (_count: number, smsList: string) => {
                        try {
                            const arr: ({ body: string; date: number } | any)[] = JSON.parse(smsList);
                            const normalized = arr.map((m) => ({ body: String(m.body ?? ''), date: m.date ? new Date(m.date) : undefined }));
                            resolve(normalized);
                        } catch (e) {
                            reject(e);
                        }
                    }
                );
            } catch (e) {
                reject(e);
            }
        }),
        // Guard against hanging if callbacks are never invoked
        new Promise<{ body: string; date?: Date }[]>((_, reject) => setTimeout(() => reject(new Error('SMS query timed out')), 10000))
    ]);

    if (opts?.debug) {
        const sample = Math.max(0, Math.min(opts.sample ?? 5, messages.length));
        console.log(`[SMS] Read ${messages.length} inbox messages (showing ${sample} sample${sample === 1 ? '' : 's'})`);
        if (sample > 0) {
            for (let i = 0; i < sample; i++) {
                const m = messages[i];
                const body = String(m.body ?? '');
                const snippet = opts.logBodies !== false ? body.slice(0, 160) : '[hidden]';
                console.log(`[SMS] #${i + 1} date=${m.date?.toISOString?.() ?? 'n/a'} body=`, snippet);
            }
        }
    }

    const parsed = parseMultiple(messages);
    if (opts?.debug) {
        console.log(`[SMS] Parsed ${parsed.length} transaction${parsed.length === 1 ? '' : 's'} from messages`);
        if (parsed.length > 0) {
            const p = parsed[0];
            console.log('[SMS] First parsed transaction sample:', {
                amount: p.amount,
                type: p.type,
                category: p.category,
                merchant: p.merchant,
                date: p.date,
            });
        }
    }

    return parsed;
}
