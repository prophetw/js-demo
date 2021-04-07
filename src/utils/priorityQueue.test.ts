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
}
const reorder = () => {
  // 变成最大堆或者最小堆
}

const swaped = (arr: any[], a: number, b: number) => {
  // 数组内部元素交换
  const tmp = arr[a]
  arr[a] = arr[b]
  arr[b] = tmp
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
    console.log(queue)
    queue.addItem(1)
    console.log(queue)
    const s = queue.getTopItem()
    console.log(queue)
    expect(1).toBe(1)
  })
})
