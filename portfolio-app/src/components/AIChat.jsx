import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import projects from '../content/projects.json';
import chatbotIntents from '../content/chatbot-intents.json';

const FALLBACK_ANSWER = "As an AI & Backend Engineer, I love discussing backend performance, vector embeddings, database clustering, or neural net transparency. Ask me about my skills, Fluxora, PULSE, or how to contact me!";

export default function AIChat() {
  const navigate = useNavigate();
  const chatContainerRef = useRef(null);
  
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'assistant',
      text: "Connection established. Ask me anything about Anubhav's skills, projects, or background."
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);

  // Scroll internally to prevent main viewport jumpiness
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, isAiTyping]);

  const handleAiQuery = async (queryText) => {
    if (!queryText.trim() || isAiTyping) return;

    const userMsgId = Date.now();
    setChatMessages((prev) => [...prev, { id: userMsgId, sender: 'user', text: queryText }]);
    setChatInput('');
    setIsAiTyping(true);
    
    await new Promise((r) => setTimeout(r, 600));

    const cleanQuery = queryText.toLowerCase();
    let responseText = FALLBACK_ANSWER;
    let messageAction = null;

    // Check dynamic JSON intents configuration
    const matchedIntent = chatbotIntents.find(intent => 
      intent.keywords.some(keyword => cleanQuery.includes(keyword))
    );

    if (matchedIntent) {
      if (matchedIntent.dynamicType === 'datetime') {
        const now = new Date();
        const dateStr = now.toLocaleDateString(undefined, { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
        const timeStr = now.toLocaleTimeString(undefined, { 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit'
        });
        responseText = `The current date is ${dateStr} and the local time is ${timeStr}.`;
      } else if (matchedIntent.useProjectDescription) {
        // Resolve project description from projects.json dynamically
        const projectObj = projects.find(p => p.id === matchedIntent.useProjectDescription);
        responseText = projectObj
          ? `${projectObj.description} You can test it out right now in the sandbox playground!`
          : matchedIntent.response;
      } else if (matchedIntent.responses && matchedIntent.responses.length > 0) {
        // Pick a random response from the config responses array
        const randIdx = Math.floor(Math.random() * matchedIntent.responses.length);
        responseText = matchedIntent.responses[randIdx];
      } else {
        responseText = matchedIntent.response;
      }
      
      if (matchedIntent.cta) {
        messageAction = matchedIntent.cta;
      }
    }

    let currentText = '';
    const interval = 10;
    const assistantMsgId = Date.now() + 1;
    
    setChatMessages((prev) => [...prev, { id: assistantMsgId, sender: 'assistant', text: '', action: messageAction }]);

    let charIdx = 0;
    const typeNextChar = () => {
      if (charIdx < responseText.length) {
        currentText += responseText.charAt(charIdx);
        setChatMessages((prev) =>
          prev.map((msg) => (msg.id === assistantMsgId ? { ...msg, text: currentText, action: messageAction } : msg))
        );
        charIdx++;
        setTimeout(typeNextChar, interval);
      } else {
        setIsAiTyping(false);
      }
    };
    
    setTimeout(typeNextChar, 50);
  };

  const handleActionClick = (sandboxType) => {
    navigate('/projects', { state: { activeSandbox: sandboxType } });
  };

  return (
    <section className="sandbox-hub-section fade-in">
      <div className="section-header">
        <h2 className="section-title">AI Assistant</h2>
      </div>

      <div className="sandbox-card" style={{ width: '100%' }}>
        <div className="sandbox-card-header">
          <h3 className="sandbox-card-title">🤖 Interactive Chatbot</h3>
          <p className="sandbox-card-subtitle">
            Chat with an AI agent trained on Anubhav's skills, projects, and work history.
          </p>
        </div>

        <div className="chat-workspace">
          <div className="chat-messages-container" ref={chatContainerRef}>
            {chatMessages.map((msg) => (
              <div key={msg.id} className={`chat-bubble-row ${msg.sender}`}>
                <span className="chat-meta">
                  {msg.sender === 'assistant' ? 'AI_Agent' : 'Guest'}
                </span>
                <div className="chat-bubble-body">
                  {msg.text.split('\n').map((line, idx) => (
                    <p key={idx} style={{ margin: 0, minHeight: line === '' ? '1rem' : 'auto' }}>
                      {line}
                    </p>
                  ))}
                  {msg.action && msg.text.length > 0 && !isAiTyping && (
                    <button
                      onClick={() => handleActionClick(msg.action.sandbox)}
                      className="chat-play-sandbox-btn"
                    >
                      <span>▶</span> Play with {msg.action.label}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {isAiTyping && (
              <div className="chat-bubble-row assistant">
                <span className="chat-meta">AI_Agent</span>
                <div className="chat-bubble-body" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span className="pulse-mini-spinner" style={{ width: '0.75rem', height: '0.75rem' }}></span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>Thinking...</span>
                </div>
              </div>
            )}
          </div>

          <div className="chat-chips-group">
            <button onClick={() => handleAiQuery('Tell me about yourself')} className="chat-action-chip">
              About Me
            </button>
            <button onClick={() => handleAiQuery('What are your skills?')} className="chat-action-chip">
              Core Stack
            </button>
            <button onClick={() => handleAiQuery('Tell me about Fluxora')} className="chat-action-chip">
              Fluxora SQL
            </button>
            <button onClick={() => handleAiQuery('Tell me about PULSE')} className="chat-action-chip">
              PULSE AI
            </button>
            <button onClick={() => handleAiQuery('How do I contact you?')} className="chat-action-chip">
              Contact Info
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAiQuery(chatInput);
            }}
            className="chat-input-form-row"
          >
            <input
              type="text"
              placeholder="Ask about fastapi, deep learning, databases..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="chat-text-input"
              disabled={isAiTyping}
            />
            <button type="submit" className="chat-send-button" disabled={isAiTyping}>
              Send
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
