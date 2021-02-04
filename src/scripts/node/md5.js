const CryptoJS = require('crypto-js')
const crypto = require('crypto')
const cpu = require('os').cpus()
console.log(cpu.length)

const md5hash = crypto.createHash('sha256')
const MD5 = CryptoJS.algo.MD5.create()



const path = require('path')
const fs = require('fs')

const filePath = path.join(__dirname, './Country.mmdb')

const chunkSize = 512
function md5file (filePath){
  const startTime = Date.now()
  const content = fs.readFileSync(filePath)
  const len = content.length
  console.log(len);
  let startIndex = 0
  while(startIndex<len){
    const buf = content.slice(startIndex, startIndex+chunkSize)
    MD5.update(buf)
    startIndex +=chunkSize
  }
  const hash = MD5.finalize()
  const endTime = Date.now()
  console.log(' md5code', [(endTime-startTime)/1000 + 's', hash]);
}

function md5filenode (filePath){
  const startTime = Date.now()
  const content = fs.readFileSync(filePath, {encoding: 'utf-8'})
  md5hash.update(content);
  const endTime = Date.now()
  console.log(' node crypto', [(endTime-startTime)/1000 + 's',md5hash.copy().digest('hex')]);

}
md5file(filePath)
// md5filenode(filePath)

// const buf = Buffer.from('hello world i am your frient ')
// console.log(buf.toString());
// const bufA = buf.slice(0,10)
// console.log(bufA.toString());
