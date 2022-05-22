const axios = require('axios')
const WebSocket = require('ws');
const Coins = ['XRP','LTC','XLM','DOGE','ADA','ALGO','BCH','DGB','BTC','ETH','FIL','SGB']


let tradesBitrue = {}
let volumesBitrue = {}
function resetTradesBitrue(){
  for (let cn of Coins) {tradesBitrue[cn] = []}
  for (let cn of Coins) {volumesBitrue[cn] = []}
}
resetTradesBitrue()
priceMemoryBitrue = {}
let streams = Coins.map((x)=>x+"USDT").join("/")




async function initialize_connection(conn){

conn.onopen = function(evt) {
        conn.send(JSON.stringify({ event: "sub",params: ["btcusdt@ticker"] }));
    }



conn.onmessage = function(data) {
            msg = JSON.parse(data.data);
            console.log(data)
        }

conn.onerror = function(error) {
            console.log("bitrue error")
            console.log(error)
            //for (let i = 0; i<tickers.length; i++){
            //  console.log(tickers[i].s)
            //}
        }

conn.onping = function() {
            console.log("bitrue ping")
            conn.pong()
            //for (let i = 0; i<tickers.length; i++){
            //  console.log(tickers[i].s)
            //}
        }
}
axios.defaults.headers.post['X-MBX-APIKEY'] = '8e9463c9dec561be3d4896c1feab87ba2d267370d8d2d0e290f8c30f9a80db86'
async function launch_connection(){

    let listenKey = ""
    await axios.post("https://open.bitrue.com/poseidon/api/v1/listenKey").then(response => {
      listenKey = response.data.data.listenKey
    })

    setInterval(async() => {
      axios.put("https://open.bitrue.com/poseidon/api/v1/listenKey/"+listenKey)
    }, 20*60*1000)

    const conn = new WebSocket("wss://wsapi.bitrue.com/stream?listenKey="+listenKey);

    initialize_connection(conn)
    //console.log(response.data.data.instanceServers[0].endpoint)
    //console.log(token)
    //initialize_connection()

   //console.log(conn)
}

launch_connection()

module.exports = {stream : priceMemoryBitrue, unit : "USDT", trades: {prices : tradesBitrue, volumes : volumesBitrue, resetTrades : resetTradesBitrue}}
