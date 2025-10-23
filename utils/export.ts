import type { Category, Transaction } from '@/types/finance';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

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
    try {
        const data = JSON.stringify({ transactions, categories }, null, 2);
        const dir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory ?? '';
        const fileUri = `${dir}${fileName}`;

        // Write file using legacy API
        await FileSystem.writeAsStringAsync(fileUri, data);

        // Share the file
        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri, {
                mimeType: 'application/json'
            });
        }

        return fileUri;
    } catch (error) {
        console.error('Error exporting JSON:', error);
        throw error;
    }
}

export async function exportCSV(
    transactions: Transaction[],
    fileName = 'wealthsight-transactions.csv'
) {
    try {
        const data = toCSV(transactions);
        const dir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory ?? '';
        const fileUri = `${dir}${fileName}`;

        // Write file using legacy API
        await FileSystem.writeAsStringAsync(fileUri, data);

        // Share the file
        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri, {
                mimeType: 'text/csv'
            });
        }

        return fileUri;
    } catch (error) {
        console.error('Error exporting CSV:', error);
        throw error;
    }
}
