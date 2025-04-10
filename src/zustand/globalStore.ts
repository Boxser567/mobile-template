import type { Locale } from '@/constants';

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface GlobalState {
  theme: 'light' | 'dark';
  locale: Locale;
  loading: boolean;
  obsConfig: {
    access: string;
    secret: string;
    securityToken: string;
    bucketName: string;
    endPoint: string;
    cdnEndPoint: string;
    expiresAt: string;
  } | null;
}

const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
const userTheme = localStorage.getItem('theme') as GlobalState['theme'];

interface GlobalActions {
  setGlobalState: (payload: Partial<GlobalState>) => void;
  setObsConfig: (payload: Partial<GlobalState['obsConfig']>) => void;
}

// 创建全局状态的zustand store
export const useGlobalStore = create<GlobalState & GlobalActions>()(
  devtools(
    persist(
      set => ({
        // 初始状态
        theme: userTheme || systemTheme,
        loading: false,
        obsConfig: null,
        locale: (localStorage.getItem('locale')! || 'zh_CN') as Locale,

        // action 方法
        setGlobalState: payload => {
          set(state => {
            // 处理主题变更
            if (payload.theme) {
              const body = document.body;

              if (payload.theme === 'dark') {
                if (!body.hasAttribute('theme-mode')) {
                  body.setAttribute('theme-mode', 'dark');
                }
              } else {
                if (body.hasAttribute('theme-mode')) {
                  body.removeAttribute('theme-mode');
                }
              }
            }

            return { ...state, ...payload };
          });
        },

        setObsConfig: payload => {
          set(state => ({
            ...state,
            obsConfig: payload as GlobalState['obsConfig'],
          }));
        },
      }),
      {
        name: 'Template-g-storage', // 持久化存储名称
        partialize: state => ({
          theme: state.theme,
          locale: state.locale,
        }), // 只持久化部分状态
      },
    ),
  ),
);
