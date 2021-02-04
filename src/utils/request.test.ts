import { applyDataToUrl } from './request'
describe(' request.js ', () => {
  it(' applyDataToUrl  ', () => {
    let url = '/get/user/:userid'
    let data = {
      userid: '123',
    }
    let result = applyDataToUrl(url, data)
    expect(result).toBe('/get/user/123')
    expect(data).toStrictEqual({})
  })
  it(' applyDataToUrl  ', () => {
    let url = '/get/user/:userid/:group'
    let data = {
      userid: '123',
      group: 'qqq',
      test: '123',
    }
    let result = applyDataToUrl(url, data)
    expect(result).toBe('/get/user/123/qqq')
    expect(data).toStrictEqual({ test: '123' })
  })
})
