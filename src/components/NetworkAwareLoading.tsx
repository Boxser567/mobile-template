import { DotLoading, ErrorBlock, SpinLoading } from 'antd-mobile';
import React, { useEffect, useState } from 'react';

import { useNetworkStatus } from '@/hooks/useNetwork';

interface NetworkAwareLoadingProps {
  loading: boolean;
  error?: Error | null;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  loadingText?: string;
  errorText?: string;
  retryText?: string;
  onRetry?: () => void;
  timeout?: number;
  showTimeoutWarning?: boolean;
}

/**
 * 网络感知加载组件
 * 根据网络状态提供适当的加载反馈，自动处理超时和错误状态
 */
export const NetworkAwareLoading: React.FC<NetworkAwareLoadingProps> = ({
  loading,
  error,
  children,
  fallback,
  errorFallback,
  loadingText = '加载中',
  errorText = '加载失败',
  retryText = '重试',
  onRetry,
  timeout = 10000,
  showTimeoutWarning = true,
}) => {
  const { isOnline, isSlow } = useNetworkStatus();
  const [timeoutWarning, setTimeoutWarning] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // 在加载时设置超时警告
  useEffect(() => {
    if (loading && showTimeoutWarning) {
      const id = setTimeout(() => {
        setTimeoutWarning(true);
      }, timeout);

      setTimeoutId(id);

      return () => {
        if (id) clearTimeout(id);
        setTimeoutWarning(false);
      };
    }
  }, [loading, timeout, showTimeoutWarning]);

  // 清除超时警告
  useEffect(() => {
    if (!loading && timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
      setTimeoutWarning(false);
    }
  }, [loading, timeoutId]);

  // 处理离线状态
  if (!isOnline && loading) {
    return (
      <div className="network-aware-loading network-offline">
        <ErrorBlock
          status="disconnected"
          title="网络已断开"
          description="请检查您的网络连接并重试"
          buttonText="重试"
          onClick={onRetry}
        />
      </div>
    );
  }

  // 处理加载错误
  if (error) {
    if (errorFallback) {
      return <>{errorFallback}</>;
    }

    return (
      <div className="network-aware-loading network-error">
        <ErrorBlock
          status="default"
          title={errorText}
          description={error.message}
          // buttonText={retryText}
          // onClick={onRetry}
        />
      </div>
    );
  }

  // 处理加载状态
  if (loading) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div
        className={`network-aware-loading ${isSlow ? 'network-slow' : ''} ${timeoutWarning ? 'timeout-warning' : ''}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        {/* 根据网络状态使用不同的加载指示器 */}
        {isSlow ? <SpinLoading color="#1677ff" style={{ marginBottom: 8 }} /> : <DotLoading color="#1677ff" />}

        <div style={{ marginTop: 12, fontSize: 14, color: '#666' }}>{loadingText}</div>

        {/* 慢网络提示 */}
        {isSlow && <div style={{ marginTop: 8, fontSize: 12, color: '#ff9800' }}>网络较慢，请耐心等待...</div>}

        {/* 超时警告 */}
        {timeoutWarning && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 12, color: '#f44336', marginBottom: 8 }}>加载时间较长，您可以尝试重试</div>
            {onRetry && (
              <button
                onClick={onRetry}
                style={{
                  background: '#f5f5f5',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  padding: '4px 12px',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                {retryText}
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // 正常渲染内容
  return <>{children}</>;
};
