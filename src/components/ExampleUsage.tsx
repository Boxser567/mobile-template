import { Button, Card, Toast } from 'antd-mobile';
import React, { useEffect, useState } from 'react';

import { useNetworkStatus } from '../hooks/useNetwork';
import { NetworkAwareLoading } from './NetworkAwareLoading';

/**
 * 模拟API调用的函数
 * @param delay 延迟时间（毫秒）
 * @param shouldFail 是否模拟失败
 * @returns 返回一个Promise，resolve为数据，reject为错误
 */
const mockApiCall = (delay: number = 2000, shouldFail: boolean = false): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error('请求失败，网络无应答'));
      } else {
        resolve(['数据项1', '数据项2', '数据项3', '数据项4', '数据项5']);
      }
    }, delay);
  });
};

/**
 * 网络感知加载组件示例
 * 展示如何在真实场景中使用NetworkAwareLoading组件
 */
const ExampleUsage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<string[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const { isOnline, isSlow, effectiveType } = useNetworkStatus();

  // 加载数据的函数
  const loadData = async (shouldFail: boolean = false, delay: number = 2000) => {
    setLoading(true);
    setError(null);

    try {
      const result = await mockApiCall(delay, shouldFail);

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('未知错误'));
      Toast.show({
        icon: 'fail',
        content: '加载失败',
      });
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时加载数据
  useEffect(() => {
    loadData();
  }, []);

  // 网络状态展示
  const renderNetworkStatus = () => {
    return (
      <Card title="当前网络状态" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 14, lineHeight: 1.6 }}>
          <p>
            在线状态: <span style={{ color: isOnline ? '#52c41a' : '#f5222d' }}>{isOnline ? '在线' : '离线'}</span>
          </p>
          <p>
            网络质量: <span style={{ color: isSlow ? '#fa8c16' : '#52c41a' }}>{isSlow ? '较慢' : '良好'}</span>
          </p>
          {effectiveType && <p>网络类型: {effectiveType}</p>}
        </div>
      </Card>
    );
  };

  // 操作按钮组
  const renderActions = () => {
    return (
      <Card title="测试操作" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <Button color="primary" onClick={() => loadData(false, 2000)}>
            正常加载
          </Button>
          <Button color="primary" onClick={() => loadData(false, 8000)}>
            慢速加载
          </Button>
          <Button color="danger" onClick={() => loadData(true)}>
            模拟错误
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <div style={{ maxWidth: 600, margin: '20px auto' }}>
      <h2 style={{ marginBottom: 16 }}>网络感知加载组件示例</h2>

      {renderNetworkStatus()}
      {renderActions()}

      <Card title="数据展示">
        <NetworkAwareLoading
          loading={loading}
          error={error}
          onRetry={() => loadData()}
          timeout={5000}
          loadingText="正在加载数据..."
          errorText="数据加载失败"
          retryText="重新加载"
        >
          {data.length > 0 ? (
            <ul style={{ padding: '0 16px' }}>
              {data.map((item, index) => (
                <li key={index} style={{ margin: '8px 0' }}>
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <div style={{ padding: 16, textAlign: 'center', color: '#999' }}>暂无数据</div>
          )}
        </NetworkAwareLoading>
      </Card>
    </div>
  );
};

export default ExampleUsage;
