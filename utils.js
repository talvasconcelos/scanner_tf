const tech = require('technicalindicators')

tech.setConfig('precision', 8)

const normalizeValues = (val, min, max, round = 100000) => {
  let normalized = (val - min) / (max - min)
  return Math.round(normalized * round) / round
}


const indicators = (data, period, wl) => {
  let open = data.map(cur => +cur.open)
  let close = data.map(cur => +cur.close)
  let high = data.map(cur => +cur.high)
  let low = data.map(cur => +cur.low)
  let volume = data.map(cur => +cur.volume)

  //let ADX = tech.ADX.calculate({high, low, close, period}).map(cur => normalizeValues(cur.adx, 0, 100))
  let MFI = tech.MFI.calculate({high, low, close, volume, period}).map(v => normalizeValues(v, 0, 100))
  let RSI = tech.RSI.calculate({values: close, period}).map(v => normalizeValues(v, 0, 100))
  let price_change = close.map((cur, i) => {
    return normalizeValues((close[i] - close[i - (wl + 1)]) / close[i], -1, 1)
    // let j = i - (wl + 1)
    // if(i > wl) {
    //   let c = close[i] / close[j]
    //   return normalizeValues(c, -1, 1)
    // }
    // return 0
  })
  let output = close.map((cur, i) => {
    if(i < close.length - (wl + 1)){
      return outputClass(close.slice(i + 1, i + wl + 1), close[i], 1.056)
    }
    return 0
  })

  let sliced = Math.min(MFI.length, RSI.length, price_change.length, output.length)
  MFI = MFI.slice(-sliced)
  RSI = RSI.slice(-sliced)
  price_change = price_change.slice(-sliced)
  output = output.slice(-sliced)
  return {price_change, MFI, RSI, output}
}

const outputClass = (data, last_price, pct) => {
    let max = Math.max(...data)
    let up = max >= (last_price * pct)
    return up ? 1 : 0
}


module.exports = {
  indicators,
  outputClass
}
