import type { ReactNode } from 'react';

import { createContext, useContext, useEffect, useState } from 'react';

import { useBreakpoint, useResponsive, useSafeArea } from '@/hooks/useResponsive';
import { calculateRem, cleanupResponsive, initResponsive, setSafeAreaVariables } from '@/utils/responsive';

// 创建响应式上下文
interface ResponsiveContextType {
  deviceInfo: ReturnType<typeof useResponsive>;
  breakpoint: ReturnType<typeof useBreakpoint>;
  safeArea: ReturnType<typeof useSafeArea>;
  isReady: boolean;
}

const ResponsiveContext = createContext<ResponsiveContextType | null>(null);

// 响应式Provider组件
interface ResponsiveProviderProps {
  children: ReactNode;
}

export const ResponsiveProvider: React.FC<ResponsiveProviderProps> = ({ children }) => {
  const deviceInfo = useResponsive();
  const breakpoint = useBreakpoint();
  const safeArea = useSafeArea();
  const [isReady, setIsReady] = useState(false);

  // 预先初始化以避免初始渲染闪烁
  useEffect(() => {
    // 立即计算并设置 rem，避免页面闪烁
    calculateRem();

    // 预先标记为已准备就绪
    document.documentElement.classList.add('responsive-ready');

    // 设置状态为已准备就绪
    setIsReady(true);
  }, []);

  // 完整初始化响应式环境
  useEffect(() => {
    // 设置安全区域变量
    setSafeAreaVariables();

    // 初始化响应式适配
    initResponsive();

    // 添加适配 iOS 的 fixed 元素的键盘行为的样式
    const style = document.createElement('style');

    style.innerHTML = `
      body {
        -webkit-overflow-scrolling: touch;
      }

      .ios-fixed-keyboard-fix {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        padding-bottom: env(safe-area-inset-bottom, 0);
        background-color: #fff;
        transition: transform 0.3s;
      }

      .is-keyboard-open .ios-fixed-keyboard-fix {
        transform: translateY(-300px); /* 假设键盘高度 */
      }
    `;
    document.head.appendChild(style);

    return () => {
      cleanupResponsive();
      document.documentElement.classList.remove('responsive-ready');
    };
  }, []);

  return (
    <ResponsiveContext.Provider value={{ deviceInfo, breakpoint, safeArea, isReady }}>
      {children}
    </ResponsiveContext.Provider>
  );
};

// 自定义Hook，用于在组件中获取响应式信息
export const useResponsiveContext = () => {
  const context = useContext(ResponsiveContext);

  if (!context) {
    throw new Error('useResponsiveContext must be used within a ResponsiveProvider');
  }

  return context;
};
