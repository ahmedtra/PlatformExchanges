const WebSocket = require('ws');
const Coins = ['XRP','LTC','XLM','DOGE','ADA','ALGO','BCH','DGB','BTC','ETH','FIL', 'SGB']

let pairs = Coins.map((x)=> x+"/USD")

priceMemoryOkex = {}

let tradesOkex= {}
let volumesOkex = {}
function resetTradesOkex(){
  for (let cn of Coins) {tradesOkex[cn] = []}
  for (let cn of Coins) {volumesOkex[cn] = []}
}
resetTradesOkex()

async function initialize_conn(conn){
  conn.onopen = function(evt) {
    for (var cn of Coins) {
          conn.send(JSON.stringify(
            { "op": "subscribe",
            "args" :[{
                "channel": "tickers",
                "instId" : cn+"-USDT"}
          ]}))
          conn.send(JSON.stringify(
            { "op": "subscribe",
            "args" :[{
                "channel": "trades",
                "instId" : cn+"-USDT"}
          ]}))

        };
      }

  conn.onmessage = function(data) {
              if (data.data == "pong"){
                last_pong_id_okex = last_ping_id_okex
                //console.log("pong", last_pong_id_okex)
              }
              else{

                message = JSON.parse(data.data);
                //console.log(message)

                if (message.data != undefined) {
                  cn = message.data[0].instId.split("-")[0]
                  if (message.arg.channel == "trades"){
                    tradesOkex[cn].push(parseFloat(message.data[0].px))
                    volumesOkex[cn].push(parseFloat(message.data[0].sz))
                  }

                  else {
                  priceMemoryOkex[cn] = {
                    price : (parseFloat(message.data[0].askPx) + parseFloat(message.data[0].bidPx))/2,
                    qV : parseFloat(message.data[0].volCcy24h),
                    bid : parseFloat(message.data[0].bidPx),
                    ask : parseFloat(message.data[0].askPx)
                }
              }
            }
            //console.log(priceMemory)
          }


              //for (let i = 0; i<tickers.length; i++){
              //  console.log(tickers[i].s)
              //}
          }

  conn.onerror = function(error) {
              console.log("okex error")
              console.log(error)
              //for (let i = 0; i<tickers.length; i++){
              //  console.log(tickers[i].s)
              //}
        }
}

client_id_okex = 0
let last_ping_id_okex = client_id_okex
let last_pong_id_okex = client_id_okex
let conn = new WebSocket("wss://wsaws.okex.com:8443/ws/v5/public");

initialize_conn(conn)

setInterval(async() => {
      if (last_ping_id_okex == last_pong_id_okex){
        last_ping_id_okex = ++client_id_okex
        conn.send("ping")
      }
      else{
        conn.close()
        console.log("okex disconnected, trying to reconnect")
        conn = new WebSocket("wss://wsaws.okex.com:8443/ws/v5/public");

        initialize_conn(conn)
        last_ping_id_okex = client_id_okex
        last_pong_id_okex = client_id_okex
      }
    },15 * 1000)

module.exports = {stream : priceMemoryOkex, unit : "USDT", trades: {prices : tradesOkex, volumes : volumesOkex, resetTrades : resetTradesOkex}}
