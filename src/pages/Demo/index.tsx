import React from 'react'
import { useSubscription } from 'use-subscription'

const MyComp = () => {
  return <div></div>
}
function load(loader) {
  let promise = loader()

  let state = {
    loading: true,
    loaded: null,
    error: null,
  }

  state.promise = promise
    .then((loaded) => {
      state.loading = false
      state.loaded = loaded
      return loaded
    })
    .catch((err) => {
      state.loading = false
      state.error = err
      throw err
    })

  return state
}

function resolve(obj) {
  return obj && obj.__esModule ? obj.default : obj
}

function render(loaded, props) {
  return React.createElement(resolve(loaded), props)
}

function createLoadableComponent(loadFn, options) {
  let opts = Object.assign(
    {
      loader: null,
      loading: null,
      delay: 200,
      timeout: null,
      render: render,
      webpack: null,
      modules: null,
    },
    options,
  )

  let subscription = null

  function init() {
    if (!subscription) {
      const sub = new LoadableSubscription(loadFn, opts)
      subscription = {
        getCurrentValue: sub.getCurrentValue.bind(sub),
        subscribe: sub.subscribe.bind(sub),
        // retry: sub.retry.bind(sub),
        // promise: sub.promise.bind(sub),
      }
    }
    // return subscription.promise();
  }
  const LoadableComponent = (props, ref) => {
    init()

    const state = useSubscription(subscription)
    console.log(' new state ', state)

    // return React.useMemo(() => {
    if (state.loading || state.error) {
      return React.createElement(opts.loading, {
        isLoading: state.loading,
        pastDelay: state.pastDelay,
        timedOut: state.timedOut,
        error: state.error,
        retry: subscription.retry,
      })
    } else if (state.loaded) {
      return opts.render(state.loaded, props)
    } else {
      return null
    }
    // }, [props, state]);
  }
  return LoadableComponent
}

class LoadableSubscription {
  constructor(loadFn, opts) {
    this._loadFn = loadFn
    this._opts = opts
    this._callbacks = new Set()
    this._delay = null
    this._timeout = null

    this.retry()
  }

  promise() {
    return this._res.promise
  }

  retry() {
    this._clearTimeouts()
    this._res = this._loadFn(this._opts.loader)

    this._state = {
      pastDelay: false,
      timedOut: false,
    }

    const { _res: res, _opts: opts } = this

    if (res.loading) {
      if (typeof opts.delay === 'number') {
        if (opts.delay === 0) {
          this._state.pastDelay = true
        } else {
          this._delay = setTimeout(() => {
            this._update({
              pastDelay: true,
            })
          }, opts.delay)
        }
      }

      if (typeof opts.timeout === 'number') {
        this._timeout = setTimeout(() => {
          this._update({ timedOut: true })
        }, opts.timeout)
      }
    }

    this._res.promise
      .then(() => {
        this._update({})
        this._clearTimeouts()
      })
      .catch((_err) => {
        this._update({})
        this._clearTimeouts()
      })
    this._update({})
  }

  _update(partial) {
    this._state = {
      ...this._state,
      error: this._res.error,
      loaded: this._res.loaded,
      loading: this._res.loading,
      ...partial,
    }
    this._callbacks.forEach((callback) => callback())
  }

  _clearTimeouts() {
    clearTimeout(this._delay)
    clearTimeout(this._timeout)
  }

  getCurrentValue() {
    return this._state
  }

  subscribe(callback) {
    this._callbacks.add(callback)
    return () => {
      this._callbacks.delete(callback)
    }
  }
}

function Loadable(opts) {
  return createLoadableComponent(load, opts)
}

function waitFor(delay) {
  return new Promise((resolve) => {
    setTimeout(resolve, delay)
  })
}
function createLoader(delay, loader, error?: any) {
  return () => {
    return waitFor(delay).then(() => {
      if (loader) {
        return loader()
      } else {
        throw error
      }
    })
  }
}
const Index1 = Loadable({
  loader: createLoader(2000, () => import('./index1')),
  loading: () => <div>loading</div>,
})

const TestMo = () => {
  return (
    <div>
      <h1>123</h1>
      <Index1 />
    </div>
  )
}
export default TestMo
