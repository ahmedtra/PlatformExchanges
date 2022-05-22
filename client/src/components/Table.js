import { useState, useEffect } from "react";
import axios from "axios";
import "./table.css";
const Tables = () => {
  const [loading, setLoading] = useState(false);
  const Coins = ["XRP","LTC","XLM","DOGE","ADA","ALGO","BCH","DGB","BTC","ETH","FIL","SGB"];
  const fees=[0.2,0.08,0.22,0.1,0.09,0.2,0.07,0.1,0.2,0.2,0.2]
  const [valueCoins, setValueOfCoins] = useState([]);
  const [keyExchangers, setkeyExchangers] = useState([]);
  const [include, setincludeFees] = useState(true);
  var i = 0;
  const [exchangers, setExchngers] = useState({
    coinbase: {},
    okex: {},
    kraken: {},
    binance: {},
    binanceus: {},
    huobi: {},
    ftx: {},
    kucoin: {},
    bitfinex: {},
    gateio: {},
    gemini: {},
  });
  useEffect(() => {
    const fetchExchangers = async () => {
      let res = await axios.get("http://localhost:5000/api/");
      setExchngers({
        coinbase: res.data.coinbase.stream,
        okex: res.data.okex.stream,
        kraken: res.data.kraken.stream,
        binance: res.data.binance.stream,
        binanceus: res.data.binanceus.stream,
        huobi: res.data.huobi.stream,
        ftx: res.data.ftx.stream,
        kucoin: res.data.kucoin.stream,
        bitfinex: res.data.bitfinex.stream,
        gateio: res.data.gateio.stream,
        gemini: res.data.gemini.stream,
      });
      setLoading(true);
    };
    fetchExchangers();
    if (loading) {
      setValueOfCoins(Object.values(exchangers));
      setkeyExchangers(Object.keys(exchangers));
    }
  });
let ask=[]
let bid=[]
  const includeFees = () => {
    setincludeFees(false);
  };
Coins.map((coin) => 
{
  valueCoins.map((ech) => (
  
 ech[coin] && Object.keys(ech[coin]).length !== 0
        ? ask.push( ech[coin].ask) 
          && bid.push(ech[coin].bid)
        : ""
      ))
ask.push("/")
bid.push("/")
})
let  minAsk=[]
let maxBid =[]
minAsk=(ask.toString()).split("/");
maxBid=(bid.toString()).split("/");
let mks=[]
let mk=[]
for (var i=0;i<Coins.length;i++)
{
  mk[i]= (Array(minAsk[i])[0]).split(',').filter(e=>e)
  mk[i]= mk[i].map(e=>Number(e))
  mks[i]= (Array(maxBid[i])[0]).split(',').filter(e=>e)
  mks[i]= mks[i].map(e=>Number(e))
}
  return (
    <div className="container">
      <table className="styled-table" border={1}>
        <thead>
          <tr>
            <th></th>
            <th></th>
            <th>Percentage</th>
            <th>Best Price</th>
            {keyExchangers.map((exchangers) => (
              <th>{exchangers}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {include?Coins.map((coin,keys) => (
            <>
              <tr>
                {
                  <>
                    <th rowSpan={2}>{coin}</th>
                    <th>Ask</th>
                    <th rowSpan={2}  className={Math.floor((((Math.min(...mk[keys]))/(Math.max(...mks[keys])))-1)*10000)<0? "green":""}>{Math.floor((((Math.min(...mk[keys]))/(Math.max(...mks[keys])))-1)*10000)}</th>
                    <th>{Number.parseFloat(Math.min(...mk[keys])).toFixed(5)}</th>
                    {valueCoins.map((ech) => (
                      <th className={ech[coin] && Object.keys(ech[coin]).length !== 0
                        && Number.parseFloat(ech[coin].ask)===Math.min(...mk[keys])?"active":""}>
                        {ech[coin] && Object.keys(ech[coin]).length !== 0
                          ? Number.parseFloat(ech[coin].ask).toFixed(5)
                          : "-"}{" "}
                      </th>
                    ))}
                  </>
                }{" "}
              </tr>

              <tr>
                {
                  <>
                    <th>Bid</th>

                    <th>{Number.parseFloat(Math.max(...mks[keys])).toFixed(5)}</th>
                    {valueCoins.map((ech) => (
                      <th className={ech[coin] && Object.keys(ech[coin]).length !== 0
                        && (Number.parseFloat(ech[coin].bid)===Math.max(...mks[keys]))?"active":""}>
                        {ech[coin] && Object.keys(ech[coin]).length !== 0
                          ? Number.parseFloat(ech[coin].bid).toFixed(5)
                          : "-"}{" "}
                      </th>
                    ))}
                  </>
                }{" "}
              </tr>
            </>
          )) :
          Coins.map((coin,key) => (
            <>
              <tr>
                {
                  <>
                    <th rowSpan={2}>{coin}</th>
                    <th>Ask</th>
                    <th rowSpan={2} className={Math.floor(((((Math.min(...mk[key]))*(1+fees[key]/100))/((Math.max(...mks[key]))*(1-fees[key]/100)))-1)*10000)<0? "green":""}>
                      {Math.floor(((((Math.min(...mk[key]))*(1+fees[key]/100))/((Math.max(...mks[key]))*(1-fees[key]/100)))-1)*10000)}</th>
                    <th>{Number.parseFloat((Math.min(...mk[key]))*(1+fees[key]/100)).toFixed(5)}</th>
                    {valueCoins.map((ech) => (
                      <th className={ech[coin] && Object.keys(ech[coin]).length !== 0
                        && Number.parseFloat((ech[coin].ask)*(1+fees[key]/100))===(Math.min(...mk[key]) *(1+fees[key]/100))?"active":""}>
                        {ech[coin] && Object.keys(ech[coin]).length !== 0
                          ? Number.parseFloat((ech[coin].ask)*(1+fees[key]/100)).toFixed(5)
                          : "-"}{" "}
                      </th>
                    ))}
                  </>
                }{" "}
              </tr>
              <tr>
                {
                  <>
                    <th>Bid</th>
                    <th>{Number.parseFloat((Math.max(...mks[key]))*(1-fees[key]/100)).toFixed(5)}</th>
                    {valueCoins.map((ech) => (
                      <th className={ech[coin] && Object.keys(ech[coin]).length !== 0
                        && Number.parseFloat((ech[coin].bid)*(1-fees[key]/100))===(Math.max(...mks[key]) *(1-fees[key]/100))?"active":""}>
                        {ech[coin] && Object.keys(ech[coin]).length !== 0
                          ? Number.parseFloat((ech[coin].bid)*(1-fees[key]/100)).toFixed(5)
                          : "-"}{" "}
                      </th>
                    ))}
                  </>
                }{" "}
              </tr>
            </>
          )) 
          }
        </tbody>
      </table>
      <button onClick={includeFees}>Include Fees</button>
    </div>
  );
}
export default Tables;
