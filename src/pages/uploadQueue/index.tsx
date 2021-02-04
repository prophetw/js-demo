import React, { useEffect, useRef, useState } from 'react'
import AddNewModel from './AddNewModel'
import { message } from 'antd'
import styles from './index.less'
import UploadUI from './uploadUI'

const ModelManager = () => {
  useEffect(() => {
    // TODO: websocket 创建放在合适的位置
    const ws = new WebSocket('ws://localhost:8120/transfm')
    ws.onopen = function (evt) {
      console.log('Connection open ...')
      ws.send('Hello WebSockets!')
    }
    ws.onmessage = function (evt) {
      console.log('Received Message: ' + evt.data)
      console.log(evt.data)
      try {
        const data = JSON.parse(evt.data)
        if (data.code === '200' || data.code === 200) {
          message.success(data.msg + ': file md5' + data.md5)
        }
      } catch (e) {}
      // ws.close()
    }
    ws.onclose = function (evt) {
      console.log('Connection closed.')
    }
    return () => {
      // 退出断开 websocket
      // ws.close()
    }
  }, [])
  return (
    <div className={styles.model_manage_container}>
      <AddNewModel />
      <UploadUI />
    </div>
  )
}

export default ModelManager
