const tech = require('technicalindicators')
const fs = require('fs')
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
  let VOL = relVol(volume, period)
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
      return outputClass(close.slice(i + 1, i + wl + 1), close[i], 1.05)
    }
    return 0
  })

  let sliced = Math.min(MFI.length, RSI.length, price_change.length, VOL.length, output.length)
  MFI = MFI.slice(-sliced)
  RSI = RSI.slice(-sliced)
  VOL = VOL.slice(-sliced)
  price_change = price_change.slice(-sliced)
  output = output.slice(-sliced)
  let out = {price_change, MFI, RSI, VOL, output}
  fs.writeFileSync('r.json', JSON.stringify(out, null, ' '), err => console.log(err))
  return {price_change, MFI, RSI, VOL, output}
}

const outputClass = (data, last_price, pct) => {
    let max = Math.max(...data)
    let up = max >= (last_price * pct)
    return up ? 1 : 0
}

const relVol = (volume, period) => {
  let avg_volume = tech.SMA.calculate({values: volume, period: period})

  let relative_volume = []
  volume.map((cur, i) => {
    if(i < period){
      return relative_volume.push(0)
    }
    let rv = cur / avg_volume[i - period]
    return relative_volume.push(rv > 20 ? 20 : rv)
  })
  return relative_volume.map(v => normalizeValues(v, 0, 20, 100000))
}


module.exports = {
  indicators,
  outputClass
}
