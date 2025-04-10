import { Button } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';

import AIChatExample from '@/components/AIChatExample';

const ChatPage = () => {
  const navigate = useNavigate();

  return (
    <div>
      {/* AI聊天打字机效果示例 */}
      <div className="p-4">
        <Button
          color="primary"
          size="mini"
          onClick={() => {
            navigate(-1);
          }}
        >
          go back
        </Button>
      </div>
      <AIChatExample />
    </div>
  );
};

export default ChatPage;
