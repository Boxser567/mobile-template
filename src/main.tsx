import 'tailwindcss/tailwind.css';
import './styles/tailwindcss.css';
import './styles/index.less';

import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';

import App from './App';

// 错误回退组件
const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => {
  return (
    <div role="alert" className="error-boundary">
      <p>出错了:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>重试</button>
    </div>
  );
};

// 全局错误处理
const handleError = (error: Error) => {
  console.error('发生错误:', error);
  // 这里可以添加错误上报逻辑
};

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback} onError={handleError}>
      <Suspense fallback={<div>加载中...</div>}>
        <App />
      </Suspense>
    </ErrorBoundary>
  </StrictMode>,
);
