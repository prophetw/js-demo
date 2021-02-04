const fs = require('fs')
const path = require('path')

const originRegionDataPath = path.join(__dirname, './data.json')
const data = fs.readFileSync(originRegionDataPath, {
  encoding: 'utf-8',
})

// console.log(typeof data);
// console.log(data);
let dataArr = JSON.parse(data)
// console.log(dataArr);
function formatData(arr) {
  const result = arr.map((provinceItem) => {
    const { province, href, children } = provinceItem
    // href '' || '22.html'
    let value = ''
    if (href.indexOf('.') > -1) {
      value = href.split('.')[0]
    }
    const cityChildrenArr = children.map((cityItem) => {
      // cityItem {}
      // children: countryItem[]
      // city: "石家庄市"
      // code: "130100000000"
      // href: "13/1301.html"
      const { code, city, children } = cityItem
      let countryChildrenArr = children.map((countryItem) => {
        // countryItem {}
        // code: "131101000000"
        // country: "市辖区"
        // href: ""
        const { country, code } = countryItem
        return {
          label: country,
          value: code,
          children: null,
        }
      })
      return {
        label: city,
        value: code,
        children: countryChildrenArr,
      }
    })
    return {
      label: province,
      value,
      children: cityChildrenArr,
    }
  })
  return result
}
const formatedData = formatData(dataArr)

const str = JSON.stringify(formatedData)
const writePath = path.join(__dirname, './regionData.json')
fs.writeFileSync(writePath, str, {
  encoding: 'utf-8',
})
