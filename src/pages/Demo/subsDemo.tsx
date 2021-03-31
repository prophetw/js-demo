import { useState } from 'react'
import { useSubscription } from 'use-subscription'

class createSubscription {
  _res
  state
  _callbacks
  constructor(load) {
    this.load = load
    this._callbacks = new Set()
    this.state = {
      loading: true,
      title: 123,
    }
    console.log('before retry ')
    this.retry()
  }
  promise() {
    return this._res.promise
  }
  retry() {
    this._res = this.load()
    this._res.promise.then((res) => {
      console.log(',  res ,', this._res)
      this._callbacks.forEach((callback) => {
        debugger
        callback()
      })
    })
  }
  getVal() {
    return {
      ...this.state,
      loading: this._res.loading,
      title: this._res.title,
    }
  }

  subscribe(callback) {
    this._callbacks.add(callback)
    return () => {
      this._callbacks.delete(callback)
    }
  }
}
const loadableComponent = () => {
  let subs
  const loadModule = () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log(' 3s ')
        resolve('1')
      }, 3000)
    })
  }
  const load = () => {
    let promise = loadModule()
    let state = {
      loading: true,
      title: 123,
      promise: Promise.resolve('1'),
    }
    state.promise = promise.then(() => {
      state.loading = false
      state.title = 456
    })
    return state
  }

  const init = () => {
    if (!subs) {
      const subsq = new createSubscription(load)
      console.log(subsq)
      subs = {
        getCurrentValue: subsq.getVal.bind(subsq),
        subscribe: subsq.subscribe.bind(subsq),
      }
    }
  }

  const dyComponent = () => {
    init()
    const val = useSubscription(subs)
    console.log(' ------ subs ', val)
    return <div>{JSON.stringify(val)}</div>
  }
  return dyComponent
}

const Scomponet = loadableComponent()
const SubsDemo = () => {
  return (
    <div>
      <h2> here </h2>
      <Scomponet />
    </div>
  )
}
export default SubsDemo
