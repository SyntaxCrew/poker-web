import type { AxiosResponse } from 'axios'

export interface APIResponse<T> extends AxiosResponse<T> {
    error?: string
}
