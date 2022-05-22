const WebSocket = require('ws');
const Coins = ['XRP','LTC','XLM','DOGE','ADA','ALGO','BCH','DGB','BTC','ETH','FIL', 'USDT', 'SGB']

FreqUpdateVol = 10

//let pairsFTX = Coins.map((x)=> x+"-PERP")

let pairsFTX = Coins.map((token)=> {
          if (["XLM", "DOGE", "FIL", "ADA", "ALGO"].includes(token)) {return token+"-PERP"}
          return token + "/USD"
        })

let mapPairs = {}
for (let i = 0; i<Coins.length; i++) {
  mapPairs[pairsFTX[i]] = Coins[i]
}

priceMemoryFTX = {}
for (let cn of Coins) {priceMemoryFTX[cn] = {}}

let tradesFTX = {}
let volumesFTX = {}
function resetTradesFTX(){
  for (let cn of Coins) {tradesFTX[cn] = []}
  for (let cn of Coins) {volumesFTX[cn] = []}
}
resetTradesFTX()

const axios = require('axios')
setInterval(async() => {
  try{
  let response = await axios.get("https://ftx.com/api/markets")
  for (var dic of response.data.result){
    if (pairsFTX.includes(dic.name)){
      priceMemoryFTX[mapPairs[dic.name]].qV = dic.quoteVolume24h
    }
  }
}
  catch (e) {
    console.log("error getting Volume from FTX api")
  }
  }
  //console.log(response.data.result[0])

,FreqUpdateVol * 1000)


async function initialize_conn(conn){
conn.onopen = function(evt) {
    for (let cn of pairsFTX){
        conn.send(JSON.stringify(
          { "op": "subscribe",
            "market": cn,
            "channel" : "ticker"}));
            conn.send(JSON.stringify(
              { "op": "subscribe",
                "market": cn,
                "channel" : "trades"}));}
    }



conn.onmessage = function(data) {
            message = JSON.parse(data.data);
            if (message.type == "update" && message.channel == "ticker"){
              priceMemoryFTX[mapPairs[message.market]].price = (message.data.bid + message.data.ask)/2
              priceMemoryFTX[mapPairs[message.market]].bid = message.data.bid
              priceMemoryFTX[mapPairs[message.market]].ask = message.data.ask
            }
            if (message.type == "pong"){
              last_pong_id_ftx = last_ping_id_ftx
              //console.log("pong", last_pong_id_ftx)
            }
            if (message.type == "update" && message.channel == "trades"){

              for (let i = 0; i<message.data[0].length; i++){
              tradesFTX[mapPairs[message.market]].push(parseFloat(message.data[i].price))
              volumesFTX[mapPairs[message.market]].push(parseFloat(message.data[i].size))
            }
            }

            // console.log(priceMemoryFTX)
        }

conn.onerror = function(error) {
            console.log("ftx error")
            console.log(error)
            //for (let i = 0; i<tickers.length; i++){
            //  console.log(tickers[i].s)
            //}
        }
}

client_id_ftx = 0
let last_ping_id_ftx = client_id_ftx
let last_pong_id_ftx = client_id_ftx
let conn = new WebSocket("wss://ftx.com/ws/");

initialize_conn(conn)

setInterval(async() => {
      if (last_ping_id_ftx == last_pong_id_ftx){
        last_ping_id_ftx = ++client_id_ftx
        conn.send(JSON.stringify({ "op": "ping"}))
      }
      else{
        conn.close()
        console.log("ftx disconnected, trying to reconnect")
        conn = new WebSocket("wss://ftx.com/ws/");

        initialize_conn(conn)
        last_ping_id_ftx = client_id_ftx
        last_pong_id_ftx = client_id_ftx
      }
    },15 * 1000)



module.exports = {stream : priceMemoryFTX, unit : "USD", trades: {prices : tradesFTX, volumes : volumesFTX, resetTrades : resetTradesFTX}}
