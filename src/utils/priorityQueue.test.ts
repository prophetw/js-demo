class PriorityQ {
  mode: string
  queue: []
  constructor(mode: string = 'MAXHEAP') {
    this.mode = mode
    this.queue = []
  }
  chooseLeftOrRightIndex(leftIndex: number, rightIndex: number) {
    // 大根堆
    // 和两个子元素中更大的交换
    // 小根堆
    // 子元素比较 和更小的交换
    const maxIndex = this.queue.length - 1
    if (rightIndex > maxIndex) {
      return leftIndex
    }
    if (this.mode === 'MAXHEAP') {
      return this.queue[leftIndex] > this.queue[rightIndex]
        ? leftIndex
        : rightIndex
    } else {
      return this.queue[leftIndex] > this.queue[rightIndex]
        ? rightIndex
        : leftIndex
    }
  }
  sink(itemIndex: number) {
    let parentIndex = itemIndex
    const maxIndex = this.queue.length - 1
    while (parentIndex < maxIndex) {
      const leftChildIndex = parentIndex * 2 + 1
      const rightChildIndex = parentIndex * 2 + 2
      if (maxIndex < leftChildIndex) return
      const index = this.chooseLeftOrRightIndex(leftChildIndex, rightChildIndex)
      let needSwap = this.compare(this.queue[parentIndex], index)
      if (needSwap) {
        this.swap(index, parentIndex)
        parentIndex = index
      } else {
        return
      }
    }
  }
  up(itemIndex: number) {
    // 上浮操作 新加入的元素
    // 停止条件
    // 1. 当前 item index 大于0
    // 2. 和上级比较 不需要交换
    let childIndex = itemIndex
    while (childIndex > 0) {
      const parentIndex = (childIndex - 1) >> 1
      const parent = this.queue[parentIndex]
      const child = this.queue[childIndex]
      let needSwap = this.compare(parent, child)
      if (needSwap) {
        this.swap(childIndex, parentIndex)
        childIndex = parentIndex
      } else {
        // 停止条件2
        return
      }
    }
  }
  compare(parent: number, child: number) {
    // 这个函数决定了 是否需要交换
    let needSwap = false
    if (this.mode === 'MAXHEAP') {
      // 大根堆
      if (parent < child) {
        needSwap = true
      }
    } else {
      if (parent > child) {
        // 小根堆
        needSwap = true
      }
    }
    return needSwap
  }
  swap(a: number, b: number) {
    // 数组内部元素交换
    const tmp = this.queue[a]
    this.queue[a] = this.queue[b]
    this.queue[b] = tmp
  }
  reorder() {
    // 变成最大
  }
  addItem(item) {
    this.queue.push(item)
    const itemIndex = this.queue.length - 1
    this.up(itemIndex)
  }
  getTopItem() {
    // 取出最大的或者最小的值
    const res = this.queue.shift()
    const last = this.queue[this.queue.length - 1]
    this.queue.pop()
    this.queue.unshift(last)
    this.sink(0)
    return res
  }
  getLastRowWith() {
    // 计算最后一行的宽度
    return 10
  }

  print() {
    // 打印出来 最后一排的宽度
    function whiteSpace(num: number) {
      let result = ''
      while (num > 0) {
        result += '-'
        num = num - 1
      }
      return result
    }
    const lastRowNum = getLastRowNum(this.queue)
    const lastRowWith = Math.pow(2, lastRowNum)
    let str = ''
    this.queue.map((item, index: number) => {
      const curRowNum = getLastRowNum(new Array(index + 1)) // start from 0
      const curRowWith = Math.pow(2, curRowNum)
      const curRowFirstIndex = Math.pow(2, curRowNum) - 1
      const curRowLastIndex = Math.pow(2, curRowNum + 1) - 2
      const everyBlockWith = lastRowWith / curRowWith
      if (index === curRowFirstIndex && index === curRowLastIndex) {
        // 第一行特殊处理
        str += whiteSpace(everyBlockWith)
        str += item
        str += whiteSpace(everyBlockWith - 1)
        str += '\n'
        return
      }
      if (index === curRowFirstIndex) {
        str += whiteSpace(everyBlockWith)
        str += item
        str += whiteSpace(everyBlockWith * 2 - 1)
        return
      }
      if (index === curRowLastIndex) {
        str += item
        str += whiteSpace(everyBlockWith - 1)
        str += '\n'
        return
      }
      if (curRowFirstIndex < index && index < curRowLastIndex) {
        str += item
        str += whiteSpace(everyBlockWith * 2 - 1)
        return
      }
    })
    console.log(str)
  }
}
function getLastRowNum(arr) {
  // row 是从第0行开始的
  // 计算最后的 index 在第几行0
  let res = 0
  const lastIndex = arr.length - 1
  let rowNum = 0
  while (lastIndex > -1) {
    let curRowFirstIndex = Math.pow(2, rowNum) - 1
    let nextRowFirstIndex = Math.pow(2, rowNum + 1) - 1
    if (lastIndex === curRowFirstIndex) return rowNum
    if (curRowFirstIndex < lastIndex && lastIndex < nextRowFirstIndex) {
      return rowNum
    }
    rowNum = rowNum + 1
  }
  return res
}
describe(' test queue ', () => {
  test(' test ', () => {
    const arr = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9, 3, 2, 3, 8, 4, 6]
    // 1. 一个一个取出 放入一个新的数组
    // 2. 在现有数组基础上做调整
    const queue = new PriorityQ()
    arr.map((item: number) => {
      queue.addItem(item)
    })
    queue.print()
    queue.addItem(1)
    queue.print()
    const s = queue.getTopItem()
    queue.print()
    expect(1).toBe(1)
  })
  test(' getLastRowNum ', () => {
    expect(getLastRowNum(new Array(6))).toBe(2)
    expect(getLastRowNum(new Array(7))).toBe(2)
    expect(getLastRowNum(new Array(8))).toBe(3)
    expect(getLastRowNum(new Array(15))).toBe(3)
    expect(getLastRowNum(new Array(16))).toBe(4)
    expect(getLastRowNum(new Array(1))).toBe(0)
    expect(getLastRowNum(new Array(2))).toBe(1)
  })
})
