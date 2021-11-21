import './App.css';
import { createClient } from 'urql'
import React, { Component } from 'react';
// import { useEffect, useState, Component } from 'react'
import { CSVLink } from "react-csv";

const first = 5 // 1000
const endQuery = 10 //4000
const initialSkip = 0
const csvFilename = 'swap-report-'+Date.now()+'.csv'

const apiExchangeUrl = {
  "uniswap": "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2",
  "sushiswap": "https://api.thegraph.com/subgraphs/name/sushiswap/exchange",
  "pancakeswap": "https://api.thegraph.com/subgraphs/name/shrinivasmani/pancakeswap5"
}

// const APIURL = "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2" // uniswap
// const APIURL = https://api.thegraph.com/subgraphs/id/0x9bde7bf4d5b13ef94373ced7c8ee0be59735a298-2 // uniswap_v3
// const APIURL = "https://api.thegraph.com/subgraphs/name/sushiswap/exchange" // sushiswap
// const APIURL = "https://api.thegraph.com/subgraphs/name/shrinivasmani/pancakeswap5" // pancakeswap

var client = createClient({
    url: apiExchangeUrl['uniswap']
})

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      data: [],
      exchange: 'uniswap'
    }
    this.handleExchange = this.handleExchange.bind(this)
    this.fetchData = this.fetchData.bind(this)
  }

  async componentWillMount() {
    await this.fetchData()
  }

  async fetchData() {
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
      dataset.push(...response.data.swaps);
    }

    let data = [];

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
      // console.log(data);
      this.setState({data:data});

  }

  async handleExchange(event) {
    let a = event.target.value;
    console.log(a);
    this.setState({ exchange: a }, () => {
      console.log(this.state.exchange)
      client = createClient({
        url: apiExchangeUrl[this.state.exchange]
      })
      this.fetchData()
    });
  }

  render() {
    return (
      <div className="App">
        {/* <select className="form-select" name="exchange" id="exchange" defaultValue={this.state.exchange} onChange={this.handleExchange}>
          <option value="uniswap">Uniswap</option>
          <option value="sushiswap">Sushiswap</option>
          <option value="pancakeswap">Pancakeswap</option>
        </select> */}
        <button value="uniswap" onClick={this.handleExchange}>uniswap</button>
        <button value="sushiswap" onClick={this.handleExchange}>sushiswap</button>
        <CSVLink data={this.state.data} filename={csvFilename} asyncOnClick={true} onClick={this.fetchData}>
          <button type="button" className="btn btn-info" style={{margin:10+'px'}}>
            Export to CSV
          </button>
        </CSVLink>
        <table className="table table-striped">
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
          this.state.data.map((datum, index) => (
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
}

export default App;