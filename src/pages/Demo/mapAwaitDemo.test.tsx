function hello(s: number) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(s)
    }, 400)
  })
}
// jest.useFakeTimers()
describe('map await async', () => {
  test('qqq', async () => {
    expect(1).toBe(1)
  })
  test('qq', async () => {
    const q = await hello(1)
    const a = [1, 2, 3, 4]
    const res = await Promise.all(
      a.map(async (item) => {
        const w = await hello(item)
        const res1 = await Promise.all(
          a.map(async (item) => {
            const ee = await hello(item)
            return ee
          }),
        )
        console.log('res1', res1)
        res1.push(w)
        return res1
      }),
    )
    console.log(res)
    // jest.runAllTimers()
    expect(q).toBe(1)
  })
})
