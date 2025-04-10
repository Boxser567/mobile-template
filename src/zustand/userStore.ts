import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { apiLogin } from '@/api/user.api';
import * as Cookie from '@/utils/cookie';

interface MenuItem {
  code: string;
  label: {
    zh_CN: string;
    zh_HK: string;
    en_US: string;
  };
  icon?: string;
  path: string;
  children?: MenuItem[];
}

export type MenuChild = Omit<MenuItem, 'children'>;

export interface UserState {
  accountName: string;
  accountId: string | number;
  loading?: boolean;
}

// 初始数据
const localUser = JSON.parse(localStorage.getItem('accountInfo')!) || {};

interface UserActions {
  setUserItem: (payload: Partial<UserState>) => void;
  loginAsync: (payload: any) => Promise<boolean>;
  logoutAsync: () => Promise<boolean>;
}

// 创建用户状态的zustand store
export const useUserStore = create<UserState & UserActions>()(
  devtools(
    persist(
      (set, get) => ({
        // 初始状态
        ...localUser,
        loading: false,

        // action 方法
        setUserItem: payload => set(state => ({ ...state, ...payload })),

        loginAsync: async payload => {
          Cookie.removeCookie();
          const res: any = await apiLogin(payload);

          const { code, body } = res;

          if (code === 200 && body) {
            localStorage.setItem('accountInfo', JSON.stringify(body));
            set(state => ({ ...state, ...body }));

            return true;
          }

          return false;
        },

        logoutAsync: async () => {
          localStorage.clear();
          set({
            accountName: '',
            accountId: '',
            loading: false,
          });

          return true;
        },
      }),
      {
        name: 'user-storage', // 持久化存储名称
        partialize: state => ({
          accountName: state.accountName,
          accountId: state.accountId,
        }), // 只持久化部分状态
      },
    ),
  ),
);
