const WebSocket = require('ws');
const request = require('request');
const Coins = ['XRP','LTC','XLM','DOGE','ADA','ALGO','BCH','DGB','BTC','ETH','FIL']

priceMemoryKucoin = {}
for (let cn of Coins) {priceMemoryKucoin[cn] = {}}


let tradesKucoin= {}
let volumesKucoin = {}
function resetTradesKucoin(){
  for (let cn of Coins) {tradesKucoin[cn] = []}
  for (let cn of Coins) {volumesKucoin[cn] = []}
}

priceMemoryKucoin["SGB"] = {}
tradesKucoin["SGB"] = {}
volumesKucoin["SGB"] = {}

resetTradesKucoin()
//console.log(priceMemory)
let pairs = Coins.map((x)=> x+"-USDT" ).join(",")
let pairs_p = Coins.map((x)=> x+"-USDT_1day").join(",")
let mapPairs = {}
let pairsKucoin = Coins.map((x)=> x+"-USDT")
for (let i = 0; i<Coins.length; i++) {
  mapPairs[pairsKucoin[i]] = Coins[i]
}
//let endpoint = ""
//let token = ""

const axios = require('axios')
setInterval(async() => {
  try{
  let response = await axios.get("https://api.kucoin.com/api/v1/market/allTickers")
  //console.log(response.data)
  for (var dic of response.data.data.ticker){
    if (pairsKucoin.includes(dic.symbol)){
      priceMemoryKucoin[mapPairs[dic.symbol]].qV = dic.volValue
    }
  }
}
  catch (e) {
    console.log(e)
  }
}, 10000)

client_id_kucoin = 1

let last_ping_id_kucoin = client_id_kucoin
let last_pong_id_kucoin = client_id_kucoin
id = 1

let token = undefined
let endpoint = undefined

async function initialize_connection(conn){

  conn.onopen = function(evt) {
          conn.send(JSON.stringify(
            { "type": "subscribe",
            "topic": "/market/ticker:"+pairs ,
            "privateChannel" : false,
              "response" : true,
              "id": id}));
          conn.send(JSON.stringify(
            { "type": "subscribe",
            "topic": "/market/match:"+pairs ,
            "privateChannel" : false,
              "response" : true,
              "id": id}));
              /*conn.send(JSON.stringify(
                { "type": "subscribe",
                "topic": "/market/candles:"+pairs_p ,
                "privateChannel" : false,
                  "response" : true,
                  "id": id}));*/
      }

  conn.onmessage = function(data) {
              message = JSON.parse(data.data);

              if (message.subject == "trade.ticker"){
                  cn = message.topic.split(":")[1].split("-")[0]
                  priceMemoryKucoin[cn].price = (parseFloat(message.data.bestAsk) + parseFloat(message.data.bestBid)) /2
                  priceMemoryKucoin[cn].bid = parseFloat(message.data.bestBid)
                  priceMemoryKucoin[cn].ask = parseFloat(message.data.bestAsk)}
                  /*if (message.subject == "trade.candles.update"){
                  cn = message.topic.split(":")[1].split("-")[0]
              priceMemoryKucoin[cn].qV = parseFloat(message.data.candles[6])}*/
              if (message.subject == "trade.l3match"){
                    cn = message.topic.split(":")[1].split("-")[0]
                    tradesKucoin[cn].push(parseFloat(message.data.price))
                    volumesKucoin[cn].push(parseFloat(message.data.size))
                  }
              if (message.type == "pong"){
                last_pong_id_kucoin = message.id
                //console.log(message)
              }
              //console.log(message)
              //console.log(priceMemoryKucoin)

          }

  conn.onerror = function(error) {
              console.log("kucoin WS error")
              console.log(error)
              //for (let i = 0; i<tickers.length; i++){
              //  console.log(tickers[i].s)
              //}
          }
}

async function launch_connection(){

    if (token == undefined || endpoint == undefined){
    await axios.post("https://api.kucoin.com/api/v1/bullet-public").then(response => {
      token =  response.data.data.token
      endpoint = response.data.data.instanceServers[0].endpoint
    })}
    //console.log(response.data.data.instanceServers[0].endpoint)
    //console.log(token)


    let conn = new WebSocket(endpoint+"?token="+token+"&[connectId="+id+"]");
    initialize_connection(conn)

    setInterval(async() => {

          if (last_ping_id_kucoin == last_pong_id_kucoin){

              conn.send(JSON.stringify(
                { "type": "ping",
                "id": ++client_id_kucoin , params : []
                    }));
            last_ping_id_kucoin = client_id_kucoin
          }
          else{
            conn.close()
            console.log("kucoin disconnected, trying to reconnect")
            conn = new WebSocket(endpoint+"?token="+token+"&[connectId="+id+"]");
            initialize_connection(conn)
            last_ping_id_kucoin = client_id_kucoin
            last_pong_id_kucoin = client_id_kucoin
          }
        },15 * 1000)

   //console.log(conn)
}

launch_connection()

module.exports = {stream : priceMemoryKucoin, unit : "USDT", trades: {prices : tradesKucoin, volumes : volumesKucoin, resetTrades : resetTradesKucoin}}
