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
    let j = i - wl
    if(i > wl){
      let c = (close[i] - close[j]) / close[i]
      return normalizeValues(c, -1, 1)
    }
  })
  console.log({price_change});
  return {price_change, MFI, RSI}
}

const output = (data, last_price, pct) => {
    let max = Math.max(data)
    let up = max >= last_price * pct
    return up ? 1 : 0
  }

module.exports = {
  indicators,
  output
}
