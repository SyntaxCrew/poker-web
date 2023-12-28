import axios, { AxiosError, HttpStatusCode, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import instance from './interceptor';
import { APIResponse } from '../models/api';

const axiosController: Controller = {};

interface Controller {
    [uuid: string]: AbortController[]
}

export interface AxiosRequestCustomConfig extends AxiosRequestConfig {
    signalUUID?: string
}

export default async function client<T>(config: AxiosRequestCustomConfig): Promise<AxiosResponse<T>> {
    const controller = new AbortController();
    if (!config.signal) {
        config.signal = controller.signal;
    }

    try {
        if (config?.signalUUID) {
            if (axiosController[config.signalUUID]) {
                axiosController[config.signalUUID].forEach(ctrl => ctrl.abort())
            }
            axiosController[config.signalUUID] = [];
            axiosController[config.signalUUID].push(controller)
        }

        let response!: APIResponse<T>;
        await instance.request<T>({ ...config })
            .then(res => response = res)
            .catch((err: AxiosError) => {
                if (err.response?.status === HttpStatusCode.InternalServerError) {
                    // goto("/internal-server-error");
                }
                response.status = err.response?.status || HttpStatusCode.InternalServerError
                response.error = err.response?.data as string
            })
        return response

    } catch(error) {
        if (!axios.isCancel(error)) {
            const err = error as AxiosError<{error: string}>
            return Promise.reject(err)
        }
        return Promise.reject(error)
    }
}
