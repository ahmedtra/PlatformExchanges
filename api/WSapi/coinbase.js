// https://docs.cloud.coinbase.com/exchange/docs/websocket-channels

const WebSocket = require('ws');
const Coins = ['XRP','LTC','XLM','DOGE','ADA','ALGO','BCH','DGB','BTC','ETH','FIL','USDT', 'SGB']

let pairs = Coins.map((x)=> {if (x == "XRP") {return x+"-USDT"}
                            else {return x+"-USD"}}
              )

let tradesCoinBase = {}
let volumesCoinBase = {}
function resetTradesCoinBase(){
  for (let cn of Coins) {tradesCoinBase[cn] = []}
  for (let cn of Coins) {volumesCoinBase[cn] = []}
}
resetTradesCoinBase()

let priceMemoryCoinBase = {}

let trade_ids = {}

async function initialize_conn(conn){
  conn.onopen = function(evt) {
          conn.send(JSON.stringify(
            { "type": "subscribe",
            "channels":[{
              "name": "ticker",
              "product_ids": pairs
          }],
            "product_ids": pairs ,
          })
          );
          conn.send(JSON.stringify(
            { "type": "subscribe",
            "channels":[{
              "name": "matches",
              "product_ids": pairs
          }],

          })

        );
      }

  conn.onmessage = function(data) {
              message = JSON.parse(data.data);

              if (message.product_id != undefined){
                if (message.type == "ticker"){
                trade_ids[message.product_id] = message.trade_id
                cn = message.product_id.split("-")[0]
                priceMemoryCoinBase[cn] = {price : (parseFloat(message.best_bid) + parseFloat(message.best_ask))/2,
                  qV : parseFloat(message.volume_24h) * (parseFloat(message.best_bid) + parseFloat(message.best_ask))/2,
                  bid : parseFloat(message.best_bid),
                  ask : parseFloat(message.best_ask)
                  }
                }

                if (message.type == "match"){
                trade_ids[message.product_id] = message.trade_id
                cn = message.product_id.split("-")[0]

                tradesCoinBase[cn].push(parseFloat(message.price))
                volumesCoinBase[cn].push(parseFloat(message.size))
                }
              }



              //console.log(message)
              console.log(priceMemoryCoinBase["LTC"])
          }

  conn.onerror = function(error) {

              console.log(error)
              //for (let i = 0; i<tickers.length; i++){
              //  console.log(tickers[i].s)
              //}
        }
}

let first_loop = true
let latest_trade_ids = {}


let conn = new WebSocket("wss://ws-feed.exchange.coinbase.com");
initialize_conn(conn)

setInterval(async() => {
      //console.log(latest_trade_ids, " ", trade_ids)
      //console.log(Object.entries(latest_trade_ids).some((x,val) => x[1] < trade_ids[x[0]]))
      if (!(Object.entries(latest_trade_ids).some((x,val) => x[1] < trade_ids[x[0]])) && !first_loop)
      {
        conn.close()
        console.log("coinbase is probably disconnected, trying to reconnect")
        conn = new WebSocket("wss://ws-feed.exchange.coinbase.com");
        initialize_conn(conn)
      }
      first_loop = false
      Object.entries(trade_ids).forEach((x,val) => latest_trade_ids[x[0]] = x[1])
    },15 * 1000)

module.exports = {stream : priceMemoryCoinBase, unit : "USD", trades: {prices : tradesCoinBase, volumes : volumesCoinBase, resetTrades : resetTradesCoinBase}}
