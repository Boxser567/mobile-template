import { Button, Card, Input, Space, Tag } from 'antd-mobile';
import { CheckOutline, FileOutline, LikeOutline } from 'antd-mobile-icons';
import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';

import ChatTypewriter from './ChatTypewriter';

// 模拟生成的AI响应内容
const mockAIResponses = [
  `你好！我是AI助手，很高兴为你服务。你可以向我提问任何问题，我会尽力帮助你。`,

  `React是一个用于构建用户界面的JavaScript库。它由Facebook开发并于2013年开源。

React的核心特点包括：
1. 组件化架构
2. 虚拟DOM
3. 单向数据流
4. JSX语法

以下是一个简单的React组件示例：

\`\`\`jsx
import React from 'react';

function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}

export default Welcome;
\`\`\``,

  `以下是一个简单的表格示例：

| 名称 | 类型 | 说明 |
| ---- | ---- | ---- |
| id | number | 唯一标识符 |
| name | string | 用户名称 |
| age | number | 用户年龄 |
| email | string | 电子邮箱 |

你也可以使用Markdown语法来格式化文本，比如**粗体**、*斜体*或者\`代码\`等。`,

  `打字机效果在聊天界面中的应用确实能够提升用户体验。这种动态展示文本的方式可以：

> 让AI回复看起来更自然，模拟人类打字的感觉
> 降低用户等待完整回复的焦虑感
> 为复杂回答提供更好的视觉节奏

当需要展示代码时，使用代码块可以增强可读性：

\`\`\`typescript
function calculateTotal(items: Item[]): number {
  return items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
}
\`\`\`

希望这个示例对你有所帮助！`,
];

// 定义消息类型
interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  isLiked?: boolean;
}

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  return (
    <div className="markdown-content">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
};

/**
 * AI聊天示例组件
 */
const AIChatExample: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: mockAIResponses[0],
      isUser: false,
      timestamp: new Date(),
      isLiked: false,
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(30);
  const [mockResponseIndex, setMockResponseIndex] = useState(1);
  const [showControls, setShowControls] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 添加消息
  const addMessage = (content: string, isUser: boolean) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      isUser,
      timestamp: new Date(),
      isLiked: false,
    };

    setMessages(prev => [...prev, newMessage]);
  };

  // 处理复制消息
  const handleCopyMessage = (messageId: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(messageId);
    setTimeout(() => {
      setCopiedMessageId(null);
    }, 3000);
  };

  // 处理点赞消息
  const handleLikeMessage = (messageId: string) => {
    setMessages(prev => prev.map(msg => (msg.id === messageId ? { ...msg, isLiked: !msg.isLiked } : msg)));
  };

  // 发送消息
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // 添加用户消息
    addMessage(inputValue, true);
    setInputValue('');

    // 模拟AI正在输入
    setIsTyping(true);

    // 模拟延迟后添加AI回复
    setTimeout(() => {
      const responseIndex = mockResponseIndex % mockAIResponses.length;

      addMessage(mockAIResponses[responseIndex], false);
      setMockResponseIndex(prev => prev + 1);
      setIsTyping(false);
    }, 1000);
  };

  // 滚动到底部
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // 消息渲染
  const renderMessages = () => {
    return messages.map(message => (
      <div
        key={message.id}
        className={`message ${message.isUser ? 'user-message' : 'ai-message'}`}
        style={{
          display: 'flex',
          justifyContent: message.isUser ? 'flex-end' : 'flex-start',
          marginBottom: 16,
        }}
      >
        <div className={`chat-bubble-${message.isUser ? 'user' : 'ai'}`}>
          {message.isUser ? (
            <div>{message.content}</div>
          ) : (
            <>
              <ChatTypewriter
                text={message.content}
                speed={currentSpeed}
                showCursor={true}
                thinkingPauses={true}
                skippable={true}
                renderMarkdown={true}
                customRenderer={text => <MarkdownRenderer content={text} />}
                speedAdjustments={{
                  codeBlock: 3,
                  punctuation: 0.5,
                }}
                onComplete={() => console.log(`消息 ${message.id} 打字完成`)}
              />
              <div className="flex gap-2">
                <div onClick={() => handleCopyMessage(message.id, message.content)}>
                  {copiedMessageId === message.id ? (
                    <CheckOutline style={{ color: '#52c41a' }} />
                  ) : (
                    <FileOutline style={{ color: '#999' }} />
                  )}
                </div>
                <div onClick={() => handleLikeMessage(message.id)}>
                  <LikeOutline style={{ color: message.isLiked ? '#ff4d4f' : '#999' }} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    ));
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 16, height: '100%' }}>
      <Card
        title="AI聊天示例"
        extra={
          <Button size="small" onClick={() => setShowControls(!showControls)}>
            {showControls ? '隐藏控制' : '显示控制'}
          </Button>
        }
      >
        {/* 控制面板 */}
        {showControls && (
          <div style={{ marginBottom: 16, padding: '8px 0', borderBottom: '1px solid #eee' }}>
            <Space wrap>
              <div>打字速度:</div>
              <Button
                size="mini"
                color={currentSpeed === 10 ? 'primary' : 'default'}
                onClick={() => setCurrentSpeed(10)}
              >
                快速
              </Button>
              <Button
                size="mini"
                color={currentSpeed === 30 ? 'primary' : 'default'}
                onClick={() => setCurrentSpeed(30)}
              >
                中速
              </Button>
              <Button
                size="mini"
                color={currentSpeed === 60 ? 'primary' : 'default'}
                onClick={() => setCurrentSpeed(60)}
              >
                慢速
              </Button>
            </Space>

            <div style={{ marginTop: 8 }}>
              <Space wrap>
                <Tag color="#108ee9" onClick={() => addMessage('你能解释一下React是什么吗？', true)}>
                  问React
                </Tag>
                <Tag color="#87d068" onClick={() => addMessage('如何在Markdown中创建表格？', true)}>
                  问Markdown
                </Tag>
                <Tag color="#f50" onClick={() => addMessage('打字机效果有什么优势？', true)}>
                  问打字机效果
                </Tag>
              </Space>
            </div>
          </div>
        )}

        {/* 消息区域 */}
        <div
          className="chat-messages"
          style={{
            minHeight: 300,
            maxHeight: 500,
            overflowY: 'auto',
            margin: '0 -16px',
            padding: '0 16px',
          }}
        >
          {renderMessages()}

          {/* AI正在输入提示 */}
          {isTyping && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                color: '#999',
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span style={{ marginLeft: 8 }}>AI正在输入...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 输入区域 */}
        <div
          style={{
            marginTop: 16,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Input
            placeholder="输入你的问题..."
            value={inputValue}
            onChange={setInputValue}
            style={{ flex: 1 }}
            onEnterPress={handleSendMessage}
          />
          <Button color="primary" style={{ marginLeft: 8 }} onClick={handleSendMessage}>
            发送
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AIChatExample;
