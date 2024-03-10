import axios, { AxiosRequestConfig, AxiosResponse, AxiosInstance } from 'axios'
import qs from 'qs'

import { OptimizeShiftRequest, OptimizeShiftResponse } from './models'

const GET_TOKEN_DEFAULT_TIMEOUT = 3000
class ApiService {
    private axiosInstance: AxiosInstance
    private authToken: string

    constructor() {
        this.axiosInstance = axios.create({
            baseURL: 'http://127.0.0.1:8190',
            timeout: 3000,
            headers: {
                contentType: 'application/json',
            },
            paramsSerializer: (params: any) =>
                qs.stringify(params, { arrayFormat: 'repeat' }),
        })

        this.authToken = ''

        const requestMiddleware = (config: any) => {
            // if (this.authToken) {
            //   config.headers.Authorization = this.authToken
            // } else {
            //   delete config.headers.Authorization
            // }

            console.log(`ApiService->request: ${JSON.stringify(config)}`)

            return config
        }

        this.axiosInstance.interceptors.request.use(requestMiddleware)
        this.axiosInstance.interceptors.response.use(
            this.responseMiddleware.bind(this)
        )
    }

    public async optimizeShift(
        constraints: boolean[][][]
    ): Promise<OptimizeShiftResponse> {
        console.log('optimizeShift')
        const url = '/api/getOptimizedShift'
        const data = { constraints: constraints }
        const response: OptimizeShiftResponse = await this.post(url, data)
        return response
    }

    private async post(
        url: string,
        data?: any,
        config?: AxiosRequestConfig
    ): Promise<any> {
        const response: AxiosResponse = await this.axiosInstance.post(
            url,
            data,
            config
        )
        return response.data
    }

    private async get(url: string, config?: AxiosRequestConfig): Promise<any> {
        const response: AxiosResponse = await this.axiosInstance.get(
            url,
            config
        )
        return response.data
    }

    private async patch(
        url: string,
        data?: any,
        config?: AxiosRequestConfig
    ): Promise<any> {
        const response: AxiosResponse = await this.axiosInstance.patch(
            url,
            data,
            config
        )
        return response.data
    }

    private requestMiddleware(config: AxiosRequestConfig): AxiosRequestConfig {
        // if (this.authToken) {
        //   config.headers.Authorization = this.authToken
        // } else {
        //   delete config.headers.Authorization
        // }

        console.log(`ApiService->response: ${JSON.stringify(config)}`)

        return config
    }

    private responseMiddleware(response: AxiosResponse): AxiosResponse {
        // if (response.data && (response.headers['content-type'] as string).includes('application/json')
        // ) {
        //   response.data = camelizeKeys(response.data)
        // }
        console.log(`ApiService->response: ${JSON.stringify(response)}`)

        return response
    }
}

export default new ApiService()
