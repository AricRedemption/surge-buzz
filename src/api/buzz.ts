// import { BuzzItem } from '../types';
import axios from 'axios';
import { BtcNetwork, Pin } from './request';
import { IBtcConnector } from '@metaid/metaid';
import { environment } from '../utils/environments';

export type LikeRes = {
  _id: string;
  isLike: string;
  likeTo: string;
  pinAddress: string;
  pinId: string;
  pinNumber: number;
};

export type CommentRes = {
  _id: string;
  commentTo: string;
  content: string;
  pay: string;
  payTo: string;
  pinAddress: string;
  pinId: string;
  pinNumber: number;
  replyTo: string;
};

export async function fetchBuzzs({
  btcConnector,
  page,
  limit,
  network,
  path,
  address,
}: {
  btcConnector: IBtcConnector;
  page: number;
  limit: number;
  network: BtcNetwork;
  path?: string[];
  address?: string;
}): Promise<Pin[] | null> {
  const response = await btcConnector.getAllpin({
    page,
    limit,
    network,
    path,
    address,
  });
  return response;
}

export async function fetchMyFollowingBuzzs(params: {
  page: number;
  size: number;
  path: string;
  metaidList: string[];
}): Promise<Pin[] | null> {
  const url = `${environment.base_man_url}/api/getAllPinByPathAndMetaId`;

  try {
    const data = await axios.post(url, params).then((res) => res.data);
    return data.data.list;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function fetchMyFollowingTotal(params: {
  page: number;
  size: number;
  path: string;
  metaidList: string[];
}): Promise<number | null> {
  const url = `${environment.base_man_url}/api/getAllPinByPathAndMetaId`;

  try {
    const data = await axios.post(url, params).then((res) => res.data);
    return data.data.total;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function fetchMyFollowingBuzzsWithTotal(params: {
  page: number;
  size: number;
  path: string;
  metaidList: string[];
}): Promise<{ total: number; currentPage: Pin[] } | null> {
  const url = `${environment.base_man_url}/api/getAllPinByPathAndMetaId`;

  try {
    const data = await axios.post(url, params).then((res) => res.data);
    return { total: data.data.total, currentPage: data.data.list };
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function fetchCurrentBuzzLikes({
  pinId,
}: {
  pinId: string;
}): Promise<LikeRes[] | null> {
  const body = {
    collection: 'paylike',
    action: 'get',
    filterRelation: 'and',
    field: [],
    filter: [
      {
        operator: '=',
        key: 'likeTo',
        value: pinId,
      },
    ],
    cursor: 0,
    limit: 99999,
    sort: [],
  };

  try {
    const data = await axios
      .post(`${environment.base_man_url}/api/generalQuery`, body)
      .then((res) => res.data);
    return data.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function fetchCurrentBuzzComments({
  pinId,
}: {
  pinId: string;
}): Promise<CommentRes[] | null> {
  const body = {
    collection: 'paycomment',
    action: 'get',
    filterRelation: 'and',
    field: [],
    filter: [
      {
        operator: '=',
        key: 'commentTo',
        value: pinId,
      },
    ],
    cursor: 0,
    limit: 99999,
    sort: ['number', 'desc'],
  };

  try {
    const data = await axios
      .post(`${environment.base_man_url}/api/generalQuery`, body)
      .then((res) => res.data);
    return data.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getPinDetailByPid({
  pid,
}: {
  pid: string;
}): Promise<Pin | undefined> {
  const url = `${environment.base_man_url}/api/pin/${pid}`;

  try {
    const data = await axios.get(url).then((res) => res.data);
    return data.data;
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

export async function fetchFollowerList({
  metaid,
  params,
}: {
  metaid: string;
  params: {
    cursor: string;
    size: string;
    followDetail: boolean;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<{ list: any; total: number }> {
  try {
    const data = await axios
      .get(`${environment.base_man_url}/api/metaid/followerList/${metaid}`, {
        params,
      })
      .then((res) => res.data);
    return data.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
export async function fetchFollowingList({
  metaid,
  params,
}: {
  metaid: string;
  params: {
    cursor: string;
    size: string;
    followDetail: boolean;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<{ list: any; total: number }> {
  try {
    const data = await axios
      .get(`${environment.base_man_url}/api/metaid/followingList/${metaid}`, {
        params,
      })
      .then((res) => res.data);
    return data.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function fetchFollowDetailPin(params: {
  metaId: string;
  followerMetaId: string;
}): Promise<{
  metaId: string;
  followMetaId: string;
  followTime: number;
  followPinId: string;
  unFollowPinId: string;
  status: boolean;
}> {
  try {
    const data = await axios
      .get(`${environment.base_man_url}/api/follow/record`, { params })
      .then((res) => res.data);
    return data.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export type FeeRateApi = {
  fastestFee: number;
  halfHourFee: number;
  hourFee: number;
  economyFee: number;
  minimumFee: number;
};

export async function fetchFeeRate({
  netWork,
}: {
  netWork?: BtcNetwork;
}): Promise<FeeRateApi> {
  const response = await fetch(
    `https://mempool.space/${
      netWork === 'mainnet' ? '' : 'testnet/'
    }api/v1/fees/recommended`,
    {
      method: 'get',
    }
  );
  return response.json();
}

////////////// mock buzz api
