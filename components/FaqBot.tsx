import React, { useState, useRef, useEffect } from 'react';
import { generateFaqResponse } from '../services/geminiService';
import { FAQ_SUGGESTIONS } from '../constants';
import { ChatMessage } from '../types';
import Spinner from './Spinner';
import { PaperAirplaneIcon, TrashIcon } from './Icons';

interface FaqBotProps {}

const FaqBot: React.FC<FaqBotProps> = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    // Cargar historial del localStorage al montar el componente
    useEffect(() => {
        try {
            const savedMessages = localStorage.getItem('faqHistory');
            if (savedMessages) {
                setMessages(JSON.parse(savedMessages));
            }
        } catch (error) {
            console.error("Fallo al cargar el historial de FAQ desde localStorage", error);
        }
    }, []);

    // Guardar historial en localStorage cuando cambie
    useEffect(() => {
        if (messages.length > 0) {
            try {
                localStorage.setItem('faqHistory', JSON.stringify(messages));
            } catch (error) {
                console.error("Fallo al guardar el historial de FAQ en localStorage", error);
            }
        } else {
             localStorage.removeItem('faqHistory');
        }
    }, [messages]);
    
    const handleClearConversation = () => {
        setMessages([]);
        // El useEffect se encargará de removerlo del localStorage
    };

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMessage: ChatMessage = { role: 'user', text: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const responseText = await generateFaqResponse(input, newMessages);
            const modelMessage: ChatMessage = { role: 'model', text: responseText };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error("Error with FaqBot:", error);
            const errorMessage: ChatMessage = { role: 'model', text: 'Lo siento, he encontrado un problema. Por favor, inténtalo de nuevo.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleFaqClick = (question: string) => {
        setInput(question);
    };

    return (
        <section aria-labelledby="faq-title">
            <h1 id="faq-title" className="text-2xl md:text-3xl font-bold mb-6 text-center">Asistente de Ayuda (FAQ)</h1>
            <div className="bg-gray-800 rounded-lg shadow-lg max-w-4xl mx-auto flex flex-col min-h-[70vh]">
                <div className="p-4 border-b border-gray-700">
                     <div className="flex justify-between items-center mb-3">
                        <h2 className="text-xl font-semibold">Preguntas Frecuentes</h2>
                        <button
                            onClick={handleClearConversation}
                            className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700"
                            aria-label="Limpiar historial de conversación"
                            title="Limpiar historial de conversación"
                        >
                            <TrashIcon />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {FAQ_SUGGESTIONS.map((item) => (
                            <button
                                key={item.question}
                                onClick={() => handleFaqClick(item.question)}
                                className="text-left text-sm text-blue-400 hover:underline p-2 rounded-md hover:bg-gray-700 transition"
                            >
                                {item.question}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex-grow overflow-y-auto p-4 flex flex-col space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-xl ${
                                msg.role === 'user' 
                                    ? 'bg-blue-600 text-white rounded-br-none' 
                                    : 'bg-gray-700 text-gray-200 rounded-bl-none'
                            }`}>
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex justify-start">
                            <div className="bg-gray-700 text-gray-200 rounded-xl rounded-bl-none px-4 py-2">
                                <Spinner />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <div className="p-4 border-t border-gray-700 mt-auto">
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                            placeholder="Haz una pregunta sobre la app..."
                            className="flex-grow bg-gray-700 border border-gray-600 rounded-full py-2 px-4 focus:ring-blue-500 focus:border-blue-500"
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleSend}
                            disabled={isLoading || !input.trim()}
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Enviar pregunta"
                        >
                            <PaperAirplaneIcon />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FaqBot;