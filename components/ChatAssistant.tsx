
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { DeviceType } from '../types';

interface ChatAssistantProps {
  deviceType: DeviceType;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ deviceType }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: `Xin chào! Tôi là chuyên gia Cisco. Bạn cần hỗ trợ gì cho thiết bị ${deviceType} này không?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInstanceRef = useRef<any>(null);

  // Khởi tạo phiên chat
  const initChat = () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      chatInstanceRef.current = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: `Bạn là một kỹ sư mạng Cisco CCIE chuyên nghiệp. 
          Nhiệm vụ của bạn là hỗ trợ người dùng cấu hình, khắc phục sự cố và tối ưu hóa thiết bị ${deviceType}. 
          Hãy trả lời bằng Tiếng Việt, súc tích, chuyên nghiệp. 
          Nếu có lệnh CLI, hãy bọc chúng trong khối code markdown.`,
        },
      });
    } catch (e) {
      console.error("Failed to initialize chat:", e);
    }
  };

  useEffect(() => {
    initChat();
  }, [deviceType]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (!chatInstanceRef.current) initChat();

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const streamResponse = await chatInstanceRef.current.sendMessageStream({ message: userMessage });
      
      let fullText = "";
      setMessages(prev => [...prev, { role: 'model', text: "" }]);

      for await (const chunk of streamResponse) {
        const c = chunk as GenerateContentResponse;
        fullText += c.text;
        
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'model', text: fullText };
          return updated;
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Rất tiếc, đã có lỗi xảy ra khi kết nối với AI. Vui lòng kiểm tra API Key và thử lại." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl flex flex-col h-[450px] shadow-xl overflow-hidden">
      <div className="p-4 border-b border-slate-700/50 bg-slate-800/20 flex items-center justify-between">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <i className="fas fa-comments text-emerald-400"></i> AI Network Chat
        </h3>
        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase">
          Agent Active
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#0f172a]/30">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
              msg.role === 'user' 
              ? 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-900/20' 
              : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
            }`}>
              <div className="whitespace-pre-wrap leading-relaxed">
                {msg.text || (isLoading && idx === messages.length - 1 ? <i className="fas fa-circle-notch animate-spin opacity-50"></i> : "")}
              </div>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 bg-slate-900/50 border-t border-slate-700/50 flex gap-2">
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Hỏi AI về lỗi hoặc cách cấu hình..."
          className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          disabled={isLoading}
        />
        <button 
          type="submit"
          disabled={!input.trim() || isLoading}
          className="w-10 h-10 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white rounded-xl flex items-center justify-center transition-all shadow-lg shadow-blue-900/20"
        >
          {isLoading ? <i className="fas fa-spinner animate-spin"></i> : <i className="fas fa-paper-plane"></i>}
        </button>
      </form>
    </div>
  );
};

export default ChatAssistant;
