import type { AxiosRequestConfig, AxiosResponse } from 'axios';

import { Modal, Toast } from 'antd-mobile';
import axios from 'axios';

import { translateMessage as $t } from '@/locales';
import { encodeReplace } from '@/utils';
import * as Cookie from '@/utils/cookie';
import { useUserStore } from '@/zustand';

const ERROR_CODE = {
  SERVER_ERROR: 500,
  NETWORK_ERROR: 502,
  AUTHORIZE_ERROR: 401,
};

const axiosInstance = axios.create({
  timeout: 60000,
  headers: {
    common: {
      'Access-Control-Allow-Origin': '*',
    },
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(config => {
  if (config.method === 'get') {
    if (!config.params) config.params = {};

    config.params = encodeReplace(config.params);
  }

  config.headers.token = Cookie.getCookie();
  config.headers['accept-language'] = (localStorage.getItem('locale') || 'zh_CN').replace('_', '-');

  return config;
}, console.error);

const formatResponse = (response: AxiosResponse<{ code: number; msg: string; data: unknown }>) => {
  const { data } = response;

  if (data.code === 200) {
    return data;
  } else if (data.code === -1) {
    Modal.error({
      title: $t('温馨提示'),
      content: $t('该账号已在别处登录，您被迫下线'),
      okText: $t('确认'),
      okButtonProps: {
        className: 'w-56',
      },
      afterClose: () => {
        Cookie.removeCookie();
        useUserStore.getState().logoutAsync();
        location.replace('/');
        location.reload();
      },
    });
  } else {
    if (data.msg) {
      Toast.show({
        icon: 'fail',
        content: data.msg,
      });
    }

    return Promise.reject(data);
  }
};

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    const result = formatResponse(response);

    console.log('formatResponse', result);

    if (result) {
      return Promise.resolve(result as unknown as AxiosResponse);
    }

    return Promise.reject(response);
  },
  fetchInfo => {
    const { response = {}, name } = fetchInfo;
    const { status, data } = response;

    if (name === 'CanceledError') {
      return Promise.reject(fetchInfo);
    }

    const error = {
      msg: data || $t('网络异常，请稍后重试！'),
      status: status,
    };

    if (typeof data === 'object' && typeof data?.error === 'string') {
      error.msg = data.error;
    }

    if (status === ERROR_CODE.NETWORK_ERROR) {
      error.msg = $t('网络异常，请稍后重试！');
    } else if (status === ERROR_CODE.AUTHORIZE_ERROR) {
      sessionStorage.setItem('cbPath', window.location.pathname + window.location.search);
      Cookie.removeCookie();
      useUserStore.getState().logoutAsync();
      error.msg = $t('登录已过期，请重新登录！');
      window.setTimeout(() => {
        location.replace('/');
      }, 1000);
    }

    if (error.msg) {
      if (error.msg.indexOf('!DOCTYPE html') === -1) {
        Toast.clear();
        Toast.show({
          icon: 'fail',
          content: error.msg,
        });
      }
    }

    return Promise.reject(error);
  },
);

export type Response<T = any> = {
  code: number;
  msg: string;
  success: boolean;
  traceId: string;
  body: T;
};

export type MyResponse<T = any> = Promise<Response<T>>;

/**
 *
 * @param url - request url
 * @param data - request data or params
 * @param config - request config
 */
export const request = <T = any>(url: string, data?: any, config?: AxiosRequestConfig): MyResponse<T> => {
  url = import.meta.env.VITE_PREFIX_URL + url;

  const accountInfoStr = localStorage.getItem('accountInfo') || '{}';
  const accountInfo = JSON.parse(accountInfoStr) as {
    access_token: string;
  } | null;

  if (!config) {
    config = {};
  }

  if (!config?.headers) {
    config = config || {};
    config.headers = {
      Authorization: `Bearer ${accountInfo?.access_token || ''}`,
    };
  }

  if (!config?.headers?.Authorization) {
    config.headers.Authorization = `Bearer ${accountInfo?.access_token || ''}`;
  }

  if (config && config.method === 'get') {
    return axiosInstance.get(url, {
      params: data,
      ...config,
    });
  } else {
    return axiosInstance.post(url, data, config);
  }
};

export interface requestResult {
  errCode: number;
  data: any;
  message: string;
}
