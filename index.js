const tf = require('@tensorflow/tfjs')
const utils = require('./utils')
let data = require('./inputs/VENBTC.json')
let test = require('./inputs/BNBBTC.json')

let WINDOW_LEN = 4
let INDICATOR_PERIOD = 14

const model

function create_dataSet(data, ip = INDICATOR_PERIOD, wl = WINDOW_LEN) {
  let ind = utils.indicators(data, ip, wl)
  let close = data.map(v => +v.close)
  let set = []

  ind.price_change.map((_, i) => {
    let j = i - wl
    if(i > wl){
      let _MFI = ind.MFI.slice(j, i)//.map(v => v)
      let _RSI = ind.RSI.slice(j, i)//.map(v => v)
      let price = ind.price_change.slice(j, i)
      set.push({
        //input: [_MFI, _RSI[0], _MFI[1], _RSI[1], _MFI[2], _RSI[2], _MFI[3], _RSI[3]],
        input: [price[0], _MFI[0], _RSI[0], price[1], _MFI[1], _RSI[1], price[2], _MFI[2], _RSI[2], price[3], _MFI[3], _RSI[3]],
        output: [ind.output[i]]
      })
    }
  })
  return set
}

model = tf.sequential()

model.add(tf.layers.lstm({units: 100, }))

// console.log(create_dataSet(data))
// console.log(create_dataSet(test))

//tf.tensor2d(create_inputs(data)[0], [4, 3]).print()
//create_inputs(data)
