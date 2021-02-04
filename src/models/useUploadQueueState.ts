import { calculateMd5 } from '@/utils/utils'
import { UploadFile } from 'antd/lib/upload/interface'
import Axios, { AxiosPromise, AxiosRequestConfig } from 'axios'
import { clone } from 'lodash'
import { useReducer } from 'react'

// https://www.processon.com/view/link/601b67617d9c0858d770b1c2

export enum UploadStatus {
  WAITING,
  PEDING,
  RESOLVED,
  REJECTED,
}
enum MD5Status {
  EXIST_FILE,
  EXIST_TMP,
  NO_RECORD,
}
const RESPONSE_CODE = {
  EXIST_TMP_FILE_PIECE: 900010,
  NO_EXIST_TMP_FILE: 900011,
}

interface MD5Response {
  status: MD5Status
  md5: string
  chunkArr?: string[]
}

type ChunkPromisFn = () => AxiosPromise<any>
export interface UploadItem {
  status: UploadStatus
  file: File | UploadFile
  md5: string
  id: number | string
  progress?: number
  options?: AxiosRequestConfig
  callback?: () => void
  chunkUploadPromiseQueue: ChunkPromisFn[]
  chunkUploadingPromiseQueue?: ChunkPromisFn[]
}
interface CalcMD5Item {
  id: string | number
  calcPromise: Promise<string>
}
const initialState = {
  isShowUploadModal: false,
  queue: [], // waiting queue
  allQueue: [], // all upload file queue
  uploadQueue: [], // uploading queue
  maxUploadNum: 3, // 文件最大并行上传个数
  maxUploadPieceNum: 1, // 分片最大并行上传个数  同时上传请求书 maxUploadNum * maxUploadPieceNum
  resolvedQueue: [], // success queue
  rejectedQueue: [], // fail queue
  resumeUploadFeature: false, // 断点续传功能
  chunkSize: 2 * 1024 * 1024, // 10 mb
  md5CalcQueue: [], // promsieQ
  waitingForCalcMd5Queue: [],
}

let uploadId = 0

const md5 = () => {}
const md5File = () => {}

const action = (state, action) => {
  switch (action.type) {
    case 'UPDATE_STATE':
      const Obj = action.payload
      return { ...state, ...Obj }
    default:
      return { ...state }
  }
}

const useUploadQueueState = (): UploadState => {
  const [state, dispatch] = useReducer(action, initialState)

  const addToUpload = (
    uploadFile: File | UploadFile,
    options?: AxiosRequestConfig,
    callback?: () => void,
  ) => {
    add(uploadFile, options, callback)
    startUpload()
  }
  const add = (
    uploadFile: File | UploadFile,
    options: AxiosRequestConfig = {},
    callback: () => void = () => {},
  ) => {
    const clonedState = clone(state)
    let { queue, allQueue, waitingForCalcMd5Queue } = clonedState
    const uploadItem: UploadItem = {
      status: UploadStatus.WAITING,
      id: uploadId,
      md5: '',
      file: uploadFile,
      options,
      callback,
      chunkUploadPromiseQueue: [],
    }
    uploadId++
    queue.push(uploadItem)
    allQueue.push(uploadItem)
    waitingForCalcMd5Queue.push(uploadItem)
    dispatch({
      type: 'UPDATE_STATE',
      payload: { queue, allQueue },
    })
  }
  const testPromise = () => {
    return new Promise((resolve, reject) => {
      resolve('231232')
    })
      .then((res: string) => {
        return Promise.resolve(res)
      })
      .catch((err) => {
        return Promise.reject('321321')
      })
  }

  const calcMd5Promise = (item: UploadItem) => {
    const { file, md5 } = item
    return new Promise((resolve, reject) => {
      if (md5) {
        resolve(md5)
      } else {
        // TODO: use worker to calcl
        calculateMd5(file, resolve, reject)
      }
    })
      .then((res) => {
        // 1. update calc queue
        calcMd5Final(item)
        // 2. update md5 to file
        if (typeof res === 'string') {
          console.log('md5', res)
          item.md5 = res
          console.log(' state ', state)
        }
        const md5String: string = res
        return Promise.resolve(md5String)
      })
      .catch((err) => {
        // handle err
        return Promise.reject('ERROR')
      })
  }

  const calcMd5 = (item: UploadItem) => {
    const { file, md5 } = item
    if (md5) {
      return {
        calcPromise: Promise.resolve(md5),
        id: item.id,
      }
    } else {
      const calcPromise = calcMd5Promise(item)
      return {
        calcPromise,
        id: item.id,
      }
    }
  }
  const getCalcMd5Promise = (item: UploadItem) => {
    const { md5CalcQueue } = state
    const { id, md5 } = item
    if (md5) {
      return Promise.resolve(md5)
    } else {
      const res = md5CalcQueue.filter((item: CalcMD5Item) => item.id === id)
      if (res && res.length > 0) {
        const calcItem: CalcMD5Item = res[0]
        const { calcPromise } = calcItem
        return calcPromise
      } else {
        const calcPromise = calcMd5Promise(item)
        return calcPromise
      }
    }
  }
  const updateCalcQ = () => {
    const clonedState = clone(state)
    const maxCalcNum = 3
    const { md5CalcQueue, waitingForCalcMd5Queue } = clonedState
    let curCalcQLen
    while (((curCalcQLen = md5CalcQueue.length), curCalcQLen < maxCalcNum)) {
      const next = waitingForCalcMd5Queue.shift()
      if (next) {
        md5CalcQueue.push(calcMd5(next))
      } else {
        break
      }
    }
    dispatch({
      type: 'UPDATE_STATE',
      payload: { md5CalcQueue, waitingForCalcMd5Queue },
    })
  }
  const calcNextMD5 = () => {
    updateCalcQ()
  }

  const prepareQueue = () => {
    const clonedState = clone(state)
    const { uploadQueue, maxUploadNum, queue } = clonedState
    let curUploadQLen
    while (
      ((curUploadQLen = uploadQueue.length), curUploadQLen < maxUploadNum)
    ) {
      const next = queue.shift()
      if (next) {
        uploadQueue.push(next)
      } else {
        break
      }
    }
    dispatch({
      type: 'UPDATE_STATE',
      payload: { uploadQueue, maxUploadNum, queue },
    })
  }

  const uploadFile = (
    item: UploadItem,
    isUploadInChunks: boolean = false,
    startChunkIndex: number = 0,
  ) => {
    // TODO: 某一片上传失败了怎么处理
    const { options, callback, chunkUploadPromiseQueue, md5 } = item
    const { uploadQueue } = state

    const { chunkSize } = state
    let totalChunk = 1
    // a 分片
    if (isUploadInChunks) {
      totalChunk = Math.ceil(item.file.size / chunkSize)
    }
    let curChunkId = startChunkIndex // 续传

    while (curChunkId < totalChunk) {
      const startIndex = curChunkId * chunkSize
      let endIndex =
        startIndex + chunkSize > item.file.size
          ? item.file.size
          : startIndex + chunkSize
      // a 分片
      if (isUploadInChunks) {
        endIndex = item.file.size
      }
      const formData = new FormData()
      formData.append('file', item.file.slice(startIndex, endIndex))
      const params = {
        md5,
        chunkId: curChunkId,
      }

      let dftOpts: AxiosRequestConfig = {
        method: 'post',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        params,
      }
      if (process.env.NODE_ENV === 'development') {
        // 开发环境 需要通过 yarn start:e 开启 express 服务
        dftOpts = {
          url: 'http://localhost:8120/upload',
          method: 'post',
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          params,
        }
      }
      if (options) {
        // merge params
        if (options.params) {
          options.params = Object.assign({}, options.params, params)
        }
        dftOpts = Object.assign({}, dftOpts, options)
      }

      const req = () => {
        let sIndex = startIndex
        return Axios.request(
          Object.assign({}, dftOpts, {
            onUploadProgress: function (progressEvent) {
              // Do whatever you want with the native progress event
              // console.log(progressEvent)
              const { total, loaded } = progressEvent
              if (loaded) {
                let progress = Math.floor((loaded / total) * 100)
                if (isUploadInChunks) {
                  progress =
                    Math.floor((sIndex / item.file.size) * 100) +
                    Math.floor(progress * (1 / totalChunk))
                }
                item.progress = progress
                dispatch({
                  type: 'UPDATE_STATE',
                  payload: { uploadQueue },
                })
              }
            },
          }),
        )
      }

      chunkUploadPromiseQueue.push(req)
      curChunkId = curChunkId + 1
    }
    uploadFileChunks(item)
  }
  const uploadFileChunks = (item: UploadItem) => {
    const { chunkUploadPromiseQueue, callback } = item

    // TODO: 如果分段上传 确定不使用并行上传 可以使用 array reduce 改写下面的内容
    // FIXME: 错误处理
    chunkUploadPromiseQueue
      .reduce(
        (promiseChain, curPromise) => promiseChain.then(curPromise),
        Promise.resolve(''),
      )
      .then((res) => {
        // 上传完成
        console.log(' 上传完成 处理 ', res)
        console.log(' state ', state)
        item.status = UploadStatus.RESOLVED
        item.progress = 100
        uploadFinal(item)
        mergeFileChunk(item)
        if (callback && typeof callback === 'function') {
          callback()
        }
      })

    // TODO: 分片并行上传
    // FIXME: 分片数据上传过程中断网 错误处理
    return true
    let isLast = false
    if (chunkUploadPromiseQueue.length === 1) {
      isLast = true
    }
    const chunkUploadPromise = chunkUploadPromiseQueue.shift()
    if (chunkUploadPromise) {
      chunkUploadPromise().then(
        (res) => {
          console.log(' res ')
          // 最后一片的处理
          // 目前是 uploadFileChunks 来处理最后一段
          // 也可以利用 isLast 属性来处理
          if (isLast) {
            console.log(' 最后一片了 ')
            // TODO: request for merge file pieces
          }
          uploadFileChunks(item)
        },
        (err) => {
          console.log(err)
          // TODO: 上传失败的处理 两种处理方案
          // 1.某一片失败直接断掉 报错提示 用户可以点击重新上传
          //

          // 把 chunkUploadPromise 重新放进上传队列
          uploadFileChunks(item)
          // item.status = UploadStatus.REJECTED
          // uploadFinal(item)
        },
      )
    } else {
      // 上传完成
      console.log(' 上传完成 处理 ')
      console.log(' state ', state)
      item.status = UploadStatus.RESOLVED
      item.progress = 100
      uploadFinal(item)
      mergeFileChunk(item)
      if (callback && typeof callback === 'function') {
        callback()
      }
    }
  }
  const mergeFileChunk = (item: UploadItem) => {
    const { md5, file } = item
    const { name } = file
    if (process.env.NODE_ENV === 'development') {
      // 开发环境 需要通过 yarn start:e 开启 express 服务
      let dftOpts: AxiosRequestConfig = {
        url: 'http://localhost:8120/merge/' + md5,
        method: 'get',
        params: { filename: name },
      }
      Axios.request(dftOpts).then((res) => {
        console.log('merge succ ', res)
        transformFile(item)
      })
    }
  }
  const transformFile = (item: UploadItem) => {
    // websocket
    const { md5 } = item
    if (process.env.NODE_ENV === 'development') {
      // 开发环境 需要通过 yarn start:e 开启 express 服务
      let dftOpts: AxiosRequestConfig = {
        url: 'http://localhost:8120/transform/' + md5,
        method: 'get',
      }
      Axios.request(dftOpts)
    }
  }

  const getMD5Info = (md5: string) => {
    return Axios.request({
      url: 'http://localhost:8120/md5/' + md5,
      method: 'get',
    })
  }
  const uploadSingleFile = (item: UploadItem) => {
    // 上传 一个文档的完整的流程
    // 1.获取 md5
    // 2.服务端校验 md5
    // 3.分片上传
    // 4.上传完成
    //
    const clonedState = clone(state)
    const { uploadQueue } = clonedState
    const calcPromise = getCalcMd5Promise(item)
    calcPromise.then((md5) => {
      // 完成 MD5服务端校验 查询服务端是否有分片数据
      getMD5Info(md5).then(
        (res) => {
          console.log('md5 result ', res)
          const { data } = res
          // 2. 校验完成 开始上传
          if (data.code === RESPONSE_CODE.NO_EXIST_TMP_FILE) {
            // 新文件上参
            uploadFile(item, true)
          } else if (data.code === RESPONSE_CODE.EXIST_TMP_FILE_PIECE) {
            // 续传
            const filePieceDataArr = data.data
            const numberFilePieceDataArr = filePieceDataArr.map(
              (item: string) => Number(item),
            )
            const lastPieceIndex = numberFilePieceDataArr
              .sort((a: number, b: number) => a - b)
              .pop()
            console.log(' 续传 start from ', lastPieceIndex)
            uploadFile(item, true, lastPieceIndex)
          } else {
            if (data.code === 200) {
              // 服务端已存在 秒传
              item.status = UploadStatus.RESOLVED
              item.progress = 100
              dispatch({
                type: 'UPDATE_STATE',
                payload: { uploadQueue },
              })
            }
          }
        },
        (err) => {},
      )
    })
  }
  const startUpload = () => {
    const clonedState = clone(state)
    const { uploadQueue } = clonedState
    prepareQueue()

    // md5 calcQ
    updateCalcQ()

    uploadQueue.map((item: UploadItem, index: number) => {
      // 待上传 file  上传url 上传的参数
      // 上传完成的回调 可能是转换
      // 上传的流程  md5 => 分片上传 => 完成 => 转换
      // 1.获取文件 md5 异步
      // 2.md5 服务端校验 异步
      // 3.开始上传
      // 4.分片上传完成 服务端合并文件
      // 5.文件上传完成
      // 6.开始转化服务

      // TODO: 1.校验文件 md5 file  以支持文件断点续传 秒传的功能
      // TODO: 实现用 webworker 去计算 md5
      // 计算md5的时候实际上就会把 文件进行分片计算 共用这个分片理论上效果应该是最好的

      // spark-md5 DOC: https://npmdoc.github.io/node-npmdoc-spark-md5/build/apidoc.html#apidoc.module.spark-md5
      // NOTE: 目前先用文件名
      // const fileMD5 = SparkMD5.hash(item.file.name)

      if (item.status === UploadStatus.WAITING) {
        item.status = UploadStatus.PEDING
        dispatch({
          type: 'UPDATE_STATE',
          payload: { uploadQueue },
        })
        uploadSingleFile(item)
      } else {
        console.log(' --- requesting ')
      }
    })
  }
  const uploadNext = () => {
    startUpload()
  }
  const calcMd5Final = (calcItem: UploadItem) => {
    const clonedState = clone(state)
    const { md5CalcQueue } = clonedState
    const { id } = calcItem
    let deleteItemIndex = -1
    md5CalcQueue.map((item: UploadItem, index: number) => {
      if (item.id === id) {
        deleteItemIndex = index
      }
    })
    if (deleteItemIndex > -1) {
      md5CalcQueue.splice(deleteItemIndex, 1)
    }
    calcNextMD5()
  }
  const uploadFinal = (uploadItem: UploadItem) => {
    // 上传结束 不管是上传失败还是成功
    const clonedState = clone(state)
    const { uploadQueue } = clonedState
    const { id } = uploadItem
    let deleteItemIndex = -1
    uploadQueue.map((item: UploadItem, index: number) => {
      if (item.id === id) {
        deleteItemIndex = index
      }
    })
    if (deleteItemIndex > -1) {
      uploadQueue.splice(deleteItemIndex, 1)
    }
    uploadNext()
  }
  const setMaxUploadNum = (maxNum: number) => {
    const maxUploadNum = maxNum
    dispatch({
      type: 'UPDATE_STATE',
      payload: { maxUploadNum },
    })
  }
  const clear = () => {
    dispatch({
      type: 'UPDATE_STATE',
      payload: { allQueue: [] },
    })
  }
  const showUploadModal = () => {
    dispatch({
      type: 'UPDATE_STATE',
      payload: { isShowUploadModal: true },
    })
  }
  const closeUploadModal = () => {
    dispatch({
      type: 'UPDATE_STATE',
      payload: { isShowUploadModal: false },
    })
  }
  const resumeUpload = () => {
    // TODO: 继续上传
  }
  const pauseUpload = () => {
    // TODO: 暂停上传
  }

  return {
    ...state,
    addToUpload,
    clear,
    showUploadModal,
    closeUploadModal,
  }
}

interface UploadState {
  isShowUploadModal: boolean
  queue: UploadItem[]
  allQueue: UploadItem[]
  uploadQueue: UploadItem[]
  maxUploadNum: number
  resolvedQueue: UploadItem[]
  rejectedQueue: UploadItem[]
  addToUpload: (
    uploadFile: File | UploadFile,
    options?: AxiosRequestConfig,
  ) => void
  clear: () => void
  showUploadModal: () => void
  closeUploadModal: () => void
}
export default useUploadQueueState
