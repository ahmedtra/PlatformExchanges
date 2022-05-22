
const WebSocket = require('ws');
const URL_SOCKET = "wss://stream.crypto.com/v2/market";
let wss = new WebSocket(URL_SOCKET);
const Coins = ['XRP', 'LTC', 'XLM', 'DOGE', 'ADA', 'ALGO', 'BCH', 'DGB', 'BTC', 'ETH', 'FIL', 'USDT', 'SGB']
const CryptoCoins = ['XRP', 'LTC', 'XLM', 'DOGE', 'ADA', 'ALGO', 'BCH', 'BTC', 'ETH', 'FIL']
FreqUpdateVol = 10



testId=0
client_id_crypto = 0
let last_ping_id_crypto = client_id_crypto
let last_pong_id_crypto = client_id_crypto

let pairsCRYPTO = Coins.map((token) => {
    if (CryptoCoins.includes(token)) { return token + "_USDT" }
    return token + "/USD"
})

let channel = []
for (let cn of CryptoCoins) {
    channel.push(`trade.` + cn + `_USDT`)
    channel.push(`ticker.` + cn + `_USDT`)

}

let mapPairs = {}
for (let i = 0; i < Coins.length; i++) {
    mapPairs[pairsCRYPTO[i]] = Coins[i]
}
let priceMemoryCRYPTO = {}
for (let cn of Coins) { priceMemoryCRYPTO[cn] = {} }


let tradesCRYPTO = {}
let volumesCRYPTO = {}
for (let cn of Coins) { volumesCRYPTO[cn] = {} }

function resetTradesCRYPTO() {
    for (let cn of Coins) { tradesCRYPTO[cn] = [] }
    for (let cn of Coins) { volumesCRYPTO[cn] = [] }
}
resetTradesCRYPTO()

async function initialize_conn(conn) {
    conn.onopen = function (evt) {

        conn.send(JSON.stringify(
            {
                "id": 1587523073344,
                "method":"subscribe",
                "params": {
                    "channels": channel
                },
                "nonce": Date.now()
            },{
                "id": 1587523073344,
                "method": "public/respond-heartbeat"
              }));


    }



    setInterval(() => {
        conn.onmessage = function (fmsg) {
            last_ping_id_crypto = ++client_id_crypto
            result = JSON.parse(fmsg.data)
            obj = Object.values(result)
            last_ping_id_crypto = ++client_id_crypto
            result = JSON.parse(fmsg.data)
            obj = Object.values(result)


            if (obj[0] == 0 && obj[2].channel == "trade") {


                tradesCRYPTO[mapPairs[obj[2].data[0].i]].push(parseFloat(obj[2].data[0].p))
                volumesCRYPTO[mapPairs[obj[2].data[0].i]].push(parseFloat(obj[2].data[0].q))
                //console.log(volumesCRYPTO)
                //console.log(tradesCRYPTO)



            }

            if (obj[0] == 0 && obj[2].channel == "ticker") {
                priceMemoryCRYPTO[mapPairs[obj[2].data[0].i]].price = (obj[2].data[0].b + obj[2].data[0].k) / 2
                priceMemoryCRYPTO[mapPairs[obj[2].data[0].i]].bid = obj[2].data[0].b
                priceMemoryCRYPTO[mapPairs[obj[2].data[0].i]].ask = obj[2].data[0].k
                priceMemoryCRYPTO[mapPairs[obj[2].data[0].i]].qV = obj[2].data[0].v
                //console.log(priceMemoryCRYPTO)


            }
            if (obj[1] == 'public/heartbeat') {
                conn.send(JSON.stringify(
                    {
                        "id": obj[0],
                        "method": "public/respond-heartbeat"
                      }));
            }
        }
    }, 1000);

    conn.onerror = function (error) {
        console.log("CRYPTO error")
        console.log(error)

    }
}

initialize_conn(wss)



setInterval(async () => {
    if (last_ping_id_crypto > last_pong_id_crypto) {
        // console.log("======== TEST ID :  " + (++testId) + "  ========")
        // console.log("last ping: "+last_ping_id_crypto + "  |  last pong :" +last_pong_id_crypto)
        // console.log("numbers of responses in last "+FreqUpdateVol+"s : "+(last_ping_id_crypto - last_pong_id_crypto))

        last_pong_id_crypto=last_ping_id_crypto;
    }
    else {
      // console.log("last ping: "+last_ping_id_crypto + "  |  last pong :" +last_pong_id_crypto)
      // console.log("numbers of responses in last "+FreqUpdateVol+"s : "+(last_ping_id_crypto - last_pong_id_crypto))

      conn.close()
      // console.log("CryptoCom disconnected, trying to reconnect")
      conn = new WebSocket(URL_SOCKET);

      initialize_conn(conn)
      last_ping_id_crypto = client_id_crypto
      last_pong_id_crypto = client_id_crypto
    }
  }, FreqUpdateVol * 1000)

module.exports = { stream: priceMemoryCRYPTO, unit: "USD", trades: { prices: tradesCRYPTO, volumes: volumesCRYPTO, resetTrades: resetTradesCRYPTO } }
