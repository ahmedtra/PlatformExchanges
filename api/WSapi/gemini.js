const WebSocket = require('ws');
const Coins = ['XRP', 'LTC', 'XLM', 'DOGE', 'ADA', 'ALGO', 'BCH', 'DGB', 'BTC', 'ETH', 'FIL', 'USDT', 'SGB']
const geminiCoins = ['LTC', 'DOGE', 'BCH', 'BTC', 'ETH', 'FIL', 'USDT']
FreqUpdateVol = 5


let pairsGemini = Coins.map((token) => {
  return token + "USD"
})

let mapPairs = {}
for (let i = 0; i < Coins.length; i++) {
  mapPairs[pairsGemini[i]] = Coins[i]
}

let priceMemoryGemini = {}
for (let cn of Coins) { priceMemoryGemini[cn] = {} }


let tradesGemini = {}
let volumesGemini = {}
for (let cn of Coins) { volumesGemini[cn] = {} }

function resetTradesGemini() {
  for (let cn of Coins) { tradesGemini[cn] = [] }
  for (let cn of Coins) { volumesGemini[cn] = [] }
}
resetTradesGemini()

function getLastHeartbeat(lastHeartBeat, index, msg) {
  if (lastHeartBeat[geminiCoins[index]] != msg.socket_sequence) {
    setTimeout(
      function () {
        /* console.log("\n \n \n \n \n \n \n \n \n \n \n \n" +
          "======== GEMINI WS POINT :" + msg.type + " TEST ========"
          + "\n    ======== socket_sequence : " + msg.socket_sequence + " ========"
          + "\n         ========  " + geminiCoins[index] + " ========") */
        lastHeartBeat[geminiCoins[index]] = msg.socket_sequence;
      }, 2000*FreqUpdateVol);
    return true;
  }
  else {
    console.log("error");
    return false;
  }

}


/* ---- VOLUME START ---- */

const axios = require('axios')

setInterval(async () => {

  for (var pair of pairsGemini) {
    var http = 'https://api.gemini.com/v1/pubticker/' + pair

    try {
      var x = await axios.get(http)
      var volume = Object.values(x.data.volume)[0]
      priceMemoryGemini[mapPairs[pair]].qV = parseFloat(volume)
    }
    catch (e) { }


  }

}, FreqUpdateVol * 1000)

/* ---- VOLUME END ---- */



/* ---- BID & ASK START ---- */

let lastHeartBeat = {}

let listWss = geminiCoins.map((coin) => {
  try {
    let wss = 'wss://api.gemini.com/v1/marketdata/' + coin + 'usd?change=true&heartbeat=true'
    ws = new WebSocket(wss)
    return ws;
  } catch (error) { }

})
listWss.map((GEMINIWsPoint, index) => {
  GEMINIWsPoint.onmessage = (fmsg) => {
    var msg = JSON.parse(fmsg.data);
    if (msg.type == "heartbeat") {
      if (!getLastHeartbeat(lastHeartBeat, index, msg)) {
        let newWss = 'wss://api.gemini.com/v1/marketdata/' + geminiCoins[index] + 'usd?trades=true&heartbeat=true';
        newWs = new WebSocket(newWss);
        GEMINIWsPoint.close();
        GEMINIWsPoint = newWs;
      }
    }
    else {
      if (Object.values(msg)[2] != 0) {
        let coin = GEMINIWsPoint.url.slice(35, GEMINIWsPoint.url.indexOf('usd'))
        try {
          if (Object.values(msg)[5][0].side == "ask") {
            priceMemoryGemini[coin].ask = parseFloat(Object.values(msg)[5][0].price)
          }
          else if (Object.values(msg)[5][0].side == "bid") {
            priceMemoryGemini[coin].bid = parseFloat(Object.values(msg)[5][0].price)
          }
          priceMemoryGemini[coin].price = (priceMemoryGemini[coin].bid + priceMemoryGemini[coin].ask) / 2
          //console.log(priceMemoryGemini)
        } catch (err) { console.log(err) }
      }
    }
  };

});
/* ---- BID & ASK END ---- */




/* ---- TRADES START ---- */

let lastHeartBeat2 = {}

let listWss2 = geminiCoins.map((coin) => {
  try {
    let wss = 'wss://api.gemini.com/v1/marketdata/' + coin + 'usd?trades=true&heartbeat=true'
    ws = new WebSocket(wss)
    return ws;
  } catch (error) { }
})

listWss2.map((GEMINIWsPoint, index) => {
  GEMINIWsPoint.onmessage = (fmsg) => {
    var msg = JSON.parse(fmsg.data);
    if (msg.type == "heartbeat") {
      if (!getLastHeartbeat(lastHeartBeat2, index, msg)) {
        let newWss = 'wss://api.gemini.com/v1/marketdata/' + geminiCoins[index] + 'usd?trades=true&heartbeat=true';
        newWs = new WebSocket(newWss);
        GEMINIWsPoint.close();
        GEMINIWsPoint = newWs;
      }
    }
    else {
      if (Object.values(msg)[2] != 0) {
        let coin = GEMINIWsPoint.url.slice(35, GEMINIWsPoint.url.indexOf('usd'))
        try {
          tradesGemini[coin].push(parseFloat(Object.values(msg)[5][0].price))
          volumesGemini[coin].push(parseFloat(Object.values(msg)[5][0].price))
        } catch (err) { console.log(err) }
      }
    }
  };
});

/* ---- TRADES END ---- */






module.exports = { stream: priceMemoryGemini, unit: "USD", trades: { prices: tradesGemini, volumes: volumesGemini, resetTrades: resetTradesGemini } }
