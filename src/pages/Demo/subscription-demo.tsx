import React, { useEffect, useMemo } from 'react';
import { useSubscription } from 'use-subscription';
let inited = false;
class Subs {
  state;
  cb;
  constructor() {
    this.state = {
      title: '123',
      loading: true,
    };
    this.cb = new Set();
    this.init();
  }
  init() {
    setTimeout(() => {
      if (inited) return;
      this.state = {
        title: '321321',
        loading: false,
      };
      this.cb.forEach((callback) => {
        callback();
      });
    }, 3000);
  }
  getVal() {
    return this.state;
  }
  subscribe(cb) {
    this.cb.add(cb);
    return () => {
      this.cb.delete(cb);
    };
  }
}
const subsq = new Subs();
let subs = {
  getCurrentValue: subsq.getVal.bind(subsq),
  subscribe: subsq.subscribe.bind(subsq),
};
const Qcomp = () => {
  // TODO: 这个地方必须要用闭包 而且必须是要嵌套两层,
  // useSubscription 和 使用的值不能在同一个方法里面调用 会导致死循环 所以值必须在外层执行
  const ResComp = () => {
    const val = useSubscription(subs);
    console.log(' ---- val ---- ', val);
    if (val.loading) {
      return <div>loadings</div>;
    } else {
      return <div>loaded</div>;
    }
  };
  return ResComp;
};
const CompA = Qcomp();
export default () => {
  return (
    <div>
      <CompA />
    </div>
  );
};
