const express = require('express')
const fs = require('fs')
const app = express()
const path = require('path')
const multer = require('multer')
const expressWs = require('express-ws')(app)
const redis = require('redis')
const UploadMethod = require('./upload')
const Transform = require('./transform')
let TransformWs = null

// NOTE: 需要 win10 安装并开启redis服务 开启之后默认端口为 address: '127.0.0.1',   port: 6379
const redisClient = redis.createClient()
const port = 8120

redisClient.on('error', function (error) {
  console.error(error)
})

// parsing multipart/form-data

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(req.query)
    const { md5 } = req.query
    const targetPath = path.join(__dirname, '/tmp/my-uploads/' + md5)
    const isExist = fs.existsSync(targetPath)
    if (!isExist) {
      fs.mkdirSync(targetPath)
    }
    cb(null, targetPath)
  },
  filename: function (req, file, cb) {
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    // const { originalname } = file
    const { chunkId } = req.query
    console.log('chunkId', chunkId)
    cb(null, chunkId)
  },
})
const upload = multer({ storage: storage })

// var upload = multer({ dest: path.join(__dirname, 'temp') })

app.use(
  express.urlencoded({
    extended: true,
  }),
)

app.use(express.json())

app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'access_token, access-token,  Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild',
  )
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS')

  if (req.method == 'OPTIONS') {
    // res.send(200)
    res.sendStatus(200)
  } else {
    next()
  }
})

app.use(function (req, res, next) {
  console.log('middleware')
  req.testing = 'testing'
  return next()
})

// TODO: upload 独立出去
app.post('/upload', upload.single('file'), function (req, res, next) {
  res.end(' ok ')
})

// TODO: merge
app.get('/merge/:md5', function (req, res, next) {
  const params = req.params
  const query = req.query
  const { md5 } = params
  const { filename } = query
  console.log(filename)
  const result = UploadMethod.mergeTempBy(md5, filename, redisClient)
  res.send(result)
  // res.send(' ok ')
})

// TODO: get md5 info
const getFileDataBy = (md5) => {}
app.get('/md5/:md5', function (req, res, next) {
  var params = req.params
  const { md5 } = params
  UploadMethod.getFileInfoBy(md5, redisClient, res)
})

app.get('/transform/:md5', function (req, res, next) {
  const params = req.params
  const { md5 } = params

  Transform(md5, res, TransformWs)
  res.send({
    code: 200,
    msg: 'Transforming',
  })
  // res.send(' ok ')
})
// websocket 独立出去
app.get('/', function (req, res, next) {
  console.log('get route', req.testing)
  res.end()
})

app.ws('/transfm', function (ws, req) {
  TransformWs = ws
  ws.on('message', function (msg) {
    console.log('msg', msg)
    try {
      const obj = JSON.parse(msg)
      if (typeof obj === 'object') {
        console.log(obj.a)
        if (obj.a === '3') {
          ws.send(JSON.stringify({ data: '我知道啦' }))
        }
      }
    } catch (error) {
      ws.send('gocha!!!')
    }
  })
  console.log('socket established  ', req.testing)
})
app.ws('/', function (ws, req) {
  ws.on('message', function (msg) {
    console.log('msg', msg)
    console.log(expressWs.getWss().clients)
    try {
      const obj = JSON.parse(msg)
      if (typeof obj === 'object') {
        console.log(obj.a)
        if (obj.a === '3') {
          ws.send(JSON.stringify({ data: '我知道啦' }))
        }
      }
    } catch (error) {
      ws.send('gocha!!!')
    }
  })
  console.log(' / socket', req.testing)
})

// http
app.listen(port, (err) => {
  if (err) {
    console.error(err)
    return process.exit(1)
  } else {
    console.log(`Example app listening at http://localhost:${port}`)
  }
})
