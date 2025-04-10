import { useEffect, useState } from 'react';

import { getDeviceInfo, listenOrientation } from '@/utils/responsive';

/**
 * 响应式布局Hook
 * 用于获取和监听设备信息，辅助组件进行响应式布局
 */
export function useResponsive() {
  const [deviceInfo, setDeviceInfo] = useState(getDeviceInfo());

  useEffect(() => {
    // 监听窗口大小变化
    const handleResize = () => {
      setDeviceInfo(getDeviceInfo());
    };

    // 监听屏幕旋转
    const cleanup = listenOrientation(() => {
      setDeviceInfo(getDeviceInfo());
    });

    window.addEventListener('resize', handleResize);

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
      cleanup();
    };
  }, []);

  return deviceInfo;
}

/**
 * 特定断点的响应式Hook
 * 用于在特定断点下应用不同的样式或组件
 */
export function useBreakpoint() {
  const { isSmallScreen, isMediumScreen, isLargeScreen, screenWidth } = useResponsive();

  // 根据屏幕宽度计算当前断点
  const getBreakpoint = () => {
    if (isSmallScreen) return 'small';
    if (isMediumScreen) return 'medium';
    if (isLargeScreen) return 'large';

    return 'medium';
  };

  // 判断当前屏幕宽度是否符合指定断点
  const isBreakpoint = (breakpoint: 'small' | 'medium' | 'large') => {
    return getBreakpoint() === breakpoint;
  };

  // 根据不同断点返回不同的值
  const matchValue = <T>(options: { small?: T; medium?: T; large?: T; default: T }): T => {
    const breakpoint = getBreakpoint();

    return options[breakpoint] !== undefined ? (options[breakpoint] as T) : options.default;
  };

  return {
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
    screenWidth,
    breakpoint: getBreakpoint(),
    isBreakpoint,
    matchValue,
  };
}

/**
 * 安全区域Hook
 * 用于获取设备安全区域信息（适配刘海屏等）
 */
export function useSafeArea() {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  useEffect(() => {
    const updateSafeArea = () => {
      setSafeArea({
        top: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-top')) || 0,
        right: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-right')) || 0,
        bottom: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-bottom')) || 0,
        left: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-left')) || 0,
      });
    };

    updateSafeArea();
    window.addEventListener('resize', updateSafeArea);

    // 监听屏幕旋转
    const cleanupOrientation = listenOrientation(() => {
      setTimeout(updateSafeArea, 300);
    });

    return () => {
      window.removeEventListener('resize', updateSafeArea);
      cleanupOrientation();
    };
  }, []);

  return safeArea;
}
