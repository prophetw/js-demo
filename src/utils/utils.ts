import { UploadFile } from 'antd/lib/upload/interface'
import SparkMD5 from 'spark-md5'

export function calculateMd5(
  inputFile: File | UploadFile,
  callback: (value: any) => void,
  errCallback?: (errMsg: any) => void,
) {
  // TODO: add progress
  // 经过测试
  // fileSize chunksize cost
  // 4G       4M        70s
  // 460M     4M        5.8s
  // 247M     4M        3.3s
  // 13.6M    4M        0.21s
  // 4G       2M        55s
  // 460M     2M        6.17s
  // 247M     2M        3.47s
  // 13.6M    2M        0.23s
  // 4G       3M        53s
  // 460M     3M        6.08s
  // 247M     3M        3.452s
  // 13.6M    3M        0.226s
  const blobSlice = File.prototype.slice
  const file = inputFile
  const chunkSize = 2 * 1024 * 1024 // 2MB 每次读取的值
  const chunks = Math.ceil(file.size / chunkSize)
  let curChunk = 0
  const spark = new SparkMD5.ArrayBuffer()
  // return new Promise((resolve, reject) => {
  const startTime = Date.now()
  var fileReader = new FileReader()
  fileReader.onloadend = function (e) {
    if (e && e.target && e.target.result) {
      spark.append(e.target.result)
      curChunk++
      if (curChunk < chunks) {
        // console.log(' read chunk curChunk: ', curChunk, ' of ', chunks)
        loadNext()
      } else {
        const endTime = Date.now()
        const md5 = spark.end()
        console.log('md5 ', md5)
        console.log(' time cost ', (endTime - startTime) / 1000 + 's')
        callback && callback(md5)
      }
    }
  }
  function loadNext() {
    const start = curChunk * chunkSize
    const end = start + chunkSize >= file.size ? file.size : start + chunkSize
    fileReader.readAsArrayBuffer(blobSlice.call(file, start, end))
  }
  loadNext()
}
