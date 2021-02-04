type Status = 'fulfilled' | 'pending' | 'rejected'

//  https://promisesaplus.com/ 一个promise的简易实现

type fn = (params?: any) => void
class PromiseFn {
  // NOTE: yellow
  status: Status
  value: undefined | PromiseFn | string | number
  reason: any
  resolvedQueue: fn[]
  rejectedQueue: fn[]
  tmpResolveFn: fn
  tmpRejectFn: fn
  constructor(
    excutor: (
      resolver: (res?: any) => void,
      reject: (reason?: any) => void,
    ) => void,
  ) {
    this.status = 'pending'
    this.value = undefined
    this.resolvedQueue = []
    this.rejectedQueue = []
    const resolverFn = (res?: any) => {
      // promsie 用户主动调用的 完成 fulfilled
      this.status = 'fulfilled'
      this.value = res
      this.callResolveFn()
    }
    const rejectFn = (reason?: any) => {
      // promsie 用户主动调用的 失败 reject
      this.status = 'rejected'
      this.reason = reason
      this.callRejectFn()
    }
    this.tmpResolveFn = resolverFn
    this.tmpRejectFn = rejectFn
    excutor(resolverFn, rejectFn)
    return this
  }
  callResolveFn(): any {
    const resolveFn = this.resolvedQueue.shift()
    if (resolveFn) {
      return resolveFn(this.value)
    }
  }
  callRejectFn() {
    const fn = this.rejectedQueue.shift()
    if (fn) {
      return fn(this.reason)
    }
  }
  promiseResolutionProcedure(
    context: any,
    result: any,
    resolve: fn,
    reject: fn,
  ) {
    // The Promise Resolution Procedure
    if (result === context) {
      this.value = undefined
      this.reason = 'can not be same promise'
      this.status = 'rejected'
    } else if (result instanceof PromiseFn) {
      this.status = result.status
      this.value = result.value
      this.reason = result.reason
    } else {
      if (typeof result === 'function' || typeof result === 'object') {
      } else {
        this.status = 'fulfilled'
        this.value = result
        this.reason = ''
      }
    }
  }
  then(onfulfilled?: (res?: any) => void, onrejected?: (reason?: any) => void) {
    //
    queueMicrotask(() => {
      onfulfilled && this.resolvedQueue.push(onfulfilled)
      onrejected && this.rejectedQueue.push(onrejected)
      if (this.status === 'pending') {
        // pending
      } else if (this.status === 'fulfilled') {
        // fulfilled
        try {
          const a = this.callResolveFn()
          this.promiseResolutionProcedure(
            this,
            a,
            this.tmpResolveFn,
            this.tmpRejectFn,
          )
        } catch (error) {
          console.log('error', error)
          this.value = undefined
          this.reason = 'no'
          this.status = 'rejected'
          this.callRejectFn()
        }
      } else {
        // rejected
        try {
          this.callRejectFn()
        } catch (error) {
          console.log('error', error)
          this.value = undefined
          this.reason = 'no'
          this.status = 'rejected'
          this.callRejectFn()
        }
      }
      return this
    })
  }
  catch(e: any) {
    console.log(e)
    return this
  }
  final() {
    return this
  }
  all() {}
  race() {}
}

export default PromiseFn
