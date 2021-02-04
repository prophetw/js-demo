const deepClone = (originalVal: any, weakMaps?: any) => {
  if (!weakMaps) {
    weakMaps = new WeakMap()
  }
  if (typeof originalVal === 'object') {
    let newVal = Array.isArray(originalVal) ? [] : {}
    if (!weakMaps.has(originalVal)) {
      weakMaps.set(originalVal, newVal)
    } else {
      return weakMaps.get(originalVal)
    }
    const keys = Object.keys(originalVal)
    for (let index = 0; index < keys.length; index++) {
      newVal[keys[index]] = deepClone(originalVal[keys[index]], weakMaps)
    }
    return newVal
  } else {
    return originalVal
  }
}
export default deepClone
