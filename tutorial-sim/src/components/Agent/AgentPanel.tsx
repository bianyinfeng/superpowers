import React, { useState, useRef, useEffect } from 'react';
import { SimulatedAgent, defaultTools } from '../../core/agent';
import type { AgentMessage } from '../../core/agent';

const createAgent = () => new SimulatedAgent({
  systemPrompt: '你是一个智能 AI 助手。你可以使用工具来帮助用户完成任务。',
  tools: defaultTools,
  temperature: 0.7,
  maxTurns: 50,
});

export const AgentPanel: React.FC = () => {
  const [agent] = useState(() => createAgent());
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;
    const userInput = input;
    setInput('');
    setIsProcessing(true);

    const newMsgs = await agent.processInput(userInput);
    setMessages(prev => [...prev, ...newMsgs]);
    setIsProcessing(false);
  };

  const handleReset = () => {
    agent.reset();
    setMessages([]);
  };

  const handleSampleQuery = (query: string) => {
    setInput(query);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🤖 Agent 交互沙箱</h2>
      <p style={styles.desc}>
        模拟智能体的感知-思考-行动循环，理解 Agent 工作原理
      </p>

      <div style={styles.mainLayout}>
        {/* 聊天区 */}
        <div style={styles.chatContainer}>
          <div style={styles.chatMessages}>
            {messages.length === 0 && (
              <div style={styles.welcome}>
                <h3>👋 欢迎使用 Agent 模拟器</h3>
                <p>试试这些示例：</p>
                <div style={styles.sampleQueries}>
                  {[
                    '你好，你能做什么？',
                    '帮我搜索大语言模型的信息',
                    '计算 10 + 20 + 30',
                    '分析这段文字：今天天气真好，心情很开心',
                  ].map((q, i) => (
                    <button
                      key={i}
                      style={styles.sampleBtn}
                      onClick={() => handleSampleQuery(q)}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} style={{
                ...styles.message,
                ...(msg.role === 'user' ? styles.userMsg : {}),
                ...(msg.role === 'agent' ? styles.agentMsg : {}),
                ...(msg.role === 'tool' ? styles.toolMsg : {}),
              }}>
                <div style={styles.msgRole}>
                  {msg.role === 'user' ? '👤 用户' :
                   msg.role === 'agent' ? '🤖 Agent' :
                   msg.role === 'tool' ? '🔧 工具' : '📋 系统'}
                </div>
                <div style={styles.msgContent}>
                  {msg.content.split('\n').map((line, j) => (
                    <React.Fragment key={j}>
                      {line}
                      {j < msg.content.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
            {isProcessing && (
              <div style={{ ...styles.message, ...styles.agentMsg }}>
                <div style={styles.msgRole}>🤖 Agent</div>
                <div style={styles.thinking}>思考中...</div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div style={styles.chatInput}>
            <input
              style={styles.input}
              placeholder="输入消息..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              disabled={isProcessing}
            />
            <button style={styles.sendBtn} onClick={handleSend} disabled={isProcessing}>
              发送
            </button>
            <button style={styles.resetBtn} onClick={handleReset}>
              重置
            </button>
          </div>
        </div>

        {/* 工具面板 */}
        <div style={styles.sidePanel}>
          <button
            style={styles.toggleBtn}
            onClick={() => setShowTools(!showTools)}
          >
            {showTools ? '隐藏' : '显示'}工具列表
          </button>
          {showTools && (
            <div style={styles.toolList}>
              <h4>可用工具</h4>
              {agent.getTools().map((tool, i) => (
                <div key={i} style={styles.toolItem}>
                  <div style={styles.toolName}>🔧 {tool.name}</div>
                  <div style={styles.toolDesc}>{tool.description}</div>
                </div>
              ))}
            </div>
          )}

          <div style={styles.infoBox}>
            <h4>💡 Agent 工作原理</h4>
            <ol style={styles.infoList}>
              <li><strong>感知</strong>：接收用户输入</li>
              <li><strong>思考</strong>：分析意图，判断是否需要使用工具</li>
              <li><strong>行动</strong>：调用工具或直接生成回答</li>
              <li><strong>反思</strong>：整合工具结果，给出最终回复</li>
            </ol>
            <p style={styles.infoNote}>
              这是一个简化的规则型 Agent。真实的 AI Agent 使用大语言模型进行推理，
              但核心的"感知-思考-行动"循环是相同的。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '20px' },
  title: { margin: '0 0 8px', fontSize: '24px' },
  desc: { color: '#666', marginBottom: '20px' },
  mainLayout: { display: 'flex', gap: '20px', flexWrap: 'wrap' },
  chatContainer: {
    flex: 2, minWidth: '300px', border: '1px solid #e5e7eb', borderRadius: '12px',
    display: 'flex', flexDirection: 'column', height: '500px',
  },
  chatMessages: {
    flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px',
  },
  chatInput: { display: 'flex', gap: '8px', padding: '12px', borderTop: '1px solid #e5e7eb' },
  input: {
    flex: 1, padding: '10px 14px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px',
  },
  sendBtn: {
    padding: '10px 20px', background: '#4f46e5', color: 'white', border: 'none',
    borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold',
  },
  resetBtn: {
    padding: '10px 16px', background: '#6b7280', color: 'white', border: 'none',
    borderRadius: '8px', cursor: 'pointer',
  },
  message: { padding: '10px 14px', borderRadius: '8px', maxWidth: '85%' },
  userMsg: { background: '#e0e7ff', alignSelf: 'flex-end', marginLeft: 'auto' },
  agentMsg: { background: '#f0fdf4', alignSelf: 'flex-start' },
  toolMsg: { background: '#fef3c7', alignSelf: 'flex-start', fontFamily: 'monospace', fontSize: '13px' },
  msgRole: { fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#6b7280' },
  msgContent: { fontSize: '14px', lineHeight: '1.6' },
  thinking: { color: '#9ca3af', fontStyle: 'italic' },
  welcome: { textAlign: 'center', padding: '40px 20px', color: '#6b7280' },
  sampleQueries: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' },
  sampleBtn: {
    padding: '8px 16px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px',
    cursor: 'pointer', fontSize: '13px', textAlign: 'left',
  },
  sidePanel: { flex: 1, minWidth: '250px' },
  toggleBtn: {
    padding: '8px 16px', background: '#f3f4f6', border: '1px solid #e5e7eb',
    borderRadius: '6px', cursor: 'pointer', width: '100%', marginBottom: '12px',
  },
  toolList: { marginBottom: '16px' },
  toolItem: {
    padding: '10px', background: '#f8f9fa', borderRadius: '6px', marginBottom: '6px',
  },
  toolName: { fontWeight: 'bold', fontSize: '14px', marginBottom: '2px' },
  toolDesc: { fontSize: '12px', color: '#6b7280' },
  infoBox: { padding: '16px', background: '#f0f9ff', borderRadius: '8px' },
  infoList: { paddingLeft: '20px', lineHeight: '1.8', fontSize: '14px' },
  infoNote: { fontSize: '12px', color: '#6b7280', marginTop: '12px' },
};
