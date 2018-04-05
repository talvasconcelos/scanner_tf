const tf = require('@tensorflow/tfjs')
const utils = require('./utils')
const fs = require('fs')
let data = require('./inputs/VENBTC.json')
let test = require('./inputs/BNBBTC.json')

let WINDOW_LEN = 4
let INDICATOR_PERIOD = 14

function create_dataSet(data, ip = INDICATOR_PERIOD, wl = WINDOW_LEN) {
  let ind = utils.indicators(data, ip, wl)
  let close = data.map(v => +v.close)
  let set = []
  let X = []
  let Y = []

  ind.price_change.map((_, i) => {
    let j = i - wl
    if(i > wl){
      let _MFI = ind.MFI.slice(j, i)//.map(v => v)
      let _RSI = ind.RSI.slice(j, i)//.map(v => v)
      let price = ind.price_change.slice(j, i)
      X.push(tf.tensor3d([
        price[0], _MFI[0], _RSI[0],
        price[1], _MFI[1], _RSI[1],
        price[2], _MFI[2], _RSI[2],
        price[3], _MFI[3], _RSI[3]]), [1, 4, 3])
      Y.push(tf.tensor([ind.output[i]]))
      // set.push([
      //   price[0], _MFI[0], _RSI[0], price[1], _MFI[1], _RSI[1], price[2], _MFI[2], _RSI[2], price[3], _MFI[3], _RSI[3], ind.output[i]
      // ])
    }
  })
  return [X, Y]
  //fs.writeFileSync('data.json', JSON.stringify(set), err => console.log(err))
  //return set
}


let [xTrain, yTrain] = create_dataSet(data)
// xTrain = xTrain.map(v => tf.tensor3d(v, [1, 4, 3]))
//xTrain = tf.tensor(xTrain)
//yTrain = tf.tensor(yTrain)
//yTrain = yTrain.map(v => tf.scalar(v))

//xTrain = tf.concat(xTrain)
//console.log(create_dataSet(data)[0].input);
// const xTrain = create_dataSet(data).map(cur => cur.input)
// const yTrain = create_dataSet(data).map(cur => cur.output)


const model = tf.sequential()

// model.add(tf.layers.simpleRNN({units: 10, returnSequences: true, inputShape: [2981, 3]}))
// model.add(tf.layers.dense({units: 1, activation: 'sigmoid'}))
// model.compile({
//   optimizer,
//   loss: 'categoricalCrossentropy',
//   metrics: ['accuracy']
// })
// for (var i = 0; i < /*xTrain.length*/2; i++) {
//   const h = model.fit(xTrain[i], yTrain[i], {
//     batchSize: 10,
//     epochs: 50
//   }).catch(e => console.error(e.stack))
//   //console.log(h.history.loss[0]);
// }
const optimizer = tf.train.adam(0.01)


model.add(tf.layers.lstm({units: 8, returnSequences: true, inputShape: [4, 3]}))
model.add(tf.layers.dropout({rate: 0.2}))

//model.add(tf.layers.lstm({units: 2, returnSequences: true}))

model.add(tf.layers.flatten())

model.add(tf.layers.dense({units: 1, activation: 'softmax'}))
model.compile({
  optimizer,
  loss: 'binaryCrossentropy',
  metrics: ['accuracy']
})

for (var i = 0; i < xTrain.length; i++) {
  model.fit(xTrain[i], yTrain[i], {
    batchSize: 1,
    epochs: 3
  }).then(() => {
    console.log(model.history.loss[0]);
  }).catch(e => console.error(e.stack))

}

// model.fit(xTrain[0], yTrain[0], {
//   batchSize: 10,
//   epochs: 50
// }).catch(e => console.error(e.stack))

// const loss = h.history.loss[0]
// const accuracy = h.history.acc[0]

// console.log(create_dataSet(data))
// console.log(create_dataSet(test))

//tf.tensor2d(create_inputs(data)[0], [4, 3]).print()
//create_inputs(data)
