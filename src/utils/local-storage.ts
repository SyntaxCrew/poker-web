import { jwtDecode } from 'jwt-decode';
import { AccessToken, JWT } from "../models/authen";

const tokenKey = "token";

export const setToken = (jwt: JWT) => localStorage.setItem(tokenKey, JSON.stringify(jwt))
export const revokeToken = () => localStorage.removeItem(tokenKey)
export const getToken = (): JWT => {
    try {
        const token = localStorage.getItem(tokenKey);
        if (!token) {
            throw Error('token not found');
        }
        return JSON.parse(token) as JWT
    } catch (error) {
        return {
            accessToken: '',
            refreshToken: '',
        }
    }
}

export const decodeToken = (opt?: { isCheckExpire?: boolean }): AccessToken | undefined => {
    try {
        const jwt = getToken();
        if (!jwt || !jwt.accessToken || !jwt.refreshToken) {
            throw Error('token not found');
        }
        const token = jwtDecode(jwt.accessToken) as AccessToken;
        if (opt?.isCheckExpire) {
            const now = new Date().getTime() / 1000;
            if (now > token.exp) {
                throw Error('token is expired');
            }
        }
        return token;
    } catch (error) {
        return;
    }
}

export function getItem<T>(key: string, isJSON?: boolean) {
    const data = localStorage.getItem(key);
    if (data) {
        if (isJSON) {
            return JSON.parse(data) as T;
        }
        return data as T;
    }
}
