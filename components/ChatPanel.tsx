
import React, { useRef, useEffect, useState } from 'react';
import type { ChatMessage, Status } from '../types.ts';

interface ChatPanelProps {
    messages: ChatMessage[];
    inputValue: string;
    onInputChange: (val: string) => void;
    onSendMessage: (text: string) => void;
    onSendTyping: () => void;
    onClearChat: () => void;
    disabled?: boolean;
    isTranslationEnabled: boolean;
    onToggleTranslation: () => void;
    onRequestIcebreaker: () => void;
    isRemoteTyping: boolean;
    status: Status;
}

const MAX_MSG_LENGTH = 500;

const ChatPanel: React.FC<ChatPanelProps> = ({ 
    messages, 
    inputValue,
    onInputChange,
    onSendMessage, 
    onSendTyping,
    onClearChat, 
    isTranslationEnabled, 
    onToggleTranslation,
    onRequestIcebreaker,
    isRemoteTyping,
    status
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isIcebreakerLoading, setIsIcebreakerLoading] = useState(false);

    const isConnectionActive = ['waiting', 'pairing', 'connected', 'getting-media', 'connecting-ws'].includes(status);
    const isChatConnected = status === 'connected';
    
    const isInputEnabled = isConnectionActive;
    const isIcebreakerEnabled = isConnectionActive && !isIcebreakerLoading;
    const isSendEnabled = isConnectionActive && inputValue.trim().length > 0 && inputValue.length <= MAX_MSG_LENGTH;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages, isRemoteTyping]);

    const handleIcebreaker = () => {
        setIsIcebreakerLoading(true);
        onRequestIcebreaker();
        // Reset loading after 2s or when input changes (filled by server)
        setTimeout(() => setIsIcebreakerLoading(false), 2000);
    };

    const handleClearChat = () => {
        if (window.confirm('Clear all messages in this session?')) {
            onClearChat();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;
        onSendMessage(inputValue.trim());
        onInputChange('');
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onInputChange(e.target.value);
        if (isChatConnected) {
            onSendTyping();
        }
    };

    return (
        <div className="flex flex-col flex-1 min-h-0 bg-neutral-900 overflow-hidden">
             <header className="flex justify-between items-center px-4 py-3 border-b border-white/5 bg-white/[0.02] backdrop-blur-sm shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse"></div>
                    <h2 className="text-sm font-bold tracking-widest uppercase text-gray-300">Chat Room</h2>
                </div>
                <div className="flex items-center gap-3">
                     <button 
                        onClick={onToggleTranslation} 
                        className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-black uppercase transition-all border ${isTranslationEnabled ? 'bg-brand-blue/10 border-brand-blue/30 text-brand-blue' : 'bg-white/5 border-white/10 text-gray-500'}`}
                        title="Auto-translate incoming messages using Gemini AI"
                    >
                        AI Translation
                    </button>
                    <button onClick={handleClearChat} disabled={messages.length === 0} className="text-gray-500 hover:text-white disabled:opacity-20 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
            </header>

            <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-white/10">
                {messages.length === 0 && !isRemoteTyping && (
                    <div className="h-full flex flex-col items-center justify-center opacity-30 text-center px-6">
                        <div className="mb-4">💬</div>
                        <p className="text-xs uppercase tracking-widest font-bold">Encrypted DataChannel</p>
                        <p className="text-[10px] mt-1 text-gray-500">Messages are peer-to-peer and not stored.</p>
                    </div>
                )}
                
                <div className="space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex w-full ${msg.sender === 'local' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] group`}>
                                <div className={`px-4 py-2.5 rounded-2xl shadow-sm ${msg.sender === 'local' ? 'bg-brand-blue text-white rounded-tr-none' : 'bg-neutral-800 text-gray-200 rounded-tl-none'}`}>
                                    <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{msg.text}</p>
                                    {msg.translatedText && msg.translatedText !== msg.text && (
                                        <div className="mt-2 pt-2 border-t border-white/10">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <div className="px-1.5 py-0.5 rounded-sm bg-brand-pink/20 text-brand-pink text-[8px] font-black uppercase">Gemini AI</div>
                                            </div>
                                            <p className="text-xs text-gray-300 italic">{msg.translatedText}</p>
                                        </div>
                                    )}
                                </div>
                                <div className={`mt-1 flex items-center gap-2 ${msg.sender === 'local' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.sender === 'local' && (
                                        <span className={`text-[9px] font-bold uppercase tracking-wider ${msg.status === 'sent' ? 'text-green-500' : 'text-yellow-500 animate-pulse'}`}>
                                            {msg.status === 'sent' ? 'Delivered' : 'Queued'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {isRemoteTyping && (
                         <div className="flex justify-start items-center gap-2">
                            <div className="bg-neutral-800 px-4 py-2 rounded-full flex gap-1 items-center">
                                <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            
            <div className="p-4 border-t border-white/5 bg-white/[0.01]">
                <form onSubmit={handleSubmit} className="flex gap-2 items-center">
                     <button
                        type="button"
                        onClick={handleIcebreaker}
                        disabled={!isIcebreakerEnabled}
                        title="Get an AI Icebreaker"
                        className={`p-2.5 rounded-xl border border-white/10 transition-all ${isIcebreakerLoading ? 'animate-spin' : 'hover:bg-brand-pink/10 hover:border-brand-pink/30 hover:text-brand-pink text-gray-400'}`}
                    >
                        {isIcebreakerLoading ? (
                            <svg className="h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        )}
                    </button>
                    
                    <div className="flex-1 relative group">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={handleChange}
                            placeholder={!isChatConnected ? "Message will send on connect..." : "Type message..."}
                            disabled={!isInputEnabled}
                            className="w-full bg-neutral-800/50 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-1 focus:ring-brand-blue focus:border-brand-blue/50 focus:outline-none transition-all disabled:opacity-40"
                            autoComplete="off"
                        />
                        <div className={`absolute -top-6 right-0 text-[9px] font-bold tracking-tighter ${inputValue.length > MAX_MSG_LENGTH ? 'text-red-500' : 'text-gray-600 group-focus-within:text-brand-blue/50'}`}>
                            {inputValue.length}/{MAX_MSG_LENGTH}
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={!isSendEnabled} 
                        className="p-2.5 bg-brand-blue text-white rounded-xl hover:scale-105 active:scale-95 disabled:opacity-20 disabled:grayscale transition-all shadow-lg shadow-brand-blue/10"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatPanel;
