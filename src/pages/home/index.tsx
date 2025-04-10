import { Button, Card, Space, Toast } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';

import ExampleUsage from '@/components/ExampleUsage';
import { useBreakpoint, useResponsive, useSafeArea } from '@/hooks/useResponsive';
import { useGlobalStore } from '@/zustand';

import styled from './index.module.less';

const HomePage = () => {
  const { locale, setGlobalState } = useGlobalStore();
  const navigate = useNavigate();
  // 获取响应式信息
  const { devicePixelRatio, isIOS, isAndroid, screenWidth, screenHeight, isPortrait } = useResponsive();

  // 获取断点信息
  const { breakpoint, matchValue } = useBreakpoint();

  // 获取安全区域信息
  const safeArea = useSafeArea();

  // 切换语言的处理函数
  const handleChangeLocale = () => {
    const newLocale = locale === 'zh_CN' ? 'en_US' : 'zh_CN';

    setGlobalState({ locale: newLocale });
  };

  // 显示屏幕信息的处理函数
  const handleShowDeviceInfo = () => {
    Toast.show({
      content: `设备信息：
        系统: ${isIOS ? 'iOS' : isAndroid ? 'Android' : '其他'}
        DPR: ${devicePixelRatio}
        断点: ${breakpoint}
        方向: ${isPortrait ? '竖屏' : '横屏'}
        宽度: ${screenWidth}px
        高度: ${screenHeight}px
      `,
      position: 'center',
    });
  };

  // 根据断点返回不同的内容
  const responsiveContent = matchValue({
    small: <span className="text-red-500">小屏幕设备</span>,
    medium: <span className="text-green-500">中等屏幕设备</span>,
    large: <span className="text-blue-500">大屏幕设备</span>,
    default: <span>未知屏幕尺寸</span>,
  });

  return (
    <div className="p-4 safe-area-bottom">
      {/* 最小宽度提示 */}
      {screenWidth <= 360 && (
        <div className="bg-yellow-100 p-2 rounded mb-4 text-sm">
          <p>检测到您的屏幕宽度较小({screenWidth}px)，已启用横向滚动。</p>
          <p>建议使用宽度大于320px的设备访问本应用。</p>
        </div>
      )}

      <h2 className="text-xl font-semibold mb-2">响应式布局示例</h2>
      <Button color="primary" size="mini" onClick={() => navigate('/chat/92371-28ha-23817-hhb2-1872')}>
        点我进入Chat页
      </Button>
      {/* 屏幕信息卡片 */}
      <Card title="屏幕信息" className="mb-4 mt-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>屏幕宽度：{screenWidth}px</div>
          <div>屏幕高度：{screenHeight}px</div>
          <div>设备像素比：{devicePixelRatio}</div>
          <div>当前断点：{breakpoint}</div>
          <div>设备类型：{isIOS ? 'iOS' : isAndroid ? 'Android' : '其他'}</div>
          <div>屏幕方向：{isPortrait ? '竖屏' : '横屏'}</div>
        </div>
      </Card>

      {/* 安全区域信息 */}
      <Card title="安全区域" className="mb-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>顶部：{safeArea.top}px</div>
          <div>右侧：{safeArea.right}px</div>
          <div>底部：{safeArea.bottom}px</div>
          <div>左侧：{safeArea.left}px</div>
        </div>
      </Card>

      {/* 响应式内容演示 */}
      <Card title="响应式内容" className="mb-4">
        <div className="text-center py-2">当前检测到的设备类型：{responsiveContent}</div>

        {/* 仅在小屏幕显示 */}
        <div className="small-screen-only p-2 bg-red-100 rounded mb-2">这段内容仅在小屏幕设备上显示</div>

        {/* 仅在中等及以上屏幕显示 */}
        <div className="medium-screen-up p-2 bg-green-100 rounded mb-2">这段内容仅在中等及以上屏幕设备上显示</div>

        {/* 仅在大屏幕显示 */}
        <div className="large-screen-only p-2 bg-blue-100 rounded">这段内容仅在大屏幕设备上显示</div>
      </Card>

      <Space direction="vertical" className="w-full mt-4">
        <Button color="primary" onClick={handleChangeLocale}>
          切换语言 (当前: {locale})
        </Button>

        <Button color="success" onClick={handleShowDeviceInfo}>
          显示设备信息
        </Button>

        <div className="flex space-x-2">
          <Button color="primary" size="small">
            小型按钮
          </Button>
          <Button color="primary">中型按钮</Button>
          <Button color="primary" size="large">
            大型按钮
          </Button>
        </div>
      </Space>

      <ExampleUsage />
    </div>
  );
};

export default HomePage;
