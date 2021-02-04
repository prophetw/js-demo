import React, { useContext, useState } from 'react'
import { Button, Input, Progress, Upload } from 'antd'
import { UploadStatus } from '@/models/useUploadQueueState'
// import { useUploadState } from '../../models/useUploadQueueState'
import styles from './uploadUI.less'
import { UploadFile } from 'antd/lib/upload/interface'
import { useModel } from 'umi'
import {
  CloseCircleOutlined,
  DownOutlined,
  UpOutlined,
} from '@ant-design/icons'
import { UploadItem } from '@/models/useUploadQueueState'
const getFileStatus = (status: UploadStatus) => {
  switch (status) {
    case UploadStatus.PEDING:
      return '上传中'
    case UploadStatus.WAITING:
      return '等待中'
    case UploadStatus.REJECTED:
      return '上传失败'
    case UploadStatus.RESOLVED:
      return '上传成功'
  }
}
const UploadUI = () => {
  const uploadState = useModel('useUploadQueueState', (model) => model)
  const [uploadListContainerMaxHeight, setHeight] = useState(250)
  // const uploadState = useUploadState()
  const a = 1
  const {
    allQueue,
    addToUpload,
    clear,
    isShowUploadModal,
    closeUploadModal,
  } = uploadState
  const [fileList, setList] = useState<UploadFile[]>([])
  const [file, setFile] = useState<File>()
  // console.log(' upload state ', uploadState)
  const add = () => {
    console.log(fileList)
    fileList.map((file) => {
      addToUpload(file)
    })
  }
  const selectFile = (e) => {
    console.log(e.target)
    const input = e.target
    const file = input.files[0]
    addToUpload(file)
  }
  if (isShowUploadModal) {
    return (
      <div className={styles.upload_container}>
        <div className={styles.progress_header}>
          上传列表
          <div>
            {uploadListContainerMaxHeight !== 0 && (
              <DownOutlined
                onClick={() => {
                  setHeight(0)
                }}
              />
            )}
            {uploadListContainerMaxHeight === 0 && (
              <UpOutlined
                onClick={() => {
                  setHeight(250)
                }}
              />
            )}
            <CloseCircleOutlined
              style={{ marginLeft: 14 }}
              onClick={closeUploadModal}
            />
          </div>
        </div>
        <div
          className={styles.upload_item_container}
          style={{ maxHeight: uploadListContainerMaxHeight }}
        >
          {allQueue.map((item: UploadItem, index: number) => {
            return (
              <div key={item.id}>
                <div>
                  <div>{item.file.name}</div>
                  <div className={styles.f_12}>
                    {getFileStatus(item.status)}
                  </div>
                </div>
                <Progress percent={item.progress} type="circle" width={30} />
              </div>
            )
          })}
        </div>
      </div>
    )
  } else {
    return <></>
  }
}

export default UploadUI
