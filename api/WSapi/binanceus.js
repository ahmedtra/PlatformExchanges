const WebSocket = require('ws');
const Coins = ['XRP','LTC','XLM','DOGE','ADA','ALGO','BCH','DGB','BTC','ETH','FIL', 'SGB']

let streams = Coins.map((x)=>x.toLowerCase()+"usdt@ticker").join("/")+"/"+Coins.map((x)=>x.toLowerCase()+"usdt@trade").join("/")
const conn = new WebSocket("wss://stream.binance.us:9443/stream?streams="+streams);
conn.onopen = function(evt) {
        //conn.send(JSON.stringify({ method: "subscribe",
        //params: ["btcusdt@ticker"] }));
    }

let tradesBinanceUS = []
let volumesBinanceUS = []
function resetTradesBinanceUS(){
  for (let cn of Coins) {tradesBinanceUS[cn] = []}
  for (let cn of Coins) {volumesBinanceUS[cn] = []}
}
priceMemoryBinanceUS = {}
resetTradesBinanceUS()
conn.onmessage = function(data) {
            tickers = JSON.parse(data.data).data;
            cn = tickers.s.split("USDT")[0]

            priceMemoryBinanceUS[cn] = {
              price : (parseFloat(tickers.a) + parseFloat(tickers.b))/2,
              qV : parseFloat(tickers.q),
              bid : parseFloat(tickers.b),
              ask : parseFloat(tickers.a)
            }
            if (tickers.e == "trade"){
              cn = tickers.s.split("USDT")[0]

              tradesBinanceUS[cn].push(parseFloat(tickers.p))
              volumesBinanceUS[cn].push(parseFloat(tickers.q))

              }
            //for (let i = 0; i<tickers.length; i++){
            //  console.log(tickers[i].s)
            //}
            //console.log(priceMemory)
        }

conn.onerror = function(error) {
console.log("binance us error")
            console.log(error)
            //for (let i = 0; i<tickers.length; i++){
            //  console.log(tickers[i].s)
            //}
        }

module.exports = {stream : priceMemoryBinanceUS, unit : "USDT", trades: {prices : tradesBinanceUS, volumes : volumesBinanceUS, resetTrades : resetTradesBinanceUS}}
