import type { requestResult } from '../utils/request';

import md5 from 'md5';

import { StringToBase64 } from '@/utils/index';

import { request } from '../utils/request';

const prefix = 'user-center/user';

/** 登录接口 */
export const apiLogin = (data: any) =>
  request<requestResult>(
    'auth-center/oauth2/token',
    { ...data, grant_type: 'password', password: md5(data.password) },
    {
      headers: {
        Authorization: `Basic ${StringToBase64('messaging-client:secret')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
  );

export const apiRegister = (params: any) =>
  request<requestResult>(prefix + '/register/apply', params, {
    headers: {},
  });
export const apiInitEditor = (data: any) => request<requestResult>('file-center/editor', data);
