// Decode base64 string to uts-8 string
export function decodeBase64(base64String: string) {
    return Buffer.from(base64String, 'base64').toString('utf-8');
}