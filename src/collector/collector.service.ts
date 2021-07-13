import { Injectable, OnModuleInit } from '@nestjs/common';

import {
  ApolloClient,
  gql,
  HttpLink,
  InMemoryCache,
  NormalizedCacheObject,
} from '@apollo/client/core';
import fetch from 'cross-fetch';
import ethers, { utils, BigNumber } from 'ethers';
import { ChartService } from '../chart/chart.service';
import { Supply } from "../eth-supply/supply.model";

const abi = [
  "event Redeem(address redeemer, uint256 redeemAmount, uint256 redeemTokens)",
  "event Mint(address minter, uint256 mintAmount, uint256 mintTokens)"
]

const cERC20DelegatorAddress: string = "0x5d3a536e4d6dbd6114cc1ead35777bab948e3643";

// A better approach would be to store there urls in a .env file
const providerURL: string = "https://ropsten.infura.io/v3";
const compoundv2SubgraphUrl: string = "https://api.thegraph.com/subgraphs/name/graphprotocol/compound-v2";

const getTotalSupply = `
  query {
    markets(where:{  underlyingName: "Ether"}) {
      timestamp 
      totalSupply 
    }
  } 
`

const getPastDayEvents = gql`
  query getPastDayEvents($lastDay: Date!) {
      mintEvents(where: {blockTime_gt: $lastDay}) {
        timestamp
        totalSupply
      }

      redeemEvents(where: {blockTime_gt: $lastDay}) {
        timestamp
        totalSupply
      }
  }
`;

const getLatestIndexedBlock = `
query {
  indexingStatusForCurrentVersion(subgraphName: "graphprotocol/compound-v2") { chains { latestBlock { hash number }}}
}
`;

function getLastDay() : Date {
  return new Date(new Date().getTime() - (24 * 60 * 60 * 1000));
}

// function groupByHour(value, index, array) : Promise<ISupply[]>{

// }

// function getTotalHourlySupply() : BigInt{

// }

@Injectable()
export class CollectorService implements OnModuleInit {
  clientMetadata: ApolloClient<NormalizedCacheObject>;

  // add your own properties
  compoundV2Client: ApolloClient<NormalizedCacheObject>;

  constructor(private readonly chartService: ChartService) {
    this.clientMetadata = new ApolloClient({
      cache: new InMemoryCache(),
      link: new HttpLink({
        uri: 'https://api.thegraph.com/index-node/graphql',
        fetch,
      }),
    });

    this.compoundV2Client = new ApolloClient({
      cache: new InMemoryCache(),
      link: new HttpLink({
        uri: compoundv2SubgraphUrl,
        fetch,
      }),
    });
  }

  onModuleInit() {
    // start events listers
    this.listenToEvents();

    // fetch data from compound's the graph
    this.fetchFromTheGraph();
  }

  async listenToEvents() {
    // start event listeners
    try {
      let provider = await new ethers.providers.InfuraProvider("ropsten","8d810610fe7741cc9753cbaafb1f000c");
      const delegatorContract = new ethers.Contract(cERC20DelegatorAddress, abi, provider);
    
      const filter = {
        topics: [
            [
              utils.id("Mint(address minter, uint256 mintAmount, uint256 mintTokens)"),
              utils.id("Redeem(address redeemer, uint256 redeemAmount, uint256 redeemTokens)")
            ]
        ]
      }

      if(delegatorContract){
        delegatorContract.on(filter, (eventData) => {
          console.log(eventData)
        })
      }
    } catch (error) {
      console.log(error)
    }
  }

  async fetchFromTheGraph() {
    // Simplified example on how to get currently synced block number on compound's the graph.
    // This is useful for BONUS if you decide to update the data from the event listener.
    // You need to sychnronize the current blocks so no events are missed before GQL data is parsed
    // and listener started to listen.
    this.clientMetadata
      .query({
        query: gql(getLatestIndexedBlock),
      })
      .then((data) =>
        console.log(
          'Latest block: ',
          data.data.indexingStatusForCurrentVersion.chains[0].latestBlock
            .number,
        ),
      )
      .catch((err) => {
        console.log('Error fetching data: ', err);
      });

    // fetch, transform and save data from compound's the graph
    try {
      this.compoundV2Client
        .query({
          query: getPastDayEvents, variables: getLastDay()
        })
        .then((data) => {
            data.data.forEach( d => {
              const { totalSupply } = d;
              const supply = new Supply({totalSupply});
              supply.save();
            });
        })
    } catch (error) {
      console.log(error)
    }
  }
}
