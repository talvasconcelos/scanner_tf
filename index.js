const tf = require('@tensorflow/tfjs')
const utils = require('./utils')
let data = require('./inputs/BNBBTC.json')

let WINDOW_LEN = 4
let INDICATOR_PERIOD = 14

function create_dataSet(data, ip = INDICATOR_PERIOD, wl = WINDOW_LEN) {
  let ind = utils.indicators(data, ip, wl)
  //data = data.slice(ip)
  let close = data.map(v => +v.close)
  let set = []

  data.slice(ip).map((_, i) => {
    let j = i - wl
    if(i > wl){
      let _MFI = ind.MFI.slice(j, i)//.map(v => v)
      let _RSI = ind.RSI.slice(j, i)//.map(v => v)
      let price = ind.price_change.slice(j, i)
      set.push({
        //input: [_MFI, _RSI[0], _MFI[1], _RSI[1], _MFI[2], _RSI[2], _MFI[3], _RSI[3]],
        input: [price[0], _MFI[0], _RSI[0], price[1], _MFI[1], _RSI[1], price[2], _MFI[2], _RSI[2], price[3], _MFI[3], _RSI[3]],
        output: [utils.output(close.slice(i + 1, i + wl + 1), close[i], 1.056)]
      })
    }
  })
  console.log(set[1].input)
  tf.tensor2d(set[1].input, [4, 3]).print()

  /*for (var i = 0; i < ind.RSI.length - wl; i++) {
    //let temp_window = ind.slice(i, i + wl)
    let _ADX = ind.ADX.slice(i, i + wl)
    let _MFI = ind.MFI.slice(i, i + wl)
    let _RSI = ind.RSI.slice(i, i + wl)

    inputs.push([_ADX[0], _MFI[0], _RSI[0], _ADX[1], _MFI[1], _RSI[1], _ADX[2], _MFI[2], _RSI[2], _ADX[3], _MFI[3], _RSI[3]])
    // let last_price = norm_cols[temp_window.length - 1]
    // temp_window.map(cur => (last_price - cur) / last_price)
    // inputs.push(temp_window)
  }
  return inputs*/
}

create_dataSet(data)

//tf.tensor2d(create_inputs(data)[0], [4, 3]).print()
//create_inputs(data)
