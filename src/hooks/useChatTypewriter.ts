import { useCallback, useEffect, useRef, useState } from 'react';

interface ChatTypewriterOptions {
  /**
   * 需要显示的完整文本
   */
  text: string;

  /**
   * 每个字符的打字速度 (毫秒)
   */
  speed?: number;

  /**
   * 是否自动开始打字效果
   */
  autoStart?: boolean;

  /**
   * 随机的速度变化 (0-1之间，表示速度的随机波动范围)
   */
  randomness?: number;

  /**
   * 打字完成后的回调函数
   */
  onComplete?: () => void;

  /**
   * 每打完一个句子的回调（以句号、问号、感叹号等为界定）
   */
  onSentenceComplete?: (sentence: string, sentenceIndex: number) => void;

  /**
   * 不同类型内容的打字速度调整
   */
  speedAdjustments?: {
    /** 代码块的打字速度倍率 */
    codeBlock?: number;
    /** 长段文字的打字速度倍率 */
    longText?: number;
    /** 标点符号的打字速度倍率 */
    punctuation?: number;
  };

  /**
   * 模拟人工思考的停顿时间 (毫秒)，在句子间停顿
   */
  thinkingPauses?: boolean | number;

  /**
   * 是否可以被用户中断（例如点击跳过动画）
   */
  interruptible?: boolean;
}

interface ChatTypewriterResult {
  /**
   * 当前显示的文本
   */
  displayText: string;

  /**
   * 打字是否完成
   */
  isCompleted: boolean;

  /**
   * 打字是否正在进行中
   */
  isTyping: boolean;

  /**
   * 手动开始打字
   */
  start: () => void;

  /**
   * 手动重置打字效果
   */
  reset: () => void;

  /**
   * 手动暂停打字效果
   */
  pause: () => void;

  /**
   * 手动恢复打字效果
   */
  resume: () => void;

  /**
   * 立即完成打字，显示全部文本
   */
  complete: () => void;

  /**
   * 当前完成百分比 (0-100)
   */
  progress: number;
}

// 检测特殊文本模式的正则表达式
const PATTERNS = {
  CODE_BLOCK: /```[\s\S]*?```/g,
  SENTENCE_END: /[.!?。！？…]\s*$/,
  PUNCTUATION: /[,.;:，。；：、]/,
};

/**
 * AI聊天打字机效果Hook
 *
 * @param options 打字机配置选项
 * @returns 打字机状态和控制函数
 */
export function useChatTypewriter(options: ChatTypewriterOptions): ChatTypewriterResult {
  const {
    text = '',
    speed = 30, // AI聊天场景默认使用更快的速度
    autoStart = true,
    randomness = 0.15,
    onComplete,
    onSentenceComplete,
    speedAdjustments = {
      codeBlock: 3, // 代码块是普通文本的3倍速
      longText: 1.5, // 长段文字是普通文本的1.5倍速
      punctuation: 0.5, // 标点符号是普通速度的一半
    },
    thinkingPauses = true,
    interruptible = true,
  } = options;

  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  // 使用ref存储当前上下文状态
  const contextRef = useRef({
    isInCodeBlock: false,
    currentSentence: '',
    sentenceCount: 0,
    lastPauseIndex: -1,
  });

  // 重置打字效果
  const reset = useCallback(() => {
    setDisplayText('');
    setCurrentIndex(-1);
    setIsCompleted(false);
    setProgress(0);
    setIsTyping(false);
    setIsPaused(false);
    contextRef.current = {
      isInCodeBlock: false,
      currentSentence: '',
      sentenceCount: 0,
      lastPauseIndex: -1,
    };
  }, []);

  // 开始打字效果
  const start = useCallback(() => {
    setIsTyping(true);
    setCurrentIndex(0);
  }, []);

  // 暂停打字效果
  const pause = useCallback(() => {
    setIsPaused(true);
  }, []);

  // 恢复打字效果
  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);

  // 直接完成打字，显示全部文本
  const complete = useCallback(() => {
    if (interruptible) {
      setDisplayText(text);
      setCurrentIndex(text.length);
      setIsTyping(false);
      setIsCompleted(true);
      setProgress(100);

      if (onComplete) {
        onComplete();
      }
    }
  }, [interruptible, text, onComplete]);

  // 检测文本中的特殊模式并调整速度
  const getAdjustedSpeed = useCallback(
    (index: number): number => {
      const char = text[index];
      const nextChars = text.slice(index, index + 10); // 检查前方的字符

      // 检测是否在代码块中
      if (nextChars.startsWith('```') || (nextChars.includes('```') && contextRef.current.isInCodeBlock)) {
        contextRef.current.isInCodeBlock = !contextRef.current.isInCodeBlock;

        return speed; // 代码块的开始和结束标记使用默认速度
      }

      if (contextRef.current.isInCodeBlock) {
        return speed / (speedAdjustments.codeBlock || 1); // 在代码块中使用更快的速度
      }

      // 检测标点符号，使用较慢的速度
      if (PATTERNS.PUNCTUATION.test(char)) {
        return speed * (speedAdjustments.punctuation || 1);
      }

      // 默认速度
      return speed;
    },
    [speed, speedAdjustments],
  );

  // 检测是否需要停顿（例如句子结束后）
  const shouldPause = useCallback(
    (index: number): number => {
      if (!thinkingPauses) return 0;

      const currentText = text.slice(0, index + 1);
      const lastSentence = currentText.split(/[.!?。！？]/g).pop() || '';

      // 如果是句子结束且不在代码块中
      if (
        PATTERNS.SENTENCE_END.test(currentText) &&
        !contextRef.current.isInCodeBlock &&
        index - contextRef.current.lastPauseIndex > 10
      ) {
        contextRef.current.lastPauseIndex = index;

        // 完成一个句子
        if (onSentenceComplete) {
          contextRef.current.sentenceCount++;
          onSentenceComplete(contextRef.current.currentSentence, contextRef.current.sentenceCount);
          contextRef.current.currentSentence = '';
        }

        // 根据句子长度计算停顿时间
        const pauseTime =
          typeof thinkingPauses === 'number' ? thinkingPauses : Math.min(500, Math.max(200, lastSentence.length * 10));

        return pauseTime;
      }

      // 收集当前句子
      if (onSentenceComplete) {
        contextRef.current.currentSentence += text[index];
      }

      return 0;
    },
    [thinkingPauses, text, onSentenceComplete],
  );

  useEffect(() => {
    // 文本变化时重置
    reset();

    // 如果设置为自动开始，则自动开始打字
    if (autoStart) {
      start();
    }
  }, [text, reset, autoStart, start]);

  useEffect(() => {
    // 如果暂停中或未开始打字，不执行后续逻辑
    if (isPaused || currentIndex === -1) {
      return;
    }

    if (currentIndex >= text.length) {
      setIsTyping(false);
      setIsCompleted(true);
      setProgress(100);

      // 调用完成回调
      if (onComplete) {
        onComplete();
      }

      return;
    }

    // 计算进度
    const newProgress = Math.floor((currentIndex / text.length) * 100);

    setProgress(newProgress);

    // 添加下一个字符
    setDisplayText(text.substring(0, currentIndex + 1));
    setIsTyping(true);

    // 获取当前字符的停顿时间
    const pauseTime = shouldPause(currentIndex);

    // 获取调整后的速度
    const adjustedSpeed = getAdjustedSpeed(currentIndex);

    // 计算下一个字符的打字速度（添加随机性）
    const randomFactor = 1 - randomness + Math.random() * randomness * 2;
    const typeSpeed = adjustedSpeed * randomFactor + pauseTime;

    // 设置下一个字符的计时器
    const timer = setTimeout(() => {
      setCurrentIndex(prevIndex => prevIndex + 1);
    }, typeSpeed);

    return () => clearTimeout(timer);
  }, [currentIndex, text, speed, randomness, onComplete, isPaused, getAdjustedSpeed, shouldPause]);

  return {
    displayText,
    isCompleted,
    isTyping,
    start,
    reset,
    pause,
    resume,
    complete,
    progress,
  };
}

export default useChatTypewriter;
