/**
 * 移动端响应式适配工具
 * 基于 rem 单位和 viewport 缩放实现不同屏幕尺寸和设备像素比的适配
 */

// 设计稿的宽度（以 iPhone 6/7/8 为基准设计）
const DESIGN_WIDTH = 375; // 667;
// 设计稿的高度
const MAX_WIDTH = 640;
const MIN_WIDTH = 320;
// 基准根元素字体大小
const BASE_FONT_SIZE = 16;

// 计算 rem 基准值
export function calculateRem() {
  const html = document.documentElement;
  const { clientWidth } = html;

  // 限制最大宽度
  let width = clientWidth > MAX_WIDTH ? MAX_WIDTH : clientWidth;

  // 计算缩放比例，将屏幕宽度等分为 DESIGN_WIDTH / (BASE_FONT_SIZE/100) 份
  const rem = (width / DESIGN_WIDTH) * BASE_FONT_SIZE;

  html.style.fontSize = `${rem}px`;

  if (clientWidth < MIN_WIDTH) {
    document.body.style.minWidth = `${MIN_WIDTH}px`;
    // 启用横向滚动
    document.body.style.overflowX = 'auto';
  } else {
    document.body.style.overflowX = '';
  }

  // 设置 body 最大宽度，保证超大屏幕下内容居中
  if (clientWidth > MAX_WIDTH) {
    document.body.style.width = `${MAX_WIDTH}px`;
    document.body.style.margin = '0 auto';
  } else if (clientWidth < MIN_WIDTH) {
    document.body.style.width = `${MIN_WIDTH}px`;
    document.body.style.margin = '0';
  } else {
    document.body.style.width = '100%';
    document.body.style.margin = '0';
  }

  // 返回当前计算出的 REM 值和缩放比例
  return {
    rem,
    scale: width / DESIGN_WIDTH,
  };
}

// 移除 rem 适配
export function removeRem() {
  document.documentElement.style.fontSize = '';
  document.body.style.width = '';
  document.body.style.margin = '';
  document.body.style.minWidth = '';
  document.body.style.overflowX = '';
}

// 获取当前设备信息
export function getDeviceInfo() {
  const devicePixelRatio = window.devicePixelRatio || 1;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  const isAndroid = /Android/.test(navigator.userAgent);
  const isMobile = isIOS || isAndroid || /Mobile|Windows Phone|Lumia|Blackberry/.test(navigator.userAgent);
  const isTablet = /Tablet|iPad/.test(navigator.userAgent);
  const { clientWidth, clientHeight } = document.documentElement;

  // 判断屏幕方向
  const isPortrait = clientHeight > clientWidth;

  // 计算当前屏幕比例
  const screenRatio = isPortrait ? clientHeight / clientWidth : clientWidth / clientHeight;

  return {
    devicePixelRatio, // 设备像素比
    isIOS, // 是否 iOS
    isAndroid, // 是否 Android
    isMobile, // 是否移动设备
    isTablet, // 是否平板设备
    isPortrait, // 是否竖屏
    screenWidth: clientWidth, // 屏幕宽度
    screenHeight: clientHeight, // 屏幕高度
    screenRatio, // 屏幕比例
    isSmallScreen: clientWidth < 360, // 是否小屏幕
    isMediumScreen: clientWidth >= 360 && clientWidth < 768, // 是否中等屏幕
    isLargeScreen: clientWidth >= 768, // 是否大屏幕
  };
}

// 监听屏幕旋转
export function listenOrientation(callback: (isPortrait: boolean) => void) {
  const handler = () => {
    const { isPortrait } = getDeviceInfo();

    callback(isPortrait);
  };

  window.addEventListener('orientationchange', handler);

  // 返回清理函数
  return () => {
    window.removeEventListener('orientationchange', handler);
  };
}

// 初始化移动端适配
export function initResponsive() {
  // 计算并设置 rem
  calculateRem();

  // 监听窗口大小变化
  window.addEventListener('resize', calculateRem);

  // 设置视口
  setViewport();

  // 监听屏幕旋转
  window.addEventListener('orientationchange', () => {
    setTimeout(calculateRem, 300); // 旋转后延迟计算以确保准确获取尺寸
  });
}

// 清理移动端适配
export function cleanupResponsive() {
  removeRem();
  window.removeEventListener('resize', calculateRem);
  window.removeEventListener('orientationchange', calculateRem);
}

// 设置视口缩放
function setViewport() {
  // 获取视口缩放的 meta 标签
  let metaEl = document.querySelector('meta[name="viewport"]');
  const dpr = window.devicePixelRatio || 1;

  // 创建 meta 标签
  if (!metaEl) {
    metaEl = document.createElement('meta');
    metaEl.setAttribute('name', 'viewport');
    document.head.appendChild(metaEl);
  }

  // 设置视口缩放
  metaEl.setAttribute(
    'content',
    `width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, viewport-fit=cover`,
  );
}

// 转换 px 为 rem
export function pxToRem(px: number): number {
  return px / BASE_FONT_SIZE;
}

// 安全区域高度 (适配刘海屏)
export function getSafeAreaInset() {
  return {
    top: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-top')) || 0,
    right: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-right')) || 0,
    bottom: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-bottom')) || 0,
    left: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-left')) || 0,
  };
}

// 设置安全区域变量
export function setSafeAreaVariables() {
  const style = document.createElement('style');

  style.innerHTML = `
    :root {
      --safe-area-inset-top: env(safe-area-inset-top, 0);
      --safe-area-inset-right: env(safe-area-inset-right, 0);
      --safe-area-inset-bottom: env(safe-area-inset-bottom, 0);
      --safe-area-inset-left: env(safe-area-inset-left, 0);
    }
  `;
  document.head.appendChild(style);
}
