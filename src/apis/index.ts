export const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export const defaultOptions: RequestInit = {
    headers: {
        'Content-Type': 'application/json',
    },
    credentials: 'include'
}