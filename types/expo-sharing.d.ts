declare module 'expo-sharing' {
    export function isAvailableAsync(): Promise<boolean>;
    export function shareAsync(url: string, options?: { mimeType?: string }): Promise<void>;
}
