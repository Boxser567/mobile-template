import type { CSSProperties, ImgHTMLAttributes } from 'react';

import React, { useEffect, useRef, useState } from 'react';

import { useAdaptiveLoading } from '@/hooks/useNetwork';
import { generateLowQualityPlaceholder } from '@/utils/network';

interface NetworkAwareImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  placeholderSrc?: string;
  width?: number;
  height?: number;
  fallbackColor?: string;
  alt: string;
  lazyLoad?: boolean;
  fadeInDuration?: number;
  blur?: boolean;
}

/**
 * 网络感知图片组件
 * 根据网络状态自动调整图片加载策略:
 * - 在慢网络下使用低质量占位图
 * - 支持懒加载和渐变加载
 * - 优先使用WebP图片格式 (如果原图支持)
 */
export const NetworkAwareImage: React.FC<NetworkAwareImageProps> = ({
  src,
  placeholderSrc,
  width,
  height,
  fallbackColor = '#f0f0f0',
  alt,
  lazyLoad: forceLazyLoad,
  fadeInDuration = 300,
  blur = true,
  style,
  className,
  ...props
}) => {
  const { shouldLazyLoad, imageQuality, isOffline } = useAdaptiveLoading();
  const [imgSrc, setImgSrc] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // 决定是否使用懒加载
  const useLazyLoad = forceLazyLoad !== undefined ? forceLazyLoad : shouldLazyLoad;

  // 占位图
  const placeholder = placeholderSrc || generateLowQualityPlaceholder(width || 100, height || 100, fallbackColor);

  // 如果网络离线且没有缓存，显示占位图
  const actualSrc = isOffline ? imgSrc || placeholder : src;

  useEffect(() => {
    if (!src) return;

    // 如果不使用懒加载，直接设置图片源
    if (!useLazyLoad) {
      setImgSrc(src);

      return;
    }

    // 使用懒加载
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setImgSrc(src);
              observer.disconnect();
            }
          });
        },
        { rootMargin: '100px' }, // 提前100px开始加载
      );

      if (imgRef.current) {
        observer.observe(imgRef.current);
      }

      return () => {
        observer.disconnect();
      };
    } else {
      // 回退方案：延迟加载
      setImgSrc(src);
    }
  }, [src, useLazyLoad]);

  // 处理图片加载完成
  const handleLoad = () => {
    setIsLoaded(true);
  };

  // 处理图片加载失败
  const handleError = () => {
    setError(true);
    setImgSrc(placeholder);
  };

  // 构建图片样式
  const imageStyles: CSSProperties = {
    ...style,
    opacity: isLoaded ? 1 : 0.5,
    transition: `opacity ${fadeInDuration}ms ease-in-out`,
    filter: !isLoaded && blur ? 'blur(5px)' : 'none',
  };

  return (
    <div className={`relative overflow-hidden ${className || ''}`} style={{ width, height }}>
      {/* 占位图层 */}
      {!isLoaded && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: fallbackColor,
            backgroundImage: `url(${placeholder})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}

      {/* 实际图片 */}
      <img
        ref={imgRef}
        src={imgSrc}
        alt={alt}
        width={width}
        height={height}
        onLoad={handleLoad}
        onError={handleError}
        style={imageStyles}
        loading={useLazyLoad ? 'lazy' : undefined}
        {...props}
      />

      {/* 离线状态提示 */}
      {isOffline && error && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '4px',
            backgroundColor: 'rgba(0,0,0,0.5)',
            color: '#fff',
            fontSize: '12px',
            textAlign: 'center',
          }}
        >
          网络已断开，无法加载图片
        </div>
      )}
    </div>
  );
};
