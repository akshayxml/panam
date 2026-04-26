import React, { useState } from 'react';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

const renderMessageText = (text: string) => {
  const lines = text.split('\n');
  return lines.map((line, lineIndex) => {
    const parts = line.split(/(\*\*.*?\*\*)/g);
    const renderedLine = parts.map((part, partIndex) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={partIndex}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
    return <div key={lineIndex}>{renderedLine}</div>;
  });
};

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    if (process.env.NODE_ENV === 'development') {
      setTimeout(() => {
        const aiMessage: Message = { sender: 'ai', text: "Mock Response: Hello! I'm your AI assistant. I'm in dev mode." };
        setMessages(prev => [...prev, aiMessage]);
        setLoading(false);
      }, 1000);
    } else {
      // @ts-ignore
      google.script.run
        .withSuccessHandler((response: { statusCode: number; text: string }) => {
          const aiMessage: Message = { sender: 'ai', text: response.text };
          setMessages(prev => [...prev, aiMessage]);
          setLoading(false);
        })
        .withFailureHandler((error: any) => {
          const errorMessage: Message = { sender: 'ai', text: `Error: ${error.message || error}` };
          setMessages(prev => [...prev, errorMessage]);
          setLoading(false);
        })
        .getAIChatResponse(input);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '50px', right: '20px', zIndex: 1000, fontFamily: 'Roboto, sans-serif' }}>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '30px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            cursor: 'pointer',
            fontSize: '24px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transition: 'transform 0.2s',
          }}
          onMouseOver={e => ((e.currentTarget as HTMLElement).style.transform = 'scale(1.05)')}
          onMouseOut={e => ((e.currentTarget as HTMLElement).style.transform = 'scale(1)')}
        >
          💬
        </button>
      )}
      {isOpen && (
        <div
          style={{
            width: '350px',
            height: '500px',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.18)',
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '15px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>AI Portfolio Analyst</h3>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '18px' }}
            >
              ✖
            </button>
          </div>
          <div style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {messages.length === 0 && (
              <div style={{ color: '#aaa', textAlign: 'center', marginTop: '50px' }}>
                Ask me anything about your portfolio!
              </div>
            )}
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  backgroundColor: msg.sender === 'user' ? '#667eea' : '#f1f3f4',
                  color: msg.sender === 'user' ? 'white' : '#3c4043',
                  padding: '10px 15px',
                  borderRadius: '12px',
                  maxWidth: '80%',
                  wordBreak: 'break-word',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                }}
              >
                {renderMessageText(msg.text)}
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', backgroundColor: '#f1f3f4', padding: '10px 15px', borderRadius: '12px', color: '#3c4043' }}>
                Thinking...
              </div>
            )}
          </div>
          <div style={{ padding: '15px', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput((e.target as HTMLInputElement).value)}
              onKeyPress={e => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              style={{ flex: 1, padding: '10px 15px', borderRadius: '20px', border: '1px solid #dadce0', outline: 'none' }}
            />
            <button
              onClick={handleSend}
              style={{
                padding: '10px 15px',
                backgroundColor: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
