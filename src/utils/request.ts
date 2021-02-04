import { message } from 'antd'
import axios, { AxiosRequestConfig } from 'axios'
import { cloneDeep } from 'lodash'
import { getCookie } from './utils'

export const applyDataToUrl = (url: string, data: Record<string, string>) => {
  // url = query/user/:userid   data { userid: 8283131, ID:123 }
  // result url = query/user/8283131
  // data {ID:123}
  // 剩余的data参数 会根据请求的不同 放到 请求的url里面或者请求的body里面
  if (typeof data !== 'object') {
    return url
  }
  for (let key in data) {
    if (url.indexOf(':' + key) > -1) {
      url = url.replace(':' + key, data[key])
      delete data[key]
    }
  }
  return url
}
export default function request(options: {
  method: string
  url: string
  data: any
  AxiosOptions: AxiosRequestConfig
}): Promise<{
  success: boolean
  data: any
  code: number
  msg: string
  status: number
}> {
  let access_token = getCookie('ldbp_curToken') || ''
  // console.log(access_token)
  const { method = 'get', data = {}, AxiosOptions = {} } = options
  //  data 根据 method 的不同，
  //  get  data 的数据都会在 url 里面, 也就是 AxiosOptions.params 里面
  //  post data 默认作为body 想要往url里面传参数 可以利用 AxiosOptions.params={paramA: xxx}
  let { url } = options
  let clonedData = cloneDeep(data)
  // console.log(' clonedData ', clonedData);
  url = applyDataToUrl(url, clonedData)

  let opts: AxiosRequestConfig = {
    url,
    method,
  }
  if (method === 'get') {
    opts.params = clonedData
  } else {
    // POST DELETE
    // post url params 可以利用 AxiosOptions 传递  https://github.com/axios/axios#request-config
    // AxiosOptions = { params: {ID: 1234} } =>  https:xxx.api.com?ID=1234
    // `data` is the data to be sent as the request body
    // Only applicable for request methods 'PUT', 'POST', 'DELETE , and 'PATCH'
    if (clonedData && Object.keys(clonedData).length > 0) {
      opts.data = clonedData
    }
  }
  opts = Object.assign({}, opts, AxiosOptions)
  let result: {
    success: boolean
    data: any
    code: number
    msg: string
    status: number
  } = {
    success: true,
    data: null,
    code: 200,
    msg: '',
    status: 200,
  }
  if (access_token) {
    axios.defaults.headers.common['access_token'] = access_token
  }
  return axios.request(opts).then(
    (res) => {
      // console.log(' axios response ', res)
      if (res.status === 200 && res.data && res.data.code === 200) {
        result = {
          success: true,
          data: res.data.data || null,
          code: res.data.code,
          msg: res.data.msg,
          status: res.status,
        }
        // console.log('axios result succ ', result)
        return Promise.resolve(result)
      } else {
        result = {
          success: false,
          data: res.data,
          status: res.status,
          code: res.data.code,
          msg: res.data.msg || res.statusText,
        }
        // console.log('axios result fail ', result)
        if (res.data && res.data.msg) {
          message.error(res.data.msg)
        }
        return Promise.reject(result)
      }
    },
    (err) => {
      if (err instanceof Error) {
        const msg = err.message
        message.error(msg)
      }
      console.error(err)
      return Promise.reject(err)
    },
  )
}
