import { request as umiRequest } from '@umijs/max';

export async function request<T>(
  url: string,
  options: any = { method: 'GET' },
): Promise<T | undefined> {
  if (!options['throwError']) {
    try {
      const resp: any = await umiRequest(url, options);
      return resp.data;
    } catch (ex) {
      return undefined;
    }
  }
  const resp: any = await umiRequest(url, options);
  return resp.data;
}

export function convertPageData<T = any>(response: API.PageResponse<T>) {
  return {
    data: response?.list || [],
    success: true,
    total: response?.total || 0,
  };
}

export function orderBy(sort: any) {
  if (!sort) return;
  const keys = Object.keys(sort);
  if (keys.length !== 1) return;
  return keys[0] + ' ' + sort[keys[0]];
}

export async function waitTime(time: number = 100) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
}
