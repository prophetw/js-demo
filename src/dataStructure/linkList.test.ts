//  单向 link list
class LinkedListNode {
  next: any
  value: any
  prev: any
  constructor(val: any) {
    this.value = val
    this.next = null
    this.prev = null
  }
  insert() {}
}

describe.only(' test linked list ', () => {
  test(' 单向链表 ', () => {
    const arr = [1, 2, 3]
    let len
    let prevNode
    let firstNode
    while (((len = arr.length), len > 0)) {
      const item = arr.shift()
      const newNode = new LinkedListNode(item)
      if (prevNode) {
        prevNode.next = newNode
      } else {
        firstNode = newNode
      }
      prevNode = newNode
    }
    // [1,2,3] => 1 --> 2 --> 3
    expect(firstNode?.value).toBe(1)
    expect(firstNode?.next?.value).toBe(2)
    expect(firstNode?.next?.next?.value).toBe(3)
  })
  test(' 单向循环链表 最后一个指向第一个 ', () => {
    const arr = [1, 2, 3]
    let len
    let prevNode
    let firstNode
    while (((len = arr.length), len > 0)) {
      const item = arr.shift()
      const newNode = new LinkedListNode(item)
      if (prevNode) {
        prevNode.next = newNode
      } else {
        firstNode = newNode
      }
      prevNode = newNode
    }
    if (prevNode) {
      prevNode.next = firstNode
    }
    // [1,2,3] => 1 --> 2 --> 3 --> 1
    expect(firstNode?.value).toBe(1)
    expect(firstNode?.next?.value).toBe(2)
    expect(firstNode?.next?.next?.value).toBe(3)
    expect(firstNode?.next?.next?.next?.value).toBe(1)
  })
  test(' 双向链表', () => {
    const arr = [1, 2, 3]
    let len
    let prevNode
    let firstNode
    while (((len = arr.length), len > 0)) {
      const item = arr.shift()
      const newNode = new LinkedListNode(item)
      if (prevNode) {
        newNode.prev = prevNode
        prevNode.next = newNode
      } else {
        firstNode = newNode
      }
      prevNode = newNode
    }

    // [1,2,3] => 1 <--> 2 <--> 3 <--> 1
    expect(firstNode?.value).toBe(1)
    expect(firstNode?.next?.value).toBe(2)
    expect(firstNode?.next?.next?.value).toBe(3)
    expect(firstNode?.next?.prev?.value).toBe(1)
    expect(firstNode?.next?.next?.prev.value).toBe(2)
  })
  test(' 链表的插入 ', () => {})
})
