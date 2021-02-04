const path = require('path')
const fs = require('fs')
const md5File = require('md5-file')

const filePath = path.join(__dirname, '../python/Docker Desktop Installer.exe')
const start = Date.now()
const hash = md5File.sync(filePath)
const end = Date.now()

console.log(end - start, hash)
