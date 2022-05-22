const getCoinbasePrice = require('./coinbase')
const getOkexPrice = require('./okex')
const getKrakenPrice = require('./kraken')
const getBinancePrice = require('./binance')
const getBinanceUsPrice = require('./binanceus')
const getHuobiPrice = require('./huobi')
const getFtxPrice = require('./ftx')
//const getFtxUsPrice = require('./ftxus')
const getKucoinPrice = require('./kucoin')
const getBitfinexPrice = require('./bitfinex')
const getGateapiPrice = require('./gateio')
const getGeminiPrice = require('./gemini')
//const getCryptoPrice = require('./crypto')
//const getBiTruePrice = require('./bitrue')

module.exports = {
  coinbase: getCoinbasePrice,
  okex: getOkexPrice,
  kraken: getKrakenPrice,
  binance : getBinancePrice,
  binanceus: getBinanceUsPrice,
  huobi: getHuobiPrice,
  ftx : getFtxPrice,
  kucoin : getKucoinPrice,
  bitfinex : getBitfinexPrice,
  gateio : getGateapiPrice,
  gemini : getGeminiPrice,
}
