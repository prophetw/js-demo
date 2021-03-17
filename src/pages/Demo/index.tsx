import React, { useState, createElement } from 'react';
let a;
const Dynamic = () => {
  const [loading, setLoading] = useState(false);
  const [comp, setComp] = useState(null);
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
