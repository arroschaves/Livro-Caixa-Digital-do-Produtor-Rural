
import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { ChatMessage } from '../types';
import { sendMessageToChatStream } from '../services/geminiService';
import { ChatBubbleIcon, PaperAirplaneIcon, XMarkIcon } from './icons';

const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if(isOpen) {
             messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    const handleSendMessage = async (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
    
        const userMessage: ChatMessage = { id: `user-${Date.now()}`, role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
    
        const modelMessageId = `model-${Date.now()}`;
        setMessages(prev => [...prev, { id: modelMessageId, role: 'model', text: '' }]);
    
        try {
            const stream = sendMessageToChatStream(input);
            for await (const chunk of stream) {
                const chunkText = chunk.text;
                setMessages(prev =>
                    prev.map(msg =>
                        msg.id === modelMessageId ? { ...msg, text: msg.text + chunkText } : msg
                    )
                );
            }
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === modelMessageId ? { ...msg, text: "Desculpe, ocorreu um erro." } : msg
                )
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-transform transform hover:scale-110"
                aria-label="Toggle Chat"
            >
                {isOpen ? <XMarkIcon className="h-6 w-6" /> : <ChatBubbleIcon className="h-6 w-6" />}
            </button>

            {isOpen && (
                <div className="fixed bottom-24 right-6 w-full max-w-sm h-[60vh] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200 transition-all duration-300 ease-in-out">
                    <header className="bg-green-600 text-white p-4 rounded-t-2xl flex justify-between items-center">
                        <h3 className="font-bold text-lg">Assistente IA</h3>
                    </header>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-800'}`}>
                                    {msg.text || <span className="inline-block w-2 h-4 bg-gray-400 animate-pulse rounded-full"></span>}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                    <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 flex items-center bg-white rounded-b-2xl">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Pergunte algo..."
                            className="flex-1 border-gray-300 rounded-full py-2 px-4 focus:ring-green-500 focus:border-green-500"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="ml-3 bg-green-600 text-white p-2.5 rounded-full hover:bg-green-700 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            aria-label="Send Message"
                        >
                            <PaperAirplaneIcon className="h-5 w-5" />
                        </button>
                    </form>
                </div>
            )}
        </>
    );
};

export default Chatbot;
