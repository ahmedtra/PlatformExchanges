const WebSocket = require('ws');
const Coins = ['XRP','LTC','XLM','DOGE','ADA','ALGO','BCH','DGB','BTC','ETH','FIL','USDT', 'SGB']

let pairs = Coins.map((x)=> x+"/USD")
priceMemoryKraken = {}

let tradesKraken= {}
let volumesKraken = {}
function resetTradesKraken(){
  for (let cn of Coins) {tradesKraken[cn] = []}
  for (let cn of Coins) {volumesKraken[cn] = []}
}
resetTradesKraken()
async function initialize_conn(conn){
conn.onopen = function(evt) {
        conn.send(JSON.stringify(
          { "event": "subscribe",
          "pair": pairs ,
          "subscription" :{
              "name":"ticker"
        }}));
        conn.send(JSON.stringify(
          { "event": "subscribe",
          "pair": pairs ,
          "subscription" :{
              "name":"spread"
        }}));
        conn.send(JSON.stringify(
          { "event": "subscribe",
          "pair": pairs ,
          "subscription" :{
              "name":"trade"
        }}));
    }



conn.onmessage = function(data) {
            message = JSON.parse(data.data);
            //console.log(message)
            if (Array.isArray(message) && message.includes("ticker")){
              cn = message[3].split("/")[0]
              if (cn == "XBT") {cn = "BTC"}
              priceMemoryKraken[cn] = {price : (parseFloat(message[1].a[0]) + parseFloat(message[1].b[0]))/2,
                qV : parseFloat(message[1].v[1]) * (parseFloat(message[1].a[0]) + parseFloat(message[1].b[0]))/2,
              bid : parseFloat(message[1].b[0]),
             ask:  parseFloat(message[1].a[0])
                  }
            }
            if (Array.isArray(message) && message.includes("spread")){
              cn = message[3].split("/")[0]
              if (cn == "XBT") {cn = "BTC"}
              priceMemoryKraken[cn].price = (parseFloat(message[1][0]) + parseFloat(message[1][1]))/2
              priceMemoryKraken[cn].bid = parseFloat(message[1][0])
              priceMemoryKraken[cn].ask = parseFloat(message[1][1])
            }
            if (Array.isArray(message) && message.includes("trade")){
              cn = message[3].split("/")[0]
              if (cn == "XBT") {cn = "BTC"}
              if (cn == "XDG") {cn = "DOGE"}

                for (let i = 0; i<message[1].length; i++){
                  tradesKraken[cn].push(parseFloat(message[1][i][0]))
                  volumesKraken[cn].push(parseFloat(message[1][i][1]))
                }


            }

            if (message.event == "pong"){
                last_pong_id_kraken = message.reqid
                //console.log(message)
            }
            // console.log(priceMemoryKraken)
            //for (let i = 0; i<tickers.length; i++){
            //  console.log(tickers[i].s)
            //}
        }

conn.onerror = function(error) {
            console.log("kraken error")
            console.log(error)
            //for (let i = 0; i<tickers.length; i++){
            //  console.log(tickers[i].s)
            //}
        }
}

let client_id_kraken = 0
let last_ping_id_kraken = client_id_kraken
let last_pong_id_kraken = client_id_kraken
let conn = new WebSocket("wss://ws.kraken.com");
initialize_conn(conn)

setInterval(async() => {

      if (last_ping_id_kraken == last_pong_id_kraken){
        conn.send(JSON.stringify(
          { "event": "ping",
          "reqid": ++client_id_kraken }));
        last_ping_id_kraken = client_id_kraken
      }
      else{
        conn.close()
        console.log("kraken disconnected, trying to reconnect")
        conn = new WebSocket("wss://ws.kraken.com");
        initialize_conn(conn)
        last_ping_id_kraken = client_id_kraken
        last_pong_id_kraken = client_id_kraken
      }
    },15 * 1000)


module.exports = {stream : priceMemoryKraken, unit : "USD", trades: {prices : tradesKraken, volumes : volumesKraken, resetTrades : resetTradesKraken}}
