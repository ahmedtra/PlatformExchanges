const WebSocket = require('ws');
const Coins = ['XRP','LTC','XLM','DOGE','ADA','ALGO','BCH','DGB','BTC','ETH','FIL', 'SGB']


let tradesBinance = {}
let volumesBinance = {}
function resetTradesBinance(){
  for (let cn of Coins) {tradesBinance[cn] = []}
  for (let cn of Coins) {volumesBinance[cn] = []}
}
resetTradesBinance()
let streams = Coins.map((x)=>x.toLowerCase()+"usdt@ticker").join("/")+"/"+Coins.map((x)=>x.toLowerCase()+"usdt@trade").join("/")
const conn = new WebSocket("wss://stream.binance.com:9443/stream?streams="+streams);
conn.onopen = function(evt) {
        //conn.send(JSON.stringify({ method: "subscribe",
        //params: ["btcusdt@ticker"] }));
    }

priceMemoryBinance = {}

conn.onmessage = function(data) {
            msg = JSON.parse(data.data).data;
            if (msg.e == "24hrTicker"){
              cn = msg.s.split("USDT")[0]
              priceMemoryBinance[cn] = {
                price : (parseFloat(msg.a) + parseFloat(msg.b))/2,
                qV : parseFloat(msg.q),
                bid : parseFloat(msg.b),
                ask : parseFloat(msg.a)
              }
            }
            if (msg.e == "trade"){
              cn = msg.s.split("USDT")[0]

              tradesBinance[cn].push(parseFloat(msg.p))
              volumesBinance[cn].push(parseFloat(msg.q))

              }
            //for (let i = 0; i<tickers.length; i++){
            //  console.log(tickers[i].s)
            //}
            //
            //console.log(priceMemoryBinance)
        }

conn.onerror = function(error) {
            console.log("binance error")
            console.log(error)
            //for (let i = 0; i<tickers.length; i++){
            //  console.log(tickers[i].s)
            //}
        }

conn.onping = function() {
            console.log("binance ping")
            conn.pong()
            //for (let i = 0; i<tickers.length; i++){
            //  console.log(tickers[i].s)
            //}
        }

module.exports = {stream : priceMemoryBinance, unit : "USDT", trades: {prices : tradesBinance, volumes : volumesBinance, resetTrades : resetTradesBinance}}
