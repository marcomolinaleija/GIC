
import React, { useState, useRef, useEffect } from 'react';
import { FAQ_DATA } from '../constants';
import { ChatMessage } from '../types';
import { generateChatResponse } from '../services/geminiService';
import Spinner from './Spinner';
import { PaperAirplaneIcon } from './Icons';

const FaqBot: React.FC = () => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = userInput.trim();
    if (!trimmedInput || isLoading) return;

    const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', text: trimmedInput }];
    setChatHistory(newHistory);
    setUserInput('');
    setIsLoading(true);

    try {
      const modelResponse = await generateChatResponse(trimmedInput);
      setChatHistory([...newHistory, { role: 'model', text: modelResponse }]);
    } catch (error) {
      setChatHistory([...newHistory, { role: 'model', text: 'Lo siento, no puedo responder en este momento. Por favor, intenta de nuevo.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-12">
      <section aria-labelledby="faq-title">
        <h2 id="faq-title" className="text-3xl font-bold mb-4 text-indigo-400">Preguntas Frecuentes</h2>
        <div className="space-y-4">
          {FAQ_DATA.map((item, index) => (
            <details key={index} className="bg-gray-800 rounded-lg p-4 group">
              <summary className="font-semibold cursor-pointer list-none flex justify-between items-center">
                {item.question}
                <span className="transform transition-transform duration-200 group-open:rotate-180">▼</span>
              </summary>
              <p className="mt-2 text-gray-300">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section aria-labelledby="chatbot-title" className="flex flex-col">
        <h2 id="chatbot-title" className="text-3xl font-bold mb-4 text-indigo-400">Bot de Ayuda</h2>
        <p className="mb-4 text-gray-300">¿Tienes otra pregunta? Escríbela aquí. Este chat es solo de texto.</p>
        <div className="flex-grow flex flex-col bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          <div ref={chatContainerRef} className="flex-grow p-4 space-y-4 overflow-y-auto">
            {chatHistory.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-xl ${
                    msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-200'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                  <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-xl bg-gray-700 text-gray-200 flex items-center">
                      <Spinner/> <span className="ml-2">Pensando...</span>
                  </div>
              </div>
            )}
          </div>
          <form onSubmit={handleSubmit} className="p-4 bg-gray-900 border-t border-gray-700">
            <div className="flex items-center gap-2">
              <label htmlFor="chat-input" className="sr-only">Escribe tu pregunta</label>
              <input
                id="chat-input"
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Escribe tu pregunta..."
                className="flex-grow bg-gray-700 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !userInput.trim()}
                className="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                aria-label="Enviar mensaje"
              >
                <PaperAirplaneIcon />
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default FaqBot;
