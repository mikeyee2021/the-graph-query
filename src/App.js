import './App.css';
import { createClient } from 'urql'
import { useEffect, useState } from 'react'
import { CSVLink } from "react-csv";

const first = 10 // 1000
const endQuery = 10 //4000
const initialSkip = 0
const csvFilename = 'swap-report-'+Date.now()+'.csv'
// const APIURL = "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2" // uniswap
// const APIURL = https://api.thegraph.com/subgraphs/id/0x9bde7bf4d5b13ef94373ced7c8ee0be59735a298-2 // uniswap_v3
const APIURL = "https://api.thegraph.com/subgraphs/name/sushiswap/exchange" // sushiswap
// const APIURL = "https://api.thegraph.com/subgraphs/name/shrinivasmani/pancakeswap5" // pancakeswap

const client = createClient({
  url: APIURL
})

function App() {
  // const [swaps, setSwaps] = useState([])
  const [data, setData] = useState([])
  useEffect(() => {
    fetchData()
  }, [])

  // let TextFile = (response) => {
  //   if (response && response.length!==0) {
  //     const element = document.createElement("a");
  //     const textFile = new Blob([[JSON.stringify(response.data.swaps)], {type: 'text/plain'}]); //pass data from localStorage API to blob
  //     element.href = URL.createObjectURL(textFile);
  //     element.download = "swaps.txt";
  //     document.body.appendChild(element); 
  //     element.click();
  //   }
  // }

  let CsvFile = (dataset) => {
    // console.log(dataset);
    const data = [];

    for (let i=0;i<dataset.length;i++) {
      let record = dataset[i]
      data.push({
        id:record.transaction.id, 
        swapId:record.id,
        timestamp:record.timestamp,
        blockNumber:record.transaction.blockNumber,   // for pancakeswap, block instead of blocknumber
        fromCoin:record.pair.token0.symbol,
        toCoin:record.pair.token1.symbol,
        amount0In:record.amount0In,
        amount1In:record.amount1In,
        amount0Out:record.amount0Out,
        amount1Out:record.amount1Out
      })
    }

    // const headers = [
    //   { label: "id", key: "id" },
    //   { label: "timestamp", key: "timestamp" }
    // ];
     
    // const data = [
    //   { id: "0xfea2fa9edcd1ee7e70b33cf39839251e36daa18557a0e127773b25ad512bc43d", timestamp: "1636603439" },
    //   { id: "0xfea2fa9edcd1ee7e70b33cf39839251e36daa18557a0e127773b25ad512bc43d", timestamp: "1636603439" }
    // ];
     
    setData(data);
  }

  async function fetchData() {
    let dataset = []

    for (let skip=initialSkip;skip<endQuery;skip+=first) {
      console.log(skip);
// for pancakeswap, change blockNumber to block !!!
      let query = `
        query {
          swaps(first:${first}, skip:${skip}, orderBy: timestamp, orderDirection: desc) {
            id
            transaction{
              id
              blockNumber
            }
            pair {
              token0 {
                id
                symbol
              }
              token1 {
                id
                symbol
              }
            }
            timestamp
            sender
            amount0In
            amount1In
            amount0Out
            amount1Out
            to
            logIndex
            amountUSD
          }
        }
      `
      
      const response = await client.query(query).toPromise();
      console.log('response:', response)
      // console.log('swaps:', response.data.swaps);
      // setSwaps(response.data.swaps);
      // TextFile(response);
      dataset.push(...response.data.swaps);
    }
    
    CsvFile(dataset);

  }

  return (
    <div className="App">
      <CSVLink data={data} filename={csvFilename} asyncOnClick={true} onClick={fetchData}>
        <button type="button" class="btn btn-info" style={{margin:10+'px'}}>
          Export to CSV
        </button>
      </CSVLink>
      <table class="table table-striped">
        <tbody>
            <tr>
              <th>id</th>
              <th>timestamp</th>
              <th>blockNumber</th>
              <th>fromCoin</th>
              <th>toCoin</th>
              <th>amount0In</th>
              <th>amount1In</th>
              <th>amount0Out</th>
              <th>amount1Out</th>
            </tr>
      {
        data.map((datum, index) => (   
            <tr key={datum.swapId}>
              <td>{datum.id}</td>
              <td>{datum.timestamp}</td>
              <td>{datum.blockNumber}</td>
              <td>{datum.fromCoin}</td>
              <td>{datum.toCoin}</td>
              <td>{datum.amount0In}</td>
              <td>{datum.amount1In}</td>
              <td>{datum.amount0Out}</td>
              <td>{datum.amount1Out}</td>
            </tr>
        ))
      }
        </tbody>
      </table>
    </div>
  );
}

export default App;