//https://docs.bitfinex.com/reference#ws-public-trades
const WebSocket = require('ws');
const Coins = ['XRP','LTC','XLM','DOGE','ADA','ALGO','BCH','DGB','BTC','ETH','FIL', 'SGB']

let pairsBitfinex = Coins.map((token)=> {
          let tkrst = token
          if ("DOGE" == token) {tkrst = token+":"}
          else if ("BCH" == token) {tkrst = token+"N:"}
          else if ("ALGO" == token) {tkrst = token.substring(0,3)}
          return tkrst
        })

let pairs = pairsBitfinex.map((x) => "t"+ x +"USD")

let mapPairs = {}
for (let i = 0; i<pairs.length; i++) {
  mapPairs[pairsBitfinex[i]] = Coins[i]
}

let tradesBitfinex= {}
let volumesBitfinex = {}
function resetTradesBitfinex(){
  for (let cn of Coins) {tradesBitfinex[cn] = []}
  for (let cn of Coins) {volumesBitfinex[cn] = []}
}
resetTradesBitfinex()
//console.log(mapPairs)
let mpChannel = {}
let mpChannelBook = {}
let mpChannelTrades = {}
let priceMemoryBitfinex = {}

for (let cn of Coins){
  priceMemoryBitfinex[cn] = {}
}

async function initialize_conn(conn){
  conn.onopen = function(evt) {
      for (let cn of pairs){
          conn.send(JSON.stringify(
            { event: "subscribe",
              symbol: cn,
              channel : "book",
              len : "1"}));
          conn.send(JSON.stringify(
            { event: "subscribe",
              symbol: cn,
              channel : "ticker"}));
          conn.send(JSON.stringify(
            { event: "subscribe",
              symbol: cn,
              channel : "trades"}));}
      }

  conn.onmessage = function(data) {
              message = JSON.parse(data.data);
              //console.log(message)
              //console.log(mpChannel)
              if (Array.isArray(message) && Array.isArray(message[1]) && mpChannel[message[0]] != undefined){
                //console.log("in ticker")
                //priceMemoryBitfinex[mpChannel[message[0]]].price = (parseFloat(message[1][0]) + parseFloat(message[1][2]))/2
                priceMemoryBitfinex[mpChannel[message[0]]].qV = parseFloat(message[1][7])*parseFloat(message[1][6])
              }
              else if (Array.isArray(message) && Array.isArray(message[1]) && mpChannelBook[message[0]] != undefined){
                //console.log("in book")
                if (Array.isArray(message[1][0])){
                  priceMemoryBitfinex[mpChannelBook[message[0]]].bid = message[1][0][0]
                  priceMemoryBitfinex[mpChannelBook[message[0]]].ask = message[1][1][0]
                }
                else {
                  if (message[1][1] == 1){
                    if (message[1][2] > 0) {
                      priceMemoryBitfinex[mpChannelBook[message[0]]].bid = message[1][0]
                    }
                    else {
                      priceMemoryBitfinex[mpChannelBook[message[0]]].ask = message[1][0]
                    }
                  }
                }
                priceMemoryBitfinex[mpChannelBook[message[0]]].price = (priceMemoryBitfinex[mpChannelBook[message[0]]].bid + priceMemoryBitfinex[mpChannelBook[message[0]]].ask)/2
              }
              else if (Array.isArray(message) && Array.isArray(message[2]) && mpChannelTrades[message[0]] != undefined){
                //console.log("in book")
                tradesBitfinex[mpChannelTrades[message[0]]].push(parseFloat(message[2][3]))
                let amount = parseFloat(message[2][2]) > 0 ? parseFloat(message[2][2]) : - parseFloat(message[2][2])
                volumesBitfinex[mpChannelTrades[message[0]]].push(amount)
              }
              else if (message.event == "subscribed" && message.channel == "ticker"){
                mpChannel[message.chanId] = mapPairs[message.pair.split("USD")[0]]
                //console.log(mpChannel)
              }
              else if (message.event == "subscribed" && message.channel == "book"){
                mpChannelBook[message.chanId] = mapPairs[message.pair.split("USD")[0]]
                //console.log(mpChannelBook)
              }
              else if (message.event == "subscribed" && message.channel == "trades"){
                mpChannelTrades[message.chanId] = mapPairs[message.pair.split("USD")[0]]
                //console.log(mpChannelBook)
              }
              else if (message.event == "pong"){
                  last_pong_id_bitfinex = message.cid
              }
              //console.log(priceMemoryBitfinex)
          }

  conn.onerror = function(error) {

              console.log(error)
              //for (let i = 0; i<tickers.length; i++){
              //  console.log(tickers[i].s)
              //}
          }
}

let client_id_bitfinex = 0
let last_ping_id_bitfinex = client_id_bitfinex
let last_pong_id_bitfinex = client_id_bitfinex
let conn = new WebSocket("wss://api.bitfinex.com/ws/2");
initialize_conn(conn)

setInterval(async() => {
      if (last_ping_id_bitfinex == last_pong_id_bitfinex){
        conn.send(JSON.stringify(
          { "event": "ping",
          "cid": ++client_id_bitfinex }));
        last_ping_id_bitfinex = client_id_bitfinex
      }
      else{
        conn.close()
        console.log("bitfinex disconnected, trying to reconnect")
        conn = new WebSocket("wss://api.bitfinex.com/ws/2");
        initialize_conn(conn)
        last_ping_id_bitfinex = client_id_bitfinex
        last_pong_id_bitfinex = client_id_bitfinex
      }
    },15 * 1000)

module.exports = {stream : priceMemoryBitfinex, unit : "USD", trades: {prices : tradesBitfinex, volumes : volumesBitfinex, resetTrades : resetTradesBitfinex}}
