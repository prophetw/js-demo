import React, { useState, createElement } from 'react';
import { useSubscription } from 'use-subscription';
let a;

class LoadableSubscription {
  _loadFn: (para: any) => void;
  _opts: any;
  _callbacks: any;
  _delay: any;
  _timeout: any;
  _res: any;
  _state: any;
  constructor(loadFn, opts) {
    this._loadFn = loadFn;
    this._opts = opts;
    this._callbacks = new Set();
    this._delay = null;
    this._timeout = null;

    this.retry();
  }

  promise() {
    return this._res.promise;
  }

  retry() {
    this._clearTimeouts();
    this._res = this._loadFn(this._opts.loader);

    this._state = {
      pastDelay: false,
      timedOut: false,
    };

    const { _res: res, _opts: opts } = this;

    if (res.loading) {
      if (typeof opts.delay === 'number') {
        if (opts.delay === 0) {
          this._state.pastDelay = true;
        } else {
          this._delay = setTimeout(() => {
            this._update({
              pastDelay: true,
            });
          }, opts.delay);
        }
      }

      if (typeof opts.timeout === 'number') {
        this._timeout = setTimeout(() => {
          this._update({ timedOut: true });
        }, opts.timeout);
      }
    }

    this._res.promise
      .then(() => {
        this._update();
        this._clearTimeouts();
      })
      // eslint-disable-next-line handle-callback-err
      .catch((err) => {
        this._update();
        this._clearTimeouts();
      });
    this._update({});
  }

  _update(partial: any = {}) {
    this._state = {
      ...this._state,
      ...partial,
    };
    this._callbacks.forEach((callback) => callback());
  }

  _clearTimeouts() {
    clearTimeout(this._delay);
    clearTimeout(this._timeout);
  }

  getCurrentValue() {
    return {
      ...this._state,
      error: this._res.error,
      loaded: this._res.loaded,
      loading: this._res.loading,
    };
  }

  subscribe(callback) {
    this._callbacks.add(callback);
    return () => {
      this._callbacks.delete(callback);
    };
  }
}
let subscription: {
  getCurrentValue: () => any;
  subscribe: (callback: any) => () => void;
  retry: () => void;
  promise: () => any;
};

function init() {
  if (!subscription) {
    const sub = new LoadableSubscription(loadFn, opts);
    subscription = {
      getCurrentValue: sub.getCurrentValue.bind(sub),
      subscribe: sub.subscribe.bind(sub),
      retry: sub.retry.bind(sub),
      promise: sub.promise.bind(sub),
    };
  }
  return subscription.promise();
}
const Dynamic = () => {
  const [loading, setLoading] = useState(false);
  const [comp, setComp] = useState(null);
  const state = useSubscription(subscription);
  const qq = import('./index1');
  qq.then((res) => {
    setLoading(true);
  });
  return (
    <div>
      {loading && a && a.default && createElement(a.default)}
      {!loading && <div>loading</div>}
    </div>
  );
};
const Demo = () => {
  return (
    <>
      <h1> 这是Dynamic Demo </h1>
      <Dynamic />
    </>
  );
};
export default Demo;
