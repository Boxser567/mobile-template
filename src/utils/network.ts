/**
 * 网络状态监测和处理工具
 * 提供轻量级的网络环境检测和优化功能
 */

// 网络状态类型
export enum NetworkStatus {
  ONLINE = 'online', // 在线
  OFFLINE = 'offline', // 离线
  SLOW = 'slow', // 慢网络
  FAST = 'fast', // 快速网络
  UNKNOWN = 'unknown', // 未知状态
}

// 网络类型
export enum ConnectionType {
  WIFI = 'wifi',
  CELLULAR = 'cellular',
  CELLULAR_2G = '2g',
  CELLULAR_3G = '3g',
  CELLULAR_4G = '4g',
  CELLULAR_5G = '5g',
  ETHERNET = 'ethernet',
  UNKNOWN = 'unknown',
}

// 获取当前网络状态
export function getNetworkStatus(): NetworkStatus {
  if (!navigator.onLine) {
    return NetworkStatus.OFFLINE;
  }

  return NetworkStatus.ONLINE;
}

// 获取网络连接类型和速度信息
export function getConnectionInfo(): {
  type: ConnectionType;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
} {
  // 检查navigator.connection是否存在 (Network Information API)
  const connection =
    (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

  if (!connection) {
    return {
      type: ConnectionType.UNKNOWN,
    };
  }

  // 确定连接类型
  let type: ConnectionType;

  switch (connection.type) {
    case 'wifi':
      type = ConnectionType.WIFI;
      break;
    case 'cellular':
      type = ConnectionType.CELLULAR;
      break;
    case 'ethernet':
      type = ConnectionType.ETHERNET;
      break;
    default:
      type = ConnectionType.UNKNOWN;
  }

  // 如果有effectiveType，可以更精确地确定移动网络类型
  if (connection.effectiveType) {
    if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
      type = ConnectionType.CELLULAR_2G;
    } else if (connection.effectiveType === '3g') {
      type = ConnectionType.CELLULAR_3G;
    } else if (connection.effectiveType === '4g') {
      type = ConnectionType.CELLULAR_4G;
    }
  }

  return {
    type,
    effectiveType: connection.effectiveType,
    downlink: connection.downlink, // Mb/s
    rtt: connection.rtt, // ms (往返时间)
  };
}

// 判断是否是慢速网络
export function isSlowNetwork(): boolean {
  const { effectiveType, downlink, rtt } = getConnectionInfo();

  // 根据有效网络类型判断
  if (effectiveType === 'slow-2g' || effectiveType === '2g') {
    return true;
  }

  // 根据下行速度判断 (小于1Mbps视为慢网络)
  if (downlink !== undefined && downlink < 1) {
    return true;
  }

  // 根据RTT判断 (大于500ms视为慢网络)
  if (rtt !== undefined && rtt > 500) {
    return true;
  }

  return false;
}

// 简化版的资源加载优先级管理
export function optimizeResourceLoading(priority: 'high' | 'medium' | 'low', callback: () => void) {
  if (priority === 'high') {
    // 高优先级资源立即加载
    callback();
  } else if (priority === 'medium') {
    // 中优先级资源使用requestIdleCallback延迟加载
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(callback, { timeout: 2000 });
    } else {
      setTimeout(callback, 100);
    }
  } else {
    // 低优先级资源在页面完全加载后再加载
    if (document.readyState === 'complete') {
      setTimeout(callback, 500);
    } else {
      window.addEventListener('load', () => setTimeout(callback, 500));
    }
  }
}

// 监听网络状态变化
export function listenToNetworkChanges(callback: (status: NetworkStatus) => void) {
  // 初始回调当前状态
  callback(getNetworkStatus());

  // 监听在线状态变化
  window.addEventListener('online', () => callback(NetworkStatus.ONLINE));
  window.addEventListener('offline', () => callback(NetworkStatus.OFFLINE));

  // 如果支持connection事件，监听网络类型变化
  const connection = (navigator as any).connection;

  if (connection) {
    connection.addEventListener('change', () => {
      const status = isSlowNetwork() ? NetworkStatus.SLOW : NetworkStatus.FAST;

      callback(status);
    });
  }

  // 返回清理函数
  return () => {
    window.removeEventListener('online', () => callback(NetworkStatus.ONLINE));
    window.removeEventListener('offline', () => callback(NetworkStatus.OFFLINE));

    if (connection) {
      connection.removeEventListener('change', () => {
        const status = isSlowNetwork() ? NetworkStatus.SLOW : NetworkStatus.FAST;

        callback(status);
      });
    }
  };
}

// 简单的图片懒加载函数
export function lazyLoadImage(imgElement: HTMLImageElement, src: string) {
  // 创建一个新的Image对象来预加载
  const img = new Image();

  img.onload = function () {
    imgElement.src = src;
    imgElement.classList.add('loaded');
  };

  // 根据网络状态决定是否延迟加载
  if (isSlowNetwork()) {
    // 慢网络环境下使用IntersectionObserver或延迟加载
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            img.src = src;
            observer.disconnect();
          }
        });
      });

      observer.observe(imgElement);
    } else {
      // 兜底方案
      setTimeout(() => {
        img.src = src;
      }, 300);
    }
  } else {
    // 快速网络直接加载
    img.src = src;
  }
}

// 生成低质量图片占位符的URL (可用于模糊加载)
export function generateLowQualityPlaceholder(width: number, height: number, color = '#f0f0f0'): string {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}'%3E%3Crect width='${width}' height='${height}' fill='${color.replace('#', '%23')}'/%3E%3C/svg%3E`;
}

// 网络错误重试函数
export function fetchWithRetry<T>(fetchFn: () => Promise<T>, maxRetries = 3, delayMs = 1000): Promise<T> {
  return new Promise((resolve, reject) => {
    const attempt = (retryCount: number) => {
      fetchFn()
        .then(resolve)
        .catch(error => {
          if (retryCount < maxRetries) {
            // 指数退避策略
            const delay = delayMs * Math.pow(2, retryCount);

            setTimeout(() => attempt(retryCount + 1), delay);
          } else {
            reject(error);
          }
        });
    };

    attempt(0);
  });
}
