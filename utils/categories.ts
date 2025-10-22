export const MerchantCategoryMap: { match: RegExp; categoryId: string }[] = [
    { match: /swiggy|zomato/i, categoryId: 'food' },
    { match: /amazon|flipkart|myntra/i, categoryId: 'shopping' },
    { match: /uber|ola|rapido|metro|bus/i, categoryId: 'transport' },
    { match: /electricity|water|gas|postpaid|broadband|recharge/i, categoryId: 'bills' },
    { match: /net salary|salary|payslip|credited by employer/i, categoryId: 'salary' },
    { match: /netflix|spotify|prime|bookmyshow|pvr/i, categoryId: 'entertainment' },
];

export function autoAssignCategory(merchantOrText?: string): string | undefined {
    if (!merchantOrText) return undefined;
    for (const { match, categoryId } of MerchantCategoryMap) {
        if (match.test(merchantOrText)) return categoryId;
    }
    return undefined;
}
