import React, { useState, useEffect, useRef } from 'react';
import { Message, Sender, DailySession } from '../types';
import { getAIResponse } from '../services/gemini';
import { Send, ExternalLink, Lock, Clock, User, Sparkles, LogOut } from 'lucide-react';

interface ChatScreenProps {
  session: DailySession;
  onSendMessage: (text: string, sender: Sender) => void;
  onStartSurvey: () => void;
  onLogout: () => void;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ session, onSendMessage, onStartSurvey, onLogout }) => {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Defensive access to messages
  const messages = session?.messages || [];
  const userMessageCount = messages.filter(m => m.sender === Sender.USER).length;
  const aiMessageCount = messages.filter(m => m.sender === Sender.MODEL).length;
  
  // Rules
  const MIN_AI_MESSAGES_FOR_SURVEY = 5;
  const MAX_USER_MESSAGES_ALLOWED = 10;
  
  const isLocked = userMessageCount >= MAX_USER_MESSAGES_ALLOWED;
  const canStartSurvey = aiMessageCount >= MIN_AI_MESSAGES_FOR_SURVEY;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLocked || isTyping) return;

    const userText = inputValue.trim();
    setInputValue('');
    
    // 1. Add user message via parent handler (which updates state/storage)
    onSendMessage(userText, Sender.USER);
    setIsTyping(true);

    try {
      // 2. Get AI response
      const aiText = await getAIResponse(messages, userText);
      
      // 3. Add AI message
      onSendMessage(aiText, Sender.MODEL);
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSurveyClick = () => {
    // Notify App to mark session as "completed" (optimistic completion)
    // The browser handles opening the link in a new tab via the <a> tag
    onStartSurvey();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-screen bg-background max-w-md mx-auto shadow-2xl overflow-hidden relative">
      {/* Header - Increased z-index and ensured layout */}
      <header className="bg-white border-b border-slate-100 p-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div>
          <h2 className="font-bold text-primary">Studien-Companion</h2>
          <p className="text-xs text-secondary flex items-center gap-1">
            {isLocked ? <Lock className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
            {isLocked ? 'Maximale Nachrichten erreicht' : 'Tägliche Session'}
          </p>
        </div>
        <div className="flex items-center gap-3">
            <div className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-500">
            {userMessageCount}/{MAX_USER_MESSAGES_ALLOWED}
            </div>
            
            <button 
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("Logout clicked"); // Debug log
                    onLogout();
                }} 
                className="flex items-center gap-1 text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-md transition-all cursor-pointer" 
                title="Abmelden"
            >
                <LogOut size={18} />
                <span className="text-xs font-medium">Exit</span>
            </button>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24 z-0">
        {messages.length === 0 && (
          <div className="text-center text-slate-400 mt-10 text-sm px-8">
            <p>Willkommen zur heutigen Session. Erzähl mir, wie es dir heute geht.</p>
          </div>
        )}
        
        {messages.map((msg) => {
          const isUser = msg.sender === Sender.USER;
          return (
            <div
              key={msg.id}
              className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                  isUser ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'
                }`}>
                  {isUser ? <User size={16} /> : <Sparkles size={16} />}
                </div>

                {/* Bubble Wrapper */}
                <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`px-4 py-3 text-sm leading-relaxed shadow-sm rounded-2xl ${
                      isUser
                        ? 'bg-primary text-white rounded-br-none'
                        : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>

              </div>
            </div>
          );
        })}
        
        {isTyping && (
           <div className="flex w-full justify-start">
             <div className="flex max-w-[85%] flex-row items-end gap-2">
               <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                 <Sparkles size={16} />
               </div>
               <div className="flex flex-col items-start">
                 <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                   <div className="flex space-x-1 h-4 items-center">
                     <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                     <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                     <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                   </div>
                 </div>
                 <span className="text-[10px] text-slate-400 mt-1 px-1">Companion schreibt...</span>
               </div>
             </div>
           </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Floating Action Button (Survey) */}
      {canStartSurvey && (
        <div className="absolute bottom-20 left-0 right-0 px-4 flex justify-center z-20">
          <a
            href="https://wisotudortmund.eu.qualtrics.com/jfe/form/SV_8oxQOWJRIMMtbZc"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleSurveyClick}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold shadow-lg transition-all transform hover:scale-105 no-underline cursor-pointer ${
              isLocked 
                ? 'bg-accent text-white animate-pulse' 
                : 'bg-white text-accent border-2 border-accent hover:bg-accent hover:text-white'
            }`}
          >
            <ExternalLink className="w-5 h-5" />
            Umfrage auf Qualtrics starten
          </a>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white p-4 border-t border-slate-100 absolute bottom-0 w-full z-30">
        {isLocked ? (
          <div className="flex items-center justify-center p-3 bg-slate-50 text-slate-500 rounded-lg border border-slate-200 gap-2">
            <Lock className="w-4 h-4" />
            <span className="text-sm font-medium">Chat für heute beendet. Bitte Umfrage starten.</span>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nachricht schreiben..."
              disabled={isTyping}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
              className="bg-primary text-white p-3 rounded-full hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatScreen;