import { useEffect, useState } from 'react';

import {
  ConnectionType,
  getConnectionInfo,
  getNetworkStatus,
  isSlowNetwork,
  listenToNetworkChanges,
  NetworkStatus,
} from '@/utils/network';

interface NetworkStatusHook {
  isOnline: boolean;
  isSlow: boolean;
  connectionType: string | null;
  effectiveType: string | null;
  downlink: number | null;
  rtt: number | null;
  saveData: boolean | null;
}

/**
 * 网络状态钩子
 * 检测和监控网络状态变化，包括在线状态、网络类型和质量
 */
export function useNetworkStatus(): NetworkStatusHook {
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  const [networkInfo, setNetworkInfo] = useState<{
    connectionType: string | null;
    effectiveType: string | null;
    downlink: number | null;
    rtt: number | null;
    saveData: boolean | null;
    isSlow: boolean;
  }>({
    connectionType: null,
    effectiveType: null,
    downlink: null,
    rtt: null,
    saveData: null,
    isSlow: false,
  });

  // 检测当前网络信息
  const updateNetworkInfo = () => {
    const connection =
      (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

    if (connection) {
      const { type, effectiveType, downlink, rtt, saveData } = connection;

      // 根据有效网络类型和测量的RTT判断是否为慢网络
      // 慢网络条件: 2G网络或RTT大于500ms或下行速度小于1Mbps
      const isSlow = effectiveType === '2g' || (rtt && rtt > 500) || (downlink && downlink < 1);

      setNetworkInfo({
        connectionType: type || null,
        effectiveType: effectiveType || null,
        downlink: downlink || null,
        rtt: rtt || null,
        saveData: saveData || null,
        isSlow,
      });
    }
  };

  useEffect(() => {
    // 初始化网络信息
    updateNetworkInfo();

    // 监听在线状态变化
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 监听网络信息变化
    const connection =
      (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

    if (connection) {
      connection.addEventListener('change', updateNetworkInfo);
    }

    // 清理事件监听器
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);

      if (connection) {
        connection.removeEventListener('change', updateNetworkInfo);
      }
    };
  }, []);

  return {
    isOnline,
    isSlow: networkInfo.isSlow,
    connectionType: networkInfo.connectionType,
    effectiveType: networkInfo.effectiveType,
    downlink: networkInfo.downlink,
    rtt: networkInfo.rtt,
    saveData: networkInfo.saveData,
  };
}

/**
 * 网络连接信息Hook
 * 用于获取更详细的网络连接信息
 */
export function useConnectionInfo() {
  const [connectionInfo, setConnectionInfo] = useState(getConnectionInfo());
  const { isOnline } = useNetworkStatus();

  useEffect(() => {
    // 只在在线状态下监听连接变化
    if (isOnline) {
      const connection = (navigator as any).connection;

      if (connection) {
        const handleChange = () => {
          setConnectionInfo(getConnectionInfo());
        };

        connection.addEventListener('change', handleChange);

        return () => {
          connection.removeEventListener('change', handleChange);
        };
      }
    }
  }, [isOnline]);

  return {
    ...connectionInfo,
    isWifi: connectionInfo.type === ConnectionType.WIFI,
    isMobile: [
      ConnectionType.CELLULAR,
      ConnectionType.CELLULAR_2G,
      ConnectionType.CELLULAR_3G,
      ConnectionType.CELLULAR_4G,
      ConnectionType.CELLULAR_5G,
    ].includes(connectionInfo.type),
  };
}

/**
 * 自适应加载策略Hook
 * 根据网络状态自动调整加载策略
 */
export function useAdaptiveLoading() {
  const { isSlow, isOffline } = useNetworkStatus();
  const { downlink } = useConnectionInfo();

  // 计算最佳图片质量 (1=原图, 0.1=极低质量)
  const getOptimalImageQuality = () => {
    if (isOffline) return 0.1; // 离线模式下加载极低质量图片
    if (isSlow) return 0.3; // 慢网络加载低质量图片

    // 根据下行速度动态调整
    if (downlink !== undefined) {
      if (downlink > 5) return 1; // 高速网络
      if (downlink > 2) return 0.8; // 较快网络
      if (downlink > 1) return 0.6; // 中等网络

      return 0.4; // 较慢网络
    }

    return 0.7; // 默认中等质量
  };

  // 计算预加载资源数量
  const getPreloadCount = () => {
    if (isOffline) return 0; // 离线模式不预加载
    if (isSlow) return 2; // 慢网络少量预加载

    if (downlink !== undefined) {
      if (downlink > 5) return 10; // 高速网络大量预加载
      if (downlink > 2) return 5; // 较快网络中等预加载
    }

    return 3; // 默认预加载数量
  };

  return {
    isSlow,
    isOffline,
    downlink,
    imageQuality: getOptimalImageQuality(),
    preloadCount: getPreloadCount(),
    shouldLazyLoad: isSlow || downlink === undefined || downlink < 3,
    shouldPreloadImages: !isOffline && (!isSlow || (downlink !== undefined && downlink > 1)),
    shouldUseWebp: true, // 现代浏览器都支持webp，节省流量
  };
}
