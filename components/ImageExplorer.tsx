import React, { useState, useRef, useEffect } from 'react';
import { describeImage, askAboutImage } from '../services/geminiService';
import Spinner from './Spinner';
import { PaperAirplaneIcon } from './Icons';
import { UploadedImage, ChatMessage } from '../types';

const ImageExplorer: React.FC = () => {
    const [image, setImage] = useState<UploadedImage | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !file.type.startsWith('image/')) {
            setError('Por favor, selecciona un archivo de imagen válido.');
            return;
        }
        
        setError(null);
        setMessages([]);
        const reader = new FileReader();
        reader.onload = async (e) => {
            const dataUrl = e.target?.result as string;
            const uploadedImage = {
                dataUrl,
                mimeType: file.type,
                name: file.name,
            };
            setImage(uploadedImage);
            setIsLoading(true);
            setStatusMessage('Analizando tu imagen para la descripción inicial.');

            try {
                const description = await describeImage(dataUrl, file.type);
                const firstMessage: ChatMessage = {
                    role: 'model',
                    text: description || 'No se pudo generar una descripción.',
                };
                setMessages([firstMessage]);
                setStatusMessage('Imagen cargada y descrita. Ahora puedes hacer preguntas.');
            } catch (err) {
                console.error(err);
                const errorMessage = 'Ocurrió un error al describir la imagen.';
                setError(errorMessage);
                setStatusMessage(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleSend = async () => {
        if (!input.trim() || !image) return;
        const userMessage: ChatMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setStatusMessage(`Buscando respuesta a: ${input}`);

        try {
            const responseText = await askAboutImage(image.dataUrl, image.mimeType, input);
            const modelMessage: ChatMessage = { role: 'model', text: responseText || 'No pude encontrar una respuesta.' };
            setMessages(prev => [...prev, modelMessage]);
            setStatusMessage('Respuesta recibida.');
        } catch (error) {
            console.error('Error asking about image:', error);
            const errorMessage: ChatMessage = { role: 'model', text: 'Lo siento, he encontrado un problema. Por favor, inténtalo de nuevo.' };
            setMessages(prev => [...prev, errorMessage]);
            setStatusMessage('Error al obtener respuesta.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section aria-labelledby="explorer-title">
            <h1 id="explorer-title" className="text-3xl font-bold mb-6 text-center">Explorador Visual Interactivo</h1>
             <div role="status" aria-live="polite" className="sr-only">
                {statusMessage}
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Image Column */}
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-full h-80 bg-gray-700 rounded-lg flex items-center justify-center">
                            {image ? (
                                <img src={image.dataUrl} alt="Imagen subida por el usuario" className="max-w-full max-h-full object-contain rounded-lg" />
                            ) : (
                                <p className="text-gray-400">Sube una imagen para comenzar.</p>
                            )}
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center"
                        >
                            Subir Imagen
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>
                    {/* Chat Column */}
                    <div className="flex flex-col bg-gray-900 rounded-lg h-[50vh] md:h-auto">
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
                        <div className="p-4 border-t border-gray-700">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                                    placeholder={image ? "Haz una pregunta sobre la imagen..." : "Primero sube una imagen"}
                                    className="flex-grow bg-gray-700 border border-gray-600 rounded-full py-2 px-4 focus:ring-blue-500 focus:border-blue-500"
                                    disabled={isLoading || !image}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={isLoading || !input.trim() || !image}
                                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label="Enviar pregunta sobre la imagen"
                                >
                                    <PaperAirplaneIcon />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                {error && <p className="text-red-500 text-center mt-4">{error}</p>}
            </div>
        </section>
    );
};

export default ImageExplorer;
