// NOTE: nodejs 运行环境和浏览器的运行环境

console.log('start')
setTimeout(() => {
  console.log(' in setTimepit ')
}, 0)
new Promise((resolve, reject) => {
  console.log('promise start ')
  // setTimeout(() => {
  resolve('in promise')
  // }, 0)
})
  .then((res) => {
    console.log(res)
    return res
  })
  .then((res) => {
    console.log(res)
    return res
  })
  .then((res) => {
    console.log(res)
    return res
  })
  .then((res) => {
    console.log(res)
    return res
  })
// new Promise((resolve, reject) => {
//   console.log('promise')
//   // setTimeout(() => {
//   resolve('in promise')
//   // }, 0)
// }).then((res) => {
//   console.log(res)
// })

console.log('end')
