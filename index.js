const tf = require('@tensorflow/tfjs')
const utils = require('./utils')
const fs = require('fs')
let data = require('./inputs/ETHBTC.json')
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
      let _VOL = ind.VOL.slice(j, i)//.map(v => v)
      let price = ind.price_change.slice(j, i)
      X.push([
        price[0], _MFI[0], _RSI[0], _VOL[0],
        price[1], _MFI[1], _RSI[1], _VOL[1],
        price[2], _MFI[2], _RSI[2], _VOL[2],
        price[3], _MFI[3], _RSI[3], _VOL[3]])
      Y.push(tf.tensor([ind.output[i]]))
      // set.push([
      //   price[0], _MFI[0], _RSI[0], _VOL[0], price[1], _MFI[1], _RSI[1], _VOL[1], price[2], _MFI[2], _RSI[2], _VOL[2], price[3], _MFI[3], _RSI[3], _VOL[3], ind.output[i]
      // ])
    }
  })
  return [X, Y]
  // return set
}
// let t = create_dataSet(test)
// fs.writeFileSync('test.json', JSON.stringify(t), err => console.log(err))
let model
let [xTrain, yTrain] = create_dataSet(data)
let [xTest, yTest] = create_dataSet(test)
xTrain = xTrain.map(v => tf.tensor3d(v, [1, 4, 4]))
xTest = xTest.map(v => tf.tensor3d(v, [1, 4, 4]))
//xTrain[0].print()
//xTrain = tf.tensor(xTrain)
//yTrain = tf.tensor(yTrain)
//yTrain = yTrain.map(v => tf.scalar(v))

//xTrain = tf.concat(xTrain)
//console.log(create_dataSet(data)[0].input);
// const xTrain = create_dataSet(data).map(cur => cur.input)
// const yTrain = create_dataSet(data).map(cur => cur.output)

async function execute() {
  const optimizer = tf.train.adam(0.01)
  model = tf.sequential()

  model.add(tf.layers.lstm({units: 16, returnSequences: true, inputShape: [4, 4], recurrentActivation: 'elu'}))
  model.add(tf.layers.dropout({rate: 0.2}))

  model.add(tf.layers.lstm({units: 8, returnSequences: true, recurrentActivation: 'elu'}))
  model.add(tf.layers.dropout({rate: 0.2}))

  model.add(tf.layers.flatten())

  model.add(tf.layers.dense({units: 1, activation: 'sigmoid'}))

  model.compile({
    optimizer,
    loss: 'binaryCrossentropy',
    metrics: ['accuracy']
  })

  for (var i = 0; i < xTrain.length; i++) {
    const h = await model.fit(xTrain[i], yTrain[i], {
      batchSize: 64,
      epochs: 3
    }).catch(e => console.error(e))
    i % 100 == 0 ? console.log(h.history.loss[0]) : null
  }

  for (var i = 0; i < 300/*xTest.length*/; i++) {
    const p = await model.predict(xTest[254])
    p.print()
  }

}

execute()



// for (var i = 0; i < xTrain.length; i++) {
//   model.fit(xTrain[i], yTrain[i], {
//     batchSize: 1,
//     epochs: 3
//   }).then(() => {
//     console.log(model.history.loss[0]);
//   }).catch(e => console.error(e.stack))
//
// }

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
