import axios, { type AxiosRequestHeaders, HttpStatusCode, AxiosError } from "axios";
import { generateToken, refreshToken } from "./authen";
import type { AxiosRequestCustomConfig } from "./client";
import { UserType, type JWT } from "../models/authen";
import { getToken, setToken, revokeToken } from "../utils/local-storage";

const instance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_API_HOST,
    timeout: 1000 * 30,
    headers: {
        'Content-Type': 'application/json',
    },
});

instance.interceptors.request.use(
    config => {
        if (config.params) {
            for (const [key, value] of Object.entries(config.params)) {
                if (!value || (typeof value === 'string' && value.length === 0)) {
                    config.params[key] = null;
                }
            }
        }

        const { accessToken } = getToken();
        if (accessToken) {
            if (!config.headers) {
                config.headers = { "Content-Type": "application/json" } as AxiosRequestHeaders;
            }
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    },
    error => Promise.reject(error)
);

instance.interceptors.response.use(
    response => response,
    async (error: AxiosError) => {
        if (!error.response) {
            return Promise.reject(error);
        }

        const config = { ...error.config } as AxiosRequestCustomConfig;
        try {
            if (error.response.status === HttpStatusCode.Unauthorized) {
                let jwt!: JWT;

                const { refreshToken: token } = getToken();
                if (!token) {
                    jwt = await generateToken(UserType.Anonymous);

                } else {
                    try {
                        jwt = await refreshToken(token);
                        if (!jwt || !jwt.accessToken || !jwt.accessToken) {
                            throw Error('token is not found');
                        }

                    } catch (error) {
                        jwt = await generateToken(UserType.Anonymous);
                    }
                }
                if (!jwt || !jwt.accessToken || !jwt.accessToken) {
                    throw Error('token is not found');
                }

                setToken(jwt);
                if (!config.headers) {
                    config.headers = { "Content-Type": "application/json" } as AxiosRequestHeaders;
                }
                config.headers.Authorization = `Bearer ${jwt.accessToken}`;

                return instance.request(config)

            }

        } catch (errorRefresh) {
            revokeToken();
            // window.location.href = "/signin";
        }
        return Promise.reject(error);
    }
);

export default instance;