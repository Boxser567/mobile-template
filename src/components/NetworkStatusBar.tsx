import { CloseOutline, InformationCircleOutline, WifiOutline } from 'antd-mobile-icons';
import { useEffect, useState } from 'react';

import { useConnectionInfo, useNetworkStatus } from '@/hooks/useNetwork';
import { NetworkStatus } from '@/utils/network';

interface NetworkStatusBarProps {
  autoHide?: boolean; // 是否自动隐藏
  hideDelay?: number; // 隐藏延迟（毫秒）
  position?: 'top' | 'bottom'; // 位置
  showConnectionInfo?: boolean; // 是否显示连接信息
}

/**
 * 网络状态提示条
 * 在网络状态变化时显示，并提供网络相关信息
 */
export const NetworkStatusBar: React.FC<NetworkStatusBarProps> = ({
  autoHide = true,
  hideDelay = 3000,
  position = 'top',
  showConnectionInfo = false,
}) => {
  const { status, isOnline, isSlow } = useNetworkStatus();
  const { type, effectiveType, downlink } = useConnectionInfo();
  const [visible, setVisible] = useState(false);
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 当网络状态变化时显示
    setVisible(true);

    // 自动隐藏
    if (autoHide && isOnline) {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }

      const timeout = setTimeout(() => {
        setVisible(false);
      }, hideDelay);

      setHideTimeout(timeout);

      return () => {
        if (timeout) clearTimeout(timeout);
      };
    }

    // 如果是离线状态，保持显示
    if (!isOnline) {
      setVisible(true);

      if (hideTimeout) {
        clearTimeout(hideTimeout);
        setHideTimeout(null);
      }
    }
  }, [status, isOnline, autoHide, hideDelay]);

  // 如果不可见或没有网络变化，不渲染
  if (!visible) return null;

  // 状态颜色
  let bgColor = '#4caf50'; // 在线
  let textColor = '#ffffff';
  let statusText = '网络连接正常';
  let icon = <WifiOutline />;

  if (!isOnline) {
    bgColor = '#f44336'; // 离线
    statusText = '网络已断开';
    icon = <InformationCircleOutline />;
  } else if (isSlow) {
    bgColor = '#ff9800'; // 慢网络
    statusText = '网络信号较差';
    icon = <WifiOutline />;
  }

  // 连接信息
  let connectionInfo = '';

  if (showConnectionInfo && isOnline) {
    connectionInfo = `${type}${effectiveType ? ' (' + effectiveType + ')' : ''}`;

    if (downlink) {
      connectionInfo += ` ${downlink.toFixed(1)}Mbps`;
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        [position]: 0,
        zIndex: 1000,
        backgroundColor: bgColor,
        color: textColor,
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '14px',
        transition: 'transform 0.3s ease-in-out',
        transform: visible ? 'translateY(0)' : `translateY(${position === 'top' ? '-100%' : '100%'})`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ marginRight: '8px' }}>{icon}</span>
        <span>{statusText}</span>
        {connectionInfo && <span style={{ marginLeft: '8px', fontSize: '12px', opacity: 0.8 }}>{connectionInfo}</span>}
      </div>

      {autoHide && isOnline && (
        <button
          onClick={() => setVisible(false)}
          style={{
            background: 'transparent',
            border: 'none',
            color: textColor,
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <CloseOutline />
        </button>
      )}
    </div>
  );
};
