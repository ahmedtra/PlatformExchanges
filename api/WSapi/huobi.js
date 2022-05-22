
const WebSocket = require('ws');
const Coins = ['XRP','LTC','XLM','DOGE','ADA','ALGO','BCH','DGB','BTC','ETH','FIL', 'SGB']

let pairs = Coins.map((x)=> {if(x == "DGB")
      {return x.toLowerCase()+"btc"} else {return x.toLowerCase()+"usdt" }})

priceMemoryHuobi = {}
for (let cn of Coins) {priceMemoryHuobi[cn] = {}}

let tradesHuobi= {}
let volumesHuobi = {}
function resetTradesHuobi(){
  for (let cn of Coins) {tradesHuobi[cn] = []}
  for (let cn of Coins) {volumesHuobi[cn] = []}
}
resetTradesHuobi()
var pako = require('pako');

var enc = new TextDecoder("utf-8");
async function initialize_conn(conn){
  conn.onopen = function(evt) {
      for (var cn of pairs){
          conn.send(JSON.stringify(
            { "sub": "market."+cn+".ticker",
            "id":"id"+cn}));
          conn.send(JSON.stringify(
            { "sub": "market."+cn+".trade.detail",
            "id":"id"+cn}));
            }

      }



  conn.onmessage = function(data) {
              //

              var data        = pako.inflate(data.data);
              var strData     = String.fromCharCode.apply(null, new Uint16Array(data));
              // Output to console
              message = JSON.parse(strData);
              //console.log(message);

              if (message.ch != undefined){
              if (message.ch.split(".")[1] == "dgbbtc") {
                  if (priceMemoryHuobi["BTC"].price != undefined) {
                  if (message.ch.split(".")[2] == "trade"){
                    tradesHuobi["DGB"].push(message.tick.data[0].price*priceMemoryHuobi["BTC"].price)
                    volumesHuobi["DGB"].push(message.tick.data[0].amout*priceMemoryHuobi["BTC"].price)
                  }
                  else{
                    priceMemoryHuobi["DGB"].price = (message.tick.bid + message.tick.ask)/2 * priceMemoryHuobi["BTC"].price
                    priceMemoryHuobi["DGB"].qV = message.tick.vol * priceMemoryHuobi["BTC"].price}
                  }
              }
              else{
                cn = message.ch.split(".")[1].split("usdt")[0].toUpperCase()
                if (message.ch.split(".")[2] == "trade"){
                  tradesHuobi[cn].push(message.tick.data[0].price)
                  volumesHuobi[cn].push(message.tick.data[0].amout)
                }
                else{
                  //console.log(cn)
                  priceMemoryHuobi[cn].price = (message.tick.bid + message.tick.ask)/2
                  priceMemoryHuobi[cn].bid = message.tick.bid
                  priceMemoryHuobi[cn].ask = message.tick.ask
                  priceMemoryHuobi[cn].qV = message.tick.vol
                }
              }
              //console.log(priceMemoryHuobi)
            }

            if (message.ping != undefined){
              conn.send(JSON.stringify({ "pong": message.ping}))
              last_ping_id_huobi = message.ping
            }
              //for (let i = 0; i<tickers.length; i++){
              //  console.log(tickers[i].s)
              //}
          }


  conn.onerror = function(error) {
              console.log("huobi error")
              console.log(error)
              //for (let i = 0; i<tickers.length; i++){
              //  console.log(tickers[i].s)
              //}
          }
  }


let client_id_huobi = 0
let last_ping_id_huobi = client_id_huobi+1
let last_pong_id_huobi = client_id_huobi

let conn = new WebSocket("wss://api-aws.huobi.pro/ws");
initialize_conn(conn)

setInterval(async() => {
      if (last_ping_id_huobi > last_pong_id_huobi){
        /*conn.send(JSON.stringify(
          { "action": "ping",
          "data": {"ts":++client_id_huobi} }));*/
        last_pong_id_huobi = last_ping_id_huobi
      }
      else{
        conn.close()
        console.log("huobi disconnected, trying to reconnect")

        conn = new WebSocket("wss://api-aws.huobi.pro/ws");
        initialize_conn(conn)

      }
    },20 * 1000)


module.exports = {stream : priceMemoryHuobi, unit : "USDT", trades: {prices : tradesHuobi, volumes : volumesHuobi, resetTrades : resetTradesHuobi}}
