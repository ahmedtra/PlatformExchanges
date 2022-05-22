const WebSocket = require('ws');
const Coins = ["XRP", "LTC", "XLM", "DOGE", "ADA", "ALGO", "BCH", "BTC", "ETH", "FIL", 'SGB']

let pairsFTX = Coins.map((token)=> {
          if (["XLM", "DOGE", "FIL", "ADA", "ALGO"].includes(token)) {return token+"-PERP"}
          return token + "/USD"
        })

let mapPairs = {}
for (let i = 0; i<Coins.length; i++) {
  mapPairs[pairsFTX[i]] = Coins[i]
}
//console.log(mapPairs)
priceMemoryFTXUS = {}
for (let cn of Coins) {priceMemoryFTXUS[cn] = {}}

const conn = new WebSocket("wss://ftx.us/ws/");
conn.onopen = function(evt) {
    for (let cn of pairsFTX){
        conn.send(JSON.stringify(
          { "op": "subscribe",
            "market": cn,
            "channel" : "ticker"}));
        /*conn.send(JSON.stringify(
          { "op": "subscribe",
            "market": cn,
            "channel" : "markets"}));*/}
    }

conn.onmessage = function(data) {
            message = JSON.parse(data.data);
            //console.log(message)
            if (message.type == "update" && message.channel == "ticker"){
              priceMemoryFTXUS[mapPairs[message.market]].price = (message.data.bid + message.data.ask)/2
              priceMemoryFTXUS[mapPairs[message.market]].bid = message.data.bid
              priceMemoryFTXUS[mapPairs[message.market]].praskice = message.data.ask
            }
            //console.log(priceMemory)
            //priceMemory[]
        }

conn.onerror = function(error) {
            console.log("ftxus error")
            console.log(error)
            //for (let i = 0; i<tickers.length; i++){
            //  console.log(tickers[i].s)
            //}
        }

module.exports = {stream : priceMemoryFTXUS}
