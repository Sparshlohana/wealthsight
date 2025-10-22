import type { Category, Transaction } from '@/types/finance';
import * as FileSystem from 'expo-file-system';

function toCSV(transactions: Transaction[]): string {
    const header = 'id,amount,type,category,description,date,merchant,source\n';
    const rows = transactions
        .map((t) =>
            [
                t.id,
                t.amount,
                t.type,
                t.category,
                (t.description ?? '').replace(/,/g, ' '),
                t.date,
                (t.merchant ?? '').replace(/,/g, ' '),
                t.source ?? 'manual',
            ]
                .map((v) => (typeof v === 'string' ? `"${v.replace(/"/g, '""')}"` : String(v)))
                .join(',')
        )
        .join('\n');
    return header + rows + '\n';
}

export async function exportJSON(
    transactions: Transaction[],
    categories: Category[],
    fileName = 'wealthsight-export.json'
) {
    const data = JSON.stringify({ transactions, categories }, null, 2);
    const fs: any = FileSystem as any;
    const dir: string = fs.cacheDirectory ?? fs.documentDirectory ?? '';
    const fileUri = `${dir}${fileName}`;
    await FileSystem.writeAsStringAsync(fileUri, data);
    try {
        const Sharing: any = await import('expo-sharing');
        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri, { mimeType: 'application/json' });
        }
    } catch {
        // Sharing not available on this platform
    }
    return fileUri;
}

export async function exportCSV(
    transactions: Transaction[],
    fileName = 'wealthsight-transactions.csv'
) {
    const data = toCSV(transactions);
    const fs: any = FileSystem as any;
    const dir: string = fs.cacheDirectory ?? fs.documentDirectory ?? '';
    const fileUri = `${dir}${fileName}`;
    await FileSystem.writeAsStringAsync(fileUri, data);
    try {
        const Sharing: any = await import('expo-sharing');
        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri, { mimeType: 'text/csv' });
        }
    } catch {
        // Sharing not available
    }
    return fileUri;
}
