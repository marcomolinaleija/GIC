import React, { useState } from 'react';
import { PREBUILT_VOICES } from '../constants';
import { VoiceOption, View } from '../types';
import { textToSpeech } from '../services/geminiService';
import { decode, decodeAudioData } from '../services/audioUtils';

// Polyfill for webkitAudioContext
const AudioContext = window.AudioContext || (window as any).webkitAudioContext;

interface HeaderProps {
    selectedVoice: string;
    setSelectedVoice: (voiceId: string) => void;
    view: View;
    setView: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ selectedVoice, setSelectedVoice, view, setView }) => {
    const [isTesting, setIsTesting] = useState(false);

    const handleTestVoice = async () => {
        setIsTesting(true);
        try {
            const voice = PREBUILT_VOICES.find(v => v.id === selectedVoice);
            const textToSay = `Hola, soy ${voice?.name}. Esta es mi voz.`;
            const audioContent = await textToSpeech(textToSay, selectedVoice);
            if (audioContent) {
                const audioContext = new AudioContext({ sampleRate: 24000 });
                const audioBytes = decode(audioContent);
                const audioBuffer = await decodeAudioData(audioBytes, audioContext, 24000, 1);
                const source = audioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioContext.destination);
                source.start();
            }
        } catch (error) {
            console.error("Error al probar la voz:", error);
            alert("No se pudo probar la voz. Inténtalo de nuevo.");
        } finally {
            setIsTesting(false);
        }
    };
    
    const navButtonStyle = "px-4 py-2 rounded-lg font-semibold transition-colors duration-200";
    const activeNavButtonStyle = "bg-indigo-600 text-white";
    const inactiveNavButtonStyle = "bg-gray-700 hover:bg-gray-600 text-gray-200";

    return (
        <header className="py-4 px-4 sm:px-6 lg:px-8 bg-gray-900 border-b border-gray-700 sticky top-0 z-10">
            <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-extrabold text-white">Asistente Creativo</h1>
                
                <nav className="flex items-center gap-2 p-1 bg-gray-800 rounded-lg">
                    <button onClick={() => setView('creator')} className={`${navButtonStyle} ${view === 'creator' ? activeNavButtonStyle : inactiveNavButtonStyle}`}>
                        Crear Imagen
                    </button>
                    <button onClick={() => setView('editor')} className={`${navButtonStyle} ${view === 'editor' ? activeNavButtonStyle : inactiveNavButtonStyle}`}>
                        Editar Imagen
                    </button>
                    <button onClick={() => setView('faq')} className={`${navButtonStyle} ${view === 'faq' ? activeNavButtonStyle : inactiveNavButtonStyle}`}>
                        Ayuda y FAQ
                    </button>
                </nav>

                <div className="flex items-center gap-2">
                    <label htmlFor="voice-select" className="sr-only">Voz del Asistente:</label>
                    <select
                        id="voice-select"
                        value={selectedVoice}
                        onChange={(e) => setSelectedVoice(e.target.value)}
                        className="bg-gray-800 border border-gray-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-indigo-500"
                    >
                        {PREBUILT_VOICES.map((voice: VoiceOption) => (
                            <option key={voice.id} value={voice.id}>
                                {voice.name}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={handleTestVoice}
                        disabled={isTesting}
                        className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-wait"
                        aria-label="Probar la voz seleccionada"
                    >
                        {isTesting ? '...' : 'Probar'}
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;