import type { CSSProperties } from 'react';

import React from 'react';

import useChatTypewriter from '@/hooks/useChatTypewriter';

// 支持markdown渲染的工具函数
const renderMarkdown = (text: string): React.ReactNode => {
  // 简单的实现，实际应用中建议使用react-markdown等库
  const codeBlocks = text.split('```');

  if (codeBlocks.length <= 1) {
    // 没有代码块，直接处理普通文本
    return processTextWithBreaks(text);
  }

  // 处理包含代码块的文本
  return codeBlocks.map((block, i) => {
    if (i % 2 === 0) {
      // 普通文本
      return processTextWithBreaks(block);
    } else {
      // 代码块
      const firstLineBreak = block.indexOf('\n');
      const language = firstLineBreak > 0 ? block.substring(0, firstLineBreak).trim() : '';
      const code = firstLineBreak > 0 ? block.substring(firstLineBreak + 1) : block;

      return (
        <div key={`code-${i}`} className="chat-typewriter-code-block">
          {language && <div className="chat-typewriter-code-language">{language}</div>}
          <pre>
            <code>{code}</code>
          </pre>
        </div>
      );
    }
  });
};

// 处理普通文本，保留换行
const processTextWithBreaks = (text: string): React.ReactNode => {
  const lines = text.split('\n');

  return lines.map((line, i) => (
    <React.Fragment key={`line-${i}`}>
      {line}
      {i < lines.length - 1 && <br />}
    </React.Fragment>
  ));
};

interface ChatTypewriterProps {
  /**
   * 需要显示的文本内容
   */
  text: string;

  /**
   * 打字速度 (毫秒/字符)
   */
  speed?: number;

  /**
   * 随机速度变化因子 (0-1)
   */
  randomness?: number;

  /**
   * 在句子间是否添加停顿
   */
  thinkingPauses?: boolean | number;

  /**
   * 是否可以跳过动画
   */
  skippable?: boolean;

  /**
   * 自定义CSS样式
   */
  style?: CSSProperties;

  /**
   * 自定义CSS类名
   */
  className?: string;

  /**
   * 光标元素
   */
  cursor?: React.ReactNode;

  /**
   * 是否显示光标
   */
  showCursor?: boolean;

  /**
   * 打字完成后的回调
   */
  onComplete?: () => void;

  /**
   * 不同内容类型的速度调整
   */
  speedAdjustments?: {
    codeBlock?: number;
    longText?: number;
    punctuation?: number;
  };

  /**
   * 是否自动开始打字
   */
  autoStart?: boolean;

  /**
   * 是否支持markdown渲染
   */
  renderMarkdown?: boolean;

  /**
   * 用户是否正在输入（可用于模拟AI正在思考的状态）
   */
  isUserTyping?: boolean;

  /**
   * 是否显示"跳过"按钮
   */
  showSkipButton?: boolean;

  /**
   * 跳过按钮的文本
   */
  skipButtonText?: string;

  /**
   * 自定义内容渲染器
   */
  customRenderer?: (text: string) => React.ReactNode;
}

/**
 * AI聊天打字机效果组件
 */
export const ChatTypewriter: React.FC<ChatTypewriterProps> = ({
  text,
  speed = 30,
  randomness = 0.15,
  thinkingPauses = true,
  skippable = true,
  style,
  className = '',
  cursor = '▋',
  showCursor = true,
  onComplete,
  speedAdjustments,
  autoStart = true,
  renderMarkdown: shouldRenderMarkdown = true,
  isUserTyping = false,
  showSkipButton = true,
  skipButtonText = 'skip',
  customRenderer,
}) => {
  const { displayText, isTyping, isCompleted, complete, progress } = useChatTypewriter({
    text,
    speed,
    randomness,
    thinkingPauses,
    interruptible: skippable,
    autoStart: !isUserTyping && autoStart,
    speedAdjustments,
    onComplete,
  });

  // 当用户输入状态变化时，控制打字状态
  React.useEffect(() => {
    // TODO: 实现用户输入状态变化时的逻辑
    // 例如：当用户开始输入时暂停打字，用户停止输入时恢复打字
  }, [isUserTyping]);

  const cursorStyle: CSSProperties = {
    display: 'inline-block',
    opacity: isTyping ? 1 : 0,
    animation: isTyping ? 'blink 1s step-end infinite' : 'none',
    transition: 'opacity 0.3s ease',
    marginLeft: '1px',
    fontWeight: 300,
    color: '#1677ff',
  };

  const handleSkip = () => {
    if (skippable && !isCompleted) {
      complete();
    }
  };

  return (
    <div
      className={`chat-typewriter ${className}`}
      style={{
        ...style,
        position: 'relative',
      }}
    >
      <div className="chat-typewriter-content">
        {customRenderer
          ? customRenderer(displayText)
          : shouldRenderMarkdown
            ? renderMarkdown(displayText)
            : displayText}

        {/* 光标样式 {showCursor && isTyping && (
          <span className="chat-typewriter-cursor" style={cursorStyle} aria-hidden="true">
            {cursor}
          </span>
        )} */}
      </div>

      {/* 跳过按钮 */}
      {showSkipButton && skippable && isTyping && progress > 20 && !isCompleted && (
        <button className="chat-typewriter-skip-btn" onClick={handleSkip} aria-label={skipButtonText}>
          {skipButtonText}
        </button>
      )}

      {/* 进度指示器（可选） */}
      {isTyping && !isCompleted && (
        <div className="chat-typewriter-progress" style={{ width: `${progress}%` }} aria-hidden="true" />
      )}
    </div>
  );
};

export default ChatTypewriter;
