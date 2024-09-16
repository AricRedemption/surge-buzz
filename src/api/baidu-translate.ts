import axios from 'axios';
import { environment } from '../utils/environments';

import md5 from 'md5';

export type ResultArray = {
  src: string;
  dst: string;
}[];

type TransResult = {
  from: string;
  to: string;
  trans_result: ResultArray;
  error_code: number;
};

type TransQuery = {
  q: string;
  from: string;
  to: string;
  appid: string;
  salt: string;
  sign: string;
};
export async function fetchTranlateResult({
  sourceText,
}: {
  sourceText: string;
}): Promise<TransResult | undefined> {
  const salt = new Date().getTime().toString();
  const queryParams: TransQuery = {
    q: sourceText,
    from: 'zh',
    to: 'en',
    appid: environment.baidu_app_id,
    salt,
    sign: md5(
      environment.baidu_app_id +
        sourceText +
        salt +
        environment.baidu_app_secret
    ),
  };
  // const url = `https://fanyi-api.baidu.com/api/trans/vip/translate`;
  const url = `https://api.metaid.io/baidufanyi/api/trans/vip/translate`;
  // const url = `/api/trans/vip/translate`;

  try {
    const data = await axios
      .get(url, { params: queryParams })
      .then((res) => res.data);
    return data;
  } catch (error) {
    console.error(error);
    return undefined;
  }
}
