const WebSocket = require('ws');
const Coins = ['XRP','LTC','XLM','DOGE','ADA','ALGO','BCH','DGB','BTC','ETH','FIL', 'SGB']
// const Coins = ['SGB']

priceMemoryGateIo = {}
for (let cn of Coins) {priceMemoryGateIo[cn] = {}}
let pairs = Coins.map((x)=> x+"_USDT")
let client_id_gateio = 1

let tradesGateIo= {}
let volumesGateIo = {}
function resetTradesGateIo(){
  for (let cn of Coins) {tradesGateIo[cn] = []}
  for (let cn of Coins) {volumesGateIo[cn] = []}
}
resetTradesGateIo()
function socket_send_cmd(socket, cmd, params) {
    if (!params)
        params = [];
    var msg = {
        id: client_id_gateio++,
        method: cmd,
        params: params
    };
    socket.send(JSON.stringify(msg));
}

async function initialize_conn(conn) {
  conn.onopen = function(evt) {

        //console.log("connected");
        socket_send_cmd(conn, 'depth.subscribe', pairs.map(x=>[x, 1, "0.0001"]));
        socket_send_cmd(conn, 'ticker.subscribe', pairs);
        socket_send_cmd(conn, 'trades.subscribe', pairs);
      }

  conn.onmessage = function(data) {
              message = JSON.parse(data.data);
              //console.log(message)
              if (message.result == "pong"){
                if (message.error == null)
                {//console.log(message)
                  last_pong_id_gateio = message.id}
              }
              if (message.method == "ticker.update") {
                //console.log(message)
                cn = message.params[0].split("_")[0]
                priceMemoryGateIo[cn].qV = parseFloat(message.params[1].baseVolume)
              }

              if (message.method == "trades.update") {
                //console.log(message)
                cn = message.params[0].split("_")[0]

                for (let i = 0; i < message.params[1].length; i++){
                tradesGateIo[cn].push(parseFloat(message.params[1][i].price))
                volumesGateIo[cn].push(parseFloat(message.params[1][i].amount))
              }
              }

              if (message.method == "depth.update") {
                cn = message.params[2].split("_")[0]
                // console.log(message)
                if (message.params[1].bids != undefined){

                  priceMemoryGateIo[cn].bid = parseFloat(message.params[1].bids[0][0])
                }
                if (message.params[1].asks != undefined){

                  priceMemoryGateIo[cn].ask = parseFloat(message.params[1].asks[0][0])
                }
                if (priceMemoryGateIo[cn].ask != undefined && priceMemoryGateIo[cn].bid != undefined){
                  priceMemoryGateIo[cn].price = (priceMemoryGateIo[cn].ask + priceMemoryGateIo[cn].bid)/2
                }
              }
              // console.log(priceMemoryGateIo)
              conn.onerror = function(error) {
                          console.log(error)
                          //for (let i = 0; i<tickers.length; i++){
                          //  console.log(tickers[i].s)
                          //}
                  }
            }


  conn.onerror = function(error) {
              console.log("gateio error")
              console.log(error)
              //for (let i = 0; i<tickers.length; i++){
              //  console.log(tickers[i].s)
              //}
        }
}


//const conn = new WebSocket("wss://ws.gate.io/v3");
let last_ping_id_gateio = client_id_gateio
let last_pong_id_gateio = client_id_gateio
let conn = new WebSocket("wss://ws.gate.io/v3");
initialize_conn(conn)

setInterval(async() => {
      if (last_ping_id_gateio == last_pong_id_gateio){
        socket_send_cmd(conn, 'server.ping', []);
        last_ping_id_gateio = client_id_gateio-1
      }
      else{
        conn.close()
        console.log("gateio disconnected, trying to reconnect")
        conn = new WebSocket("wss://ws.gate.io/v3");
        initialize_conn(conn)
        last_ping_id_gateio = client_id_gateio
        last_pong_id_gateio = client_id_gateio
      }
    },15 * 1000)


module.exports = {stream : priceMemoryGateIo, unit : "USDT", trades: {prices : tradesGateIo, volumes : volumesGateIo, resetTrades : resetTradesGateIo}}
