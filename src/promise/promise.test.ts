import PromiseFn from './promise'
jest.setTimeout(5000)

/**
 *
 *  文档
 *  https://tc39.es/ecma262/#sec-promise-objects
 *  https://promisesaplus.com/
 *
 */

describe(' test promisefn', () => {
  beforeEach(() => {})

  describe(' Promise States ', () => {
    test(' Promise States pending ', () => {
      const a = new PromiseFn((resolver, reject) => {})
      expect(a.status).toBe('pending')
    })
    test(' Promise States fulfilled ', () => {
      const a = new PromiseFn((resolver, reject) => resolver(1))
      expect(a.status).toBe('fulfilled')
    })
    test(' Promise States rejected ', () => {
      const a = new PromiseFn((resolver, reject) => reject(1))
      expect(a.status).toBe('rejected')
    })
  })
  describe(' The then Method ', () => {
    describe(' Both onFulfilled and onRejected are optional arguments:', () => {
      test('If onFulfilled is not a function, it must be ignored.', () => {
        const a = new PromiseFn((resolver, reject) => resolver(1)).then()
        expect(a.status).toBe('fulfilled')
      })
      test('If onRejected is not a function, it must be ignored.', () => {
        const a = new PromiseFn((resolver, reject) => resolver(1)).then()
        expect(a.status).toBe('fulfilled')
      })
    })

    describe('If onFulfilled is a function:', () => {
      // NOTE:  这个是 setTimeout 的用法 https://jestjs.io/docs/en/timer-mocks
      jest.useFakeTimers()
      const callback = (resolve: () => void) => setTimeout(resolve, 2000)
      test('it must be called after promise is fulfilled, with promise’s value as its first argument.', () => {
        return new PromiseFn((resolver, reject) => {
          callback(() => resolver(1))
          jest.runAllTimers()
        }).then((res) => {
          expect(res).toBe(1)
        })
      })
      test(' 另外一种调用形式 ', () => {
        const a = new PromiseFn((resolver, reject) => {
          resolver(1)
        })
        a.then((res) => {
          expect(res).toBe(1)
        })
      })
      test('it must not be called before promise is fulfilled', () => {
        const a = new PromiseFn((resolver, reject) => {}).then((res) => {
          expect(res).toBe(1)
        })
        expect(a.status).toBe('pending')
      })
      test('it must not be called more than once', () => {
        const a = new PromiseFn((resolver, reject) => {
          resolver(12)
        }).then((res) => {
          expect(res).toBe(12)
        })
      })
    })
    describe('If onRejected is a function, ', () => {
      test('it must be called after promise is rejected, with promise’s reason as its first argument.', () => {
        // expect.assertions(3)
        const a = new PromiseFn((resolver, reject) => {
          reject(12)
        }).then(undefined, (reason) => {
          expect(reason).toBe(12)
        })
      })
      test('it must not be called before promise is rejected.', () => {})
      test('it must not be called more than once.', () => {})
    })
    describe(' 2.2.4 onFulfilled or onRejected must not be called until the execution context stack contains only platform code. [3.1].', () => {
      // 3.1 描述  https://promisesaplus.com/#notes
      // platform code means engine, environment, and promise implementation code
      // In practice, this requirement ensures that onFulfilled and onRejected execute asynchronously,
      // after the event loop turn in which then is called, and with a fresh stack.
      // This can be implemented with either a “macro-task” mechanism such as setTimeout or setImmediate,
      // or with a “micro-task” mechanism such as MutationObserver or process.nextTick.
      // 实际情况就是 onFulfilled onRejected 必须异步执行
      // 异步执行的方式 可以通过 macro-task 宏任务 或者通过 微任务的方式实现
      // 也即 queueMicrotask(onFulfilled) setTimeout(onFulfilled,0)
      test(' promise then 是一个微任务,主进程同步代码执行完成之后，开始执行微任务队列里面的代码 ', () => {
        let mainContext = 'start'
        const a = new PromiseFn((resolve) => {
          resolve(1)
        }).then((res) => {
          expect(mainContext).toBe('end')
        })
        mainContext = 'end'
      })
    })
    describe('then may be called multiple times on the same promise', () => {
      test('If/when promise is fulfilled, all respective onFulfilled callbacks must execute in the order of their originating calls to then', () => {
        const a = new PromiseFn((resolver, reject) => {
          resolver(1)
        })
          .then((res) => {
            expect(res).toBe(1)
          })
          .then((res) => {
            expect(res).toBe(1)
          })
          .then((res) => {
            expect(res).toBe(1)
          })
      })
      test('If/when promise is rejected, all respective onRejected callbacks must execute in the order of their originating calls to then', () => {
        const a = new PromiseFn((resolver, reject) => {
          reject(1)
        })
          .then(undefined, (res) => {
            expect(res).toBe(1)
          })
          .then(undefined, (res) => {
            expect(res).toBe(1)
          })
          .then(undefined, (res) => {
            expect(res).toBe(1)
          })
      })
    })
    describe('then must return a promise ', () => {
      // 一下测试基于 promise2 = promise1.then(onFulfilled, onRejected);
      test(' then must return a promise ', () => {
        const a = new PromiseFn((resolver, reject) => {
          reject(1)
        }).then(undefined, (res) => {
          expect(res).toBe(1)
        })
        expect(a instanceof PromiseFn).toBeTruthy()
      })
      test('If either onFulfilled or onRejected returns a value x, run the Promise Resolution Procedure [[Resolve]](promise2, x)', () => {
        // will be test in Promise Resolution Procedure
      })
      test('If either onFulfilled or onRejected throws an exception e, promise2 must be rejected with e as the reason.', () => {
        const promise2 = new PromiseFn((resolver, reject) => {
          resolver(1)
        }).then((res) => {
          expect(res).toBe(1)
          JSON.parse('')
        })
        promise2.then(undefined, (reason) => {
          expect(reason).toBe('no')
        })
        const promise3 = new PromiseFn((resolver, reject) => {
          reject(1)
        }).then(undefined, (reason) => {
          expect(reason).toBe(1)
          JSON.parse('')
        })
        promise3
          .then(undefined, (reason) => {
            expect(reason).toBe('no')
          })
          .catch((e) => {
            console.log(e)
          })
      })
      test('If onFulfilled is not a function and promise1 is fulfilled, promise2 must be fulfilled with the same value as promise1.', () => {
        const promise2 = new PromiseFn((resolver, reject) => {
          resolver(1)
        }).then(undefined, (reason) => {
          expect(reason).toBe('no')
        })
        promise2.then((res) => {
          expect(res).toBe(1)
        })
      })
      test('If onRejected is not a function and promise1 is rejected, promise2 must be rejected with the same reason as promise1 ', () => {
        const promise2 = new PromiseFn((resolver, reject) => {
          reject(1)
        }).then(undefined, undefined)
        promise2.then(undefined, (reason) => {
          expect(reason).toBe(1)
        })
      })
    })
  })

  describe('The Promise Resolution Procedure', () => {
    test(' If promise and x refer to the same object, reject promise with a TypeError as the reason ', () => {
      const a = new PromiseFn((resolve, reject) => resolve(231))
      a.then((res) => {
        expect(res).toBe(231)
        return a
      }).then(
        () => {},
        (reason) => {
          expect(reason).toBe('can not be same promise')
        },
      )
    })
    describe('If x is a promise, adopt its state', () => {
      test('If x is pending, promise must remain pending until x is fulfilled or rejected', () => {
        const a = new PromiseFn((resolve, reject) => resolve(231))
        a.then((res) => {
          expect(res).toBe(231)
          return new PromiseFn((resolve, reject) => {})
        })
        expect(a.status).toBe('pending')
      })
      test('If/when x is fulfilled, fulfill promise with the same value.', () => {
        const aa = new PromiseFn((resolve, reject) => resolve(231))
        aa.then((res) => {
          expect(res).toBe(231)
          return new PromiseFn((resolve, reject) => {
            resolve(1)
          })
        }).then((res) => {
          console.log(' ----------- res', res)
          expect(res).toBe(1)
        })
        expect(aa.status).toBe('fulfilled')
      })
      test('If/when x is rejected, reject promise with the same reason.', () => {
        const aaa = new PromiseFn((resolve, reject) => resolve(231))
        aaa
          .then((res) => {
            return new PromiseFn((resolve, reject) => {
              reject(1)
            })
          })
          .then(
            () => {
              console.log(' ------- goes here ')
            },
            (err) => {
              expect(err).toBe(1)
            },
          )
        expect(aaa.status).toBe('rejected')
      })
    })
    test('If x is not an object or function, fulfill promise with x', () => {
      const a = new PromiseFn((resolve, reject) => resolve(231))
      a.then((res) => {
        expect(res).toBe(231)
        return '12312'
      }).then((res) => {
        expect(res).toBe('12312')
      })
    })
  })

  // test(' A promise is pending if it is neither fulfilled nor rejected.  ', () => {})
  // test(' A promise p is fulfilled if p.then(f, r) will immediately enqueue a Job to call the function f.', () => {
  //   const a = new PromiseFn((resolve, reject) => {
  //     resolve(1)
  //   }).then((res) => {
  //     console.log(res)
  //   })
  //   expect(a.status).toBe('fulfilled')
  // })
  // test(' promise then will be add to queue ', () => {
  //   const a = new PromiseFn((resolve, reject) => {
  //     resolve(1)
  //   }).then((res) => {
  //     console.log(res)
  //   })
  //   expect(a.status).toBe('fulfilled')
  //   expect(a.resolvedQueue.length).toBeGreaterThan(0)
  //   expect(a.rejectedQueue.length).toBe(0)
  // })
  // test(' promise resolve  will call resolvequeue ', () => {
  //   const a = new PromiseFn((resolve, reject) => {
  //     resolve(1)
  //   })
  //   expect(a.resolvedValue).toBe(1)
  //   return a.then((res) => {
  //     console.log(res)
  //     expect(res).toBe(1)
  //   })
  // })
  // test('A promise p is rejected if p.then(f, r) will immediately enqueue a Job to call the function r.', () => {
  //   const a = new PromiseFn((resolve, reject) => {
  //     reject(1)
  //   })
  //   expect(a.status).toBe('rejected')
  // })
})
