/* eslint-disable @typescript-eslint/no-explicit-any */
export type BtcNetwork = "mainnet" | "testnet" | "regtest";

export const BASE_METALET_TEST_URL = `https://www.metalet.space/wallet-api/v3`;

// const BASE_METAID_URL_TESTNET = `https://man-test.metaid.io`;
// const BASE_METAID_URL_REGEST = `https://man.somecode.link`; // regtest
// const BASE_METAID_URL_MAINNET = `https://man.metaid.io`;

// export const MAN_BASE_URL = MAN_BASE_URL_MAPPING[process.env.REACT_APP_MAN_NETWORK];

export type Pin = {
  id: string;
  number: number;
  metaid: string;
  address: string;
  creator: string;
  initialOwner: string;
  output: string;
  outputValue: number;
  timestamp: number;
  genesisFee: number;
  genesisHeight: number;
  genesisTransaction: string;
  txInIndex: number;
  offset: number;
  location: string;
  operation: string;
  path: string;
  parentPath: string;
  originalPath: string;
  encryption: string;
  version: string;
  contentType: string;
  contentTypeDetect: string; // text/plain; charset=utf-8
  contentBody: any;
  contentLength: number;
  contentSummary: string;
  status: number;
  originalId: string;
  isTransfered: boolean;
  preview: string; // "https://man-test.metaid.io/pin/4988b001789b5dd76db60017ce85ccbb04a3f2aa825457aa948dc3c1e3b6e552i0";
  content: string; // "https://man-test.metaid.io/content/4988b001789b5dd76db60017ce85ccbb04a3f2aa825457aa948dc3c1e3b6e552i0";
  pop: string;
  popLv: number;
  chainName: string;
  dataValue: number;
};

export interface Tweet {
  content: string;
  creator: string;
  id: string;
  digest: string;
  timestamp: string;
}

export interface Like {
  creator: string;
  current_likes_count: string;
  liker: string;
  tweet_id: string;
}

export interface Comment {
  creator: string;
  current_comments_count: string;
  commenter: string;
  tweet_id: string;
}

// export type Pin = {
//   id: string;
//   number: number;
//   rootTxId: string;
//   address: string;
//   output: string;
//   outputValue: number;
//   timestamp: number;
//   genesisFee: number;
//   genesisHeight: number;
//   genesisTransaction: string;
//   txInIndex: number;
//   txInOffset: number;
//   operation: string;
//   path: string;
//   parentPath: string;
//   encryption: string;
//   version: string;
//   contentType: string;
//   contentBody: string;
//   contentLength: number;
//   contentSummary: string;
// };
