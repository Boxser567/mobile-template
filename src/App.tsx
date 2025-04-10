// import 'dayjs/locale/zh-cn';
import 'antd-mobile/es/global';

import { ConfigProvider, SpinLoading } from 'antd-mobile';
import enUS from 'antd-mobile/es/locales/en-US';
import zhCN from 'antd-mobile/es/locales/zh-CN';
import zhHK from 'antd-mobile/es/locales/zh-HK';
import { Suspense, useEffect } from 'react';
import { IntlProvider } from 'react-intl';
import { BrowserRouter } from 'react-router-dom';

import { ResponsiveProvider } from '@/components/ResponsiveProvider';
import { useResponsive } from '@/hooks/useResponsive';
import { localeConfig } from '@/locales';
import { useGlobalStore } from '@/zustand';

import RenderRouter from './routes';

// 设备类适配组件
const DeviceAdapter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isIOS, isAndroid } = useResponsive();

  useEffect(() => {
    // 根据设备类型添加对应的类名
    if (isIOS) {
      document.body.classList.add('ios');
    } else if (isAndroid) {
      document.body.classList.add('android');
    }

    // 清理函数
    return () => {
      document.body.classList.remove('ios', 'android');
    };
  }, [isIOS, isAndroid]);

  // 监听键盘事件（主要针对iOS）
  useEffect(() => {
    const inputs = ['input', 'textarea'];

    const handleFocus = () => {
      document.body.classList.add('is-keyboard-open');
    };

    const handleBlur = () => {
      document.body.classList.remove('is-keyboard-open');
    };

    // 为所有输入元素添加事件监听
    inputs.forEach(selector => {
      document.querySelectorAll(selector).forEach(element => {
        element.addEventListener('focus', handleFocus);
        element.addEventListener('blur', handleBlur);
      });
    });

    // 清理函数
    return () => {
      inputs.forEach(selector => {
        document.querySelectorAll(selector).forEach(element => {
          element.removeEventListener('focus', handleFocus);
          element.removeEventListener('blur', handleBlur);
        });
      });
    };
  }, []);

  return <>{children}</>;
};

const App: React.FC = () => {
  // 使用 zustand 的 hook 替代 Redux 的 useSelector
  const { locale, loading } = useGlobalStore();

  /**
   * handler function that passes locale
   * information to ConfigProvider for
   * setting language across text components
   */
  const getAntdLocale = () => {
    if (locale === 'en_US') {
      return enUS;
    } else if (locale === 'zh_CN') {
      return zhCN;
    } else if (locale === 'zh_HK') {
      return zhHK;
    }
  };

  return (
    <div className="App">
      <ResponsiveProvider>
        <DeviceAdapter>
          <ConfigProvider locale={getAntdLocale()}>
            <IntlProvider locale={locale.split('_')[0]} messages={localeConfig[locale]}>
              <BrowserRouter>
                <Suspense fallback={null}>
                  {loading && (
                    <SpinLoading className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform" />
                  )}
                  <RenderRouter />
                </Suspense>
              </BrowserRouter>
            </IntlProvider>
          </ConfigProvider>
        </DeviceAdapter>
      </ResponsiveProvider>
    </div>
  );
};

export default App;
