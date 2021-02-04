import React, { useContext, useState } from 'react'
import { Button, Modal, Upload, message } from 'antd'
import styles from './index.less'
import { UploadOutlined } from '@ant-design/icons'
import { clone } from 'lodash'
import { UploadFile } from 'antd/es/upload/interface'
import { SelectValue } from 'antd/lib/select'
import { useModel } from 'umi'

interface UploadItem {
  saveTo: string
  fileList: UploadFile[]
}
interface AddNewModelProps {
  style?: any
  className?: string
}

const AddNewModel = (props: AddNewModelProps) => {
  const uploadState = useModel('useUploadQueueState', (model) => model)
  console.log(uploadState)
  const { showUploadModal, addToUpload } = uploadState
  const [isModalVisible, setVisibal] = useState(false)
  const [isLoading, setLoading] = useState(false)
  const sampleUploadItem: UploadItem = {
    saveTo: '',
    fileList: [],
  }
  const [uploadList, setUploadList] = useState([sampleUploadItem])
  // console.log(' new upload list ', uploadList)
  const resetModal = () => {
    // console.log(' reset logic here ')
    setUploadList([sampleUploadItem])
  }
  const handleCancel = () => {
    resetModal()
    setVisibal(false)
  }
  const closeModel = handleCancel
  const handleAddNew = () => {
    console.log(uploadList)
    const originList = [...uploadList]
    console.log(originList)
    originList.push(sampleUploadItem)
    setUploadList(originList)
  }
  const validUploadList = () => {
    return true
  }
  const handleOk = () => {
    const isValid = validUploadList()
    if (isValid) {
      showUploadModal()
      uploadList.map((item) => {
        const { saveTo } = item
        item.fileList.map((file: UploadFile) => {
          addToUpload(file, {
            params: { appid: saveTo },
          })
        })
      })
      closeModel()
    }
    console.log('click ok btn', uploadList)
  }
  const onSelectChange = (
    saveToValue: SelectValue,
    uploadItem: UploadItem,
    uploadItemIndex: number,
  ) => {
    console.log(' saveToValue ', saveToValue)
    updateUploadListBy('saveTo', saveToValue, uploadItemIndex)
  }
  const updateUploadListBy = (
    updateKey: string,
    newValue: any,
    updateIndex: number,
  ) => {
    return setUploadList((uploadList) => {
      const newUploadList = clone(uploadList)
      const newUploadItem = clone(uploadList[updateIndex])
      newUploadItem[updateKey] = newValue
      newUploadList[updateIndex] = newUploadItem
      return newUploadList
    })
  }
  let { style } = props
  let stl = {}
  if (style) {
    stl = Object.assign({}, style, stl)
  }
  return (
    <>
      <Button
        style={Object.assign({}, stl)}
        className={styles.add_new_model_btn}
        onClick={() => setVisibal(true)}
      >
        新增模型
      </Button>
      <Modal
        title="新增模型"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button key="add" onClick={handleAddNew}>
            新增
          </Button>,
          <Button key="back" onClick={handleCancel}>
            取消
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={isLoading}
            onClick={handleOk}
          >
            保存
          </Button>,
        ]}
      >
        <div>
          {uploadList &&
            uploadList.map((uploadItem: UploadItem, index) => {
              const { fileList } = uploadItem
              const props = {
                onRemove: (file: UploadFile) => {
                  const fileIndex = fileList.indexOf(file)
                  const newFileList = fileList.slice()
                  newFileList.splice(fileIndex, 1)
                  updateUploadListBy('fileList', newFileList, index)
                },
                beforeUpload: (
                  file: UploadFile,
                  uploadFileList: UploadFile[],
                ) => {
                  // 当选中多个同时上传的时候 这个方法几乎是同时触发
                  // 类型
                  // if (file.type !== 'image/png') {
                  //   message.error(`${file.name} 仅支持 png 格式`)
                  //   return false
                  // }
                  const lastFile = uploadFileList[uploadFileList.length - 1]
                  if (lastFile.uid === file.uid) {
                    const newFileList = [...fileList, ...uploadFileList]
                    updateUploadListBy('fileList', newFileList, index)
                  }
                  return false
                },
                fileList,
              }
              return (
                <div key={index} className={styles.upload_item}>
                  <Upload multiple {...props}>
                    <Button icon={<UploadOutlined />}>选择文件</Button>
                  </Upload>
                </div>
              )
            })}
        </div>
      </Modal>
    </>
  )
}

export default AddNewModel
