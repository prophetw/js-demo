const Axios = require('axios')
const fs = require('fs')
const cheerio = require('cheerio')
const path = require('path')
const prettier = require('prettier')
const iconv = require('iconv-lite')

// 数据源 http://www.stats.gov.cn/tjsj/tjbz/tjyqhdmhcxhfdm/
const baseUrl = 'http://www.stats.gov.cn/tjsj/tjbz/tjyqhdmhcxhfdm/2020/'
const rootUrl = baseUrl + 'index.html'
let provinceArr = []

const prettierJson = (data) => {
  const res = prettier.format(data, {
    parser: 'json',
    printWidth: 100,
  })
  return res
}

const formatProvinceHtml = (htmlString) => {
  const $ = cheerio.load(htmlString)
  const html = $('tr.provincetr td')
  const provinceArr = []
  html.map((index, el) => {
    const provinceName = $(el).text()
    const href = $(el).find('a').attr('href')
    if (provinceName) {
      provinceArr.push({
        province: provinceName,
        href,
        children: [],
      })
    }
  })
  // {province: string, href: ''}
  return provinceArr
}
const formatCityHtmlData = (htmlString, provinceItem) => {
  const $ = cheerio.load(htmlString)
  const { province } = provinceItem
  const html = $('tr.citytr')
  const cityData = []
  html.map((index, el) => {
    const $el = $(el)
    const tdElArr = $el.find('td')
    const $td0 = $(tdElArr[0])
    const $td1 = $(tdElArr[1])
    const code = $td0.text()
    const city = $td1.text()
    const href = $td0.find('a').attr('href')
    if (city) {
      cityData.push({
        code,
        city,
        href,
        children: [],
      })
    }
  })
  // console.log(cityData);
  // const result = {
  //   label: province,
  //   value: province,
  //   children: cityData
  // }

  // return result
  return cityData
}
const formatCountryHtmlData = (htmlString) => {
  const $ = cheerio.load(htmlString)
  const html = $('tr.countytr')
  const countryData = []
  html.map((index, el) => {
    const $el = $(el)
    const tdElArr = $el.find('td')
    const $td0 = $(tdElArr[0])
    const $td1 = $(tdElArr[1])
    const code = $td0.text()
    const country = $td1.text()
    let href = ''
    if ($td0.find('a').length > 0) {
      href = $td0.find('a').attr('href')
    }
    if (country) {
      countryData.push({
        code,
        country,
        href,
      })
    }
  })
  // console.log(countryData);
  return countryData
}

const cityPath = path.join(__dirname, './city.json')
console.log(cityPath)
const getCityData = (provinceItem) => {
  /**
   * provinceItem
   * province string
   * href string
   * children []
   */
  const { href } = provinceItem
  return Axios.get(baseUrl + href, { responseType: 'arraybuffer' }).then(
    (res) => {
      if (res.status === 200) {
        const htmlString = iconv.decode(res.data, 'gb2312')
        const cityArr = formatCityHtmlData(htmlString, provinceItem)
        provinceItem.children = cityArr
        /**
        code,
        city,
        href,
       **/
        provinceItem.children.map((cityItem, index) => {
          setTimeout(async () => {
            const res = await getCountryData(provinceItem.children[index])
            console.log(' requesting country ----- ')
            if (index === provinceItem.children.length - 1) {
              console.log(' jieshule ')
              const a = JSON.stringify(provinceArr)
              const formatData = prettierJson(a)
              fs.writeFileSync(countryPath, formatData, {
                // flag: 'a',
                encoding: 'utf-8',
              })
            }
          }, index * 500)
        })
        // console.log(provinceArr)
        return cityArr
      }
    },
  )
}
const countryPath = path.join(__dirname, './country.json')
const getCountryData = (cityItem) => {
  const { city, href, code } = cityItem
  console.log(href)
  return Axios.get(baseUrl + href, { responseType: 'arraybuffer' }).then(
    (res) => {
      if (res.status === 200) {
        const htmlString = iconv.decode(res.data, 'gb2312')
        const countryArr = formatCountryHtmlData(htmlString)
        // console.log(countryArr);
        cityItem.children = countryArr
      }
    },
  )
}
const provincePath = path.join(__dirname, './province.json')

const getProvinceData = () => {
  // province
  Axios.get(rootUrl, { responseType: 'arraybuffer' }).then((res) => {
    console.log(res.status === 200)
    if (res.status === 200) {
      const htmlString = iconv.decode(res.data, 'gb2312')
      provinceArr = formatProvinceHtml(htmlString)
      provinceArr.map((item, index) => {
        setTimeout(async () => {
          const res = await getCityData(provinceArr[index])
          console.log(index)
          if (index === provinceArr.length - 1) {
            console.log(provinceArr)
          }
        }, index * 1000)
      })
      // const a = JSON.stringify(result)
      // const formatData = prettierJson(a)
      // fs.writeFileSync(provincePath, formatData, {
      //   // flag: 'a',
      //   encoding: 'utf-8'
      // })
    }
  })
}

// test
// getCityData({ province: '安徽省', href: '34.html'})
// getCountryData({ code: '341500000000', city: 'kjk', href: '34/3415.html' })
getProvinceData()
