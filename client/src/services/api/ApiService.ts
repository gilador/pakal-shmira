import qs from 'qs'
import axios, { AxiosRequestConfig, AxiosResponse, AxiosInstance } from 'axios'
import { OptimizeShiftRequest, OptimizeShiftResponse } from './models'

const GET_TOKEN_DEFAULT_TIMEOUT = 3000
class ApiService {
  private axiosInstance: AxiosInstance
  private authToken: string

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: 'http://127.0.0.1:8190',
      timeout: 500,
      headers: {
        contentType: 'application/json'      },
      paramsSerializer: (params: any) => qs.stringify(params, { arrayFormat: 'repeat' }),
    })

    this.authToken = ''

    // this.axiosInstance.interceptors.request.use(this.requestMiddleware.bind(this))
    // this.axiosInstance.interceptors.response.use(this.responseMiddleware.bind(this))
  }

  public async optimizeShift(constraints: number[][][]): Promise<OptimizeShiftResponse>{
    console.log('optimizeShift')
    const url = "/api/getOptimizedShift"
    //mock
    // const data = {"mat":[[1, 1, 1, 1,0,1,0,1], [1, 0, 1, 1,1,0,1,0],[1, 0, 1, 1,1,0,1,0]],"posts":2}
    const data = {"constraints":constraints}
    const response: OptimizeShiftResponse = await this.post(url,data)
    console.log(`optimizeShift respose: ${JSON.stringify(response)}`)
    return response
  }
  // public setAuthToken(token: string): void {
  //   this.authToken = `Bearer ${token}`
  // }

  // public getAuthToken(): string {
  //   return this.authToken ? this.authToken.replace('Bearer ', '') : ''
  // }

  // public async refreshToken(): Promise<string> {
  //   const response: RefreshTokenResponse = await this.post('/auth/refresh', null, {
  //     timeout: GET_TOKEN_DEFAULT_TIMEOUT,
  //   })
  //   await AsyncStorage.set(AUTH_TOKEN_STORAGE_KEY, response.jwt)
  //   this.setAuthToken(response.jwt)
  //   return response.jwt
  // }

  private async post(url: string, data?: any, config?: AxiosRequestConfig): Promise<any> {
    const response: AxiosResponse = await this.axiosInstance.post(url, data, config)
    return response.data
  }

  private async get(url: string, config?: AxiosRequestConfig): Promise<any> {
    const response: AxiosResponse = await this.axiosInstance.get(url, config)
    return response.data
  }

  private async patch(url: string, data?: any, config?: AxiosRequestConfig): Promise<any> {
    const response: AxiosResponse = await this.axiosInstance.patch(url, data, config)
    return response.data
  }

  private requestMiddleware(config: AxiosRequestConfig): AxiosRequestConfig {
    if (this.authToken) {
      config.headers.Authorization = this.authToken
    } else {
      delete config.headers.Authorization
    }

    return config
  }

  // private responseMiddleware(response: AxiosResponse): AxiosResponse {
  //   if (
  //     response.data &&
  //     (response.headers['content-type'] as string).includes('application/json')
  //   ) {
  //     response.data = camelizeKeys(response.data)
  //   }

  //   return response
  // }
}

export default new ApiService()
