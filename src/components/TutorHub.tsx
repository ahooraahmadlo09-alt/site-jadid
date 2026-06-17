import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, MessageCircle, RefreshCw, HelpCircle, AlertCircle } from 'lucide-react';
import { playSound } from '../utils/audio';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export default function TutorHub() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: 'سلااام دوست کوچولوی من! 🦖 من دانادانا هستم، دایناسور شکلی و مهربون دانا لند! هر سوالی درباره ریاضی، علوم، املای کلمه‌ها داشته باشی یا دوست داشته باشی یه معمای باحال بازی کنیم، کافیه ازم بپرسی! آماده‌ای بریم تفریح؟ ✨'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg = textToSend.trim();
    if (!customText) {
      setInput('');
    }
    
    // Add user message to state
    playSound('pop');
    const newHistory = [...messages, { role: 'user' as const, text: userMsg }];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      // API call to our full-stack server
      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          chatHistory: newHistory.slice(-6) // Send only last 6 turns to manage tokens cleanly
        })
      });

      const data = await response.json();
      if (data && data.reply) {
        if (data.fallback) {
          // Play a slightly softer sound
          playSound('bounce');
        } else {
          playSound('success');
        }
        setMessages(prev => [...prev, { role: 'model', text: data.reply }]);
      } else {
        throw new Error('سیگنال دریافت نشد');
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          text: 'اوه! صدای بیسیم قطع و وصل میشه! 📡 ملخ‌های کوچولوی فضایی دارن روی سیم‌ها راه میرن! بیا یه دفعه دیگه جمله‌ات رو بفرست تا با دندونام بگیرمش! 🦖✨'
        }
      ]);
      playSound('failure');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestClick = (q: string) => {
    if (isLoading) return;
    handleSendMessage(q);
  };

  const clearChat = () => {
    playSound('pop');
    setMessages([
      {
        role: 'model',
        text: 'دوباره شروع کنیم! 🦖✨ ابرها مثل یک تخته تمیز پاک شدند. منتظر سوال‌های درخشانت هستم دوست من!'
      }
    ]);
  };

  const quickStickers = [
    { label: '🧐 برام یه معما تعریف کن', text: 'یک معمای ساده و خیلی بامزه برای بچه‌ها برام بگو' },
    { label: '🌍 چرا برگ درختان سبزه؟', text: 'چرا برگ درختان سبز رنگه؟ خیلی ساده برام توضیح بده' },
    { label: '🦖 دایناسورها چطوری منقرض شدن؟', text: 'دایناسورها کجا رفتن؟ آیا دوست تو بودن؟ به زبان ساده بگو' },
    { label: '🎒 چطوری درس‌هام رو بخونم؟', text: 'چطور می‌تونم یک دانش‌آموز خیلی قهرمان و موفق توی درس‌هام باشم؟' },
  ];

  return (
    <div id="tutor-hub" className="bg-white comic-border rounded-3xl p-5 flex flex-col h-[520px] relative overflow-hidden text-right">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3 mb-3">
        <button 
          onClick={clearChat}
          id="clear-chat-btn"
          title="پاک کردن گفتگو"
          className="text-slate-900 border-2 border-black bg-white p-2 rounded-xl transition-all cursor-pointer shadow-[2px_2px_0px_0px_#1A1A1A] hover:bg-slate-50 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          <div>
            <h3 className="font-black text-slate-800 text-sm font-sans">همیار دانشمند دانادانا 🦕</h3>
            <span className="text-[10px] text-[#2563EB] font-black bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">هوش گپ و گفت دانا لند</span>
          </div>
          <div className="w-10 h-10 bg-yellow-400 rounded-2xl flex items-center justify-center text-2xl comic-border-xs animate-bounce">
            🦖
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div 
        ref={scrollRef}
        id="chat-messages-container"
        className="flex-1 overflow-y-auto space-y-3.5 pr-1.5 scrollbar-thin scrollbar-thumb-indigo-200 scrollbar-track-transparent"
        dir="rtl"
      >
        {messages.map((m, idx) => (
          <div 
            key={idx}
            className={`flex items-start gap-2 max-w-[90%] ${
              m.role === 'user' ? 'mr-auto flex-row-reverse' : 'ml-auto'
            } animate-fade-in`}
          >
            {m.role === 'model' && (
              <div className="w-7 h-7 bg-white comic-border-xs rounded-xl flex items-center justify-center text-sm shrink-0">
                🦖
              </div>
            )}
            
            <div className={`p-3 rounded-2xl text-xs font-bold leading-relaxed shadow-sm ${
              m.role === 'user' 
                ? 'bg-orange-100 text-orange-950 comic-border-xs rounded-tr-sm' 
                : 'bg-white text-slate-900 comic-border-xs rounded-tl-sm'
            }`}>
              {m.text}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-indigo-700 animate-pulse font-bold text-xs" dir="rtl">
            <div className="w-6 h-6 bg-white comic-border-xs rounded-lg flex items-center justify-center text-sm shrink-0 animate-spin">
              💫
            </div>
            <span>دانادانا در حال نوشتن جواب جادوییه... 🦖💭</span>
          </div>
        )}
      </div>

      {/* Quick Stickers Panel */}
      <div className="mt-3 pt-2.5 border-t border-slate-200">
        <span className="text-[10px] text-slate-500 font-black block mb-1.5 text-right">برچسب‌های پرسشِ سریع:</span>
        <div className="flex flex-wrap gap-1.5 justify-end max-h-[70px] overflow-y-auto pr-1">
          {quickStickers.map((st, sIdx) => (
            <button
              key={sIdx}
              onClick={() => handleSuggestClick(st.text)}
              id={`quick-sticker-${sIdx}`}
              disabled={isLoading}
              className="bg-white text-indigo-950 px-2.5 py-1 text-[10px] font-black rounded-xl transition-all cursor-pointer whitespace-nowrap pill-btn-sm hover:translate-y-0.5"
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} 
        className="mt-3 flex gap-2"
        id="tutor-chat-form"
      >
        <button
          type="submit"
          id="send-chat-btn"
          disabled={isLoading || !input.trim()}
          className="bg-blue-400 text-blue-950 p-2.5 rounded-2xl cursor-pointer transition-all flex items-center justify-center shrink-0 pill-btn-sm disabled:opacity-40 disabled:pointer-events-none"
        >
          <Send className="w-4 h-4 rotate-180" />
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="از دانادانا بپرس... (مثلاً: یک قصه بگو)"
          disabled={isLoading}
          id="tutor-chat-input"
          className="w-full text-right font-bold text-xs px-3.5 py-2.5 rounded-2xl border-2 border-black bg-white placeholder-slate-400 focus:outline-[#1A1A1A] shadow-inner"
        />
      </form>
    </div>
  );
}
