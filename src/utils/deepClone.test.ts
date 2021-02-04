import deepClone from './deepClone'

describe(' test Deep clone ', () => {
  describe(' deepClone ', () => {
    test(' 原始数据类型  ', () => {
      const a = 1
      const b = '1231'
      const cloneA = deepClone(a)
      const cloneB = deepClone(b)
      expect(a).toBe(cloneA)
    })
    test('object  ', () => {
      const a = { c: 1, b: [23178] }
      const cloneA = deepClone(a)
      a.b.push(3)
      expect(cloneA.b.length).toBe(1)
    })
    test.only(' 嵌套 a ', () => {
      const a = { c: 1, b: [23178], qq: {} }
      const q = { a, cc: 1231 }
      a.qq = q
      const cloneA = deepClone(a)
      console.log(' ------------------ ', cloneA)
      a.b.push(3)
      expect(cloneA.b.length).toBe(1)
    })
  })
})
