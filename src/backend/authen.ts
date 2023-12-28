import axios from "axios";
import type { JWT, UserType } from "../models/authen";
import client from "./client";

const hostAPI = import.meta.env.VITE_BACKEND_API_HOST;
const apiKey = import.meta.env.VITE_BACKEND_API_KEY;

export async function generateToken(userType: UserType, idToken?: string) {
    const res = await axios.request<JWT>({
        baseURL: hostAPI,
        url: `/authen/signin/${userType}`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-API-Key': apiKey,
            'X-Channel': 'tokagile',
        },
        data: { idToken },
    });

    return res.data
}

export async function refreshToken(refreshToken: string) {
    const res = await axios.request<JWT>({
        baseURL: hostAPI,
        url: '/authen/refresh',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: { refreshToken },
    });

    return res.data
}

export async function revokeToken() {
    return await client({
        url: '/authen/signout',
        method: 'POST',
    });
}
