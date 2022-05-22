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
let ar=[]
  const includeFees = () => {
    setincludeFees(false);
  };
Coins.map((coin) => 
{
  valueCoins.map((ech) => (
  
 ech[coin] && Object.keys(ech[coin]).length !== 0
        ? ar.push( ech[coin].ask)
        : ""
      ))
ar.push("/")
})
var vals=[]

vals=(ar.toString()).split("/");
let mk=[]
for (var i=0;i<Coins.length;i++)
{
  mk[i]= (Array(vals[i])[0]).split(',').filter(e=>e)
  mk[i]= mk[i].map(e=>Number(e))
}
console.log(Math.min(...mk[7]))
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
                    <th>5255</th>
                    <th>{Math.min(...mk[keys])}</th>

                    {valueCoins.map((ech) => (
                      <th>
                        {ech[coin] && Object.keys(ech[coin]).length !== 0
                          ? Number.parseFloat(ech[coin].ask).toFixed(6)
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
                    <th>dddd</th>

                    <th>{Math.max(...mk[keys])}</th>
                    {valueCoins.map((ech) => (
                      <th>
                        {ech[coin] && Object.keys(ech[coin]).length !== 0
                          ? Number.parseFloat(ech[coin].bid).toFixed(7)
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
                    <th>5255</th>
                    <th>{Math.min(...mk[key])}</th>

                    {valueCoins.map((ech,key) => (
                      <th>
                        {ech[coin] && Object.keys(ech[coin]).length !== 0
                          ?Number.parseFloat( ((ech[coin].ask)*(1+fees[key]/100))).toFixed(7)
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
                    <th>dddd</th>

                    <th>{Math.min(...mk[key])}</th>
                    {valueCoins.map((ech,key) => (
                      <th>
                        {ech[coin] && Object.keys(ech[coin]).length !== 0
                          ?Number.parseFloat((ech[coin].bid)*(1-fees[key]/100)).toFixed(7)
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
};
export default Tables;
