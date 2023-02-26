
export const BUNGIE_API_KEY = import.meta.env.VITE_BUNGIE_API_KEY;
export const BUNGIE_CLIENT_ID = import.meta.env.VITE_BUNGIE_CLIENT_ID;
export const BUNGIE_SECRET = import.meta.env.VITE_BUNGIE_SECRET;

export function oauthClientId(): string {
    return BUNGIE_CLIENT_ID;
}

export function oauthClientSecret(): string {
    return BUNGIE_SECRET;
}