import React from 'react';
import { View, VoiceOption } from '../types';
import { PREBUILT_VOICES } from '../constants';
import { PlayCircleIcon } from './Icons';

interface HeaderProps {
    currentView: View;
    onNavigate: (view: View) => void;
    selectedVoice: string;
    onVoiceChange: (voice: string) => void;
    speak: (text: string) => void;
    isSpeaking: boolean;
}

const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, selectedVoice, onVoiceChange, speak, isSpeaking }) => {
    
    const navLinkClasses = (view: View) => 
        `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            currentView === view 
            ? 'bg-gray-700 text-white' 
            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
        }`;

    const handleTestVoice = () => {
        speak("Hola, esta es una prueba de mi voz.");
    }

    return (
        <header className="bg-gray-800 shadow-md">
            <nav className="container mx-auto px-4 md:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-2 sm:space-x-4">
                    <button onClick={() => onNavigate('creator')} className={navLinkClasses('creator')}>
                        Crear
                    </button>
                    <button onClick={() => onNavigate('editor')} className={navLinkClasses('editor')}>
                        Editar
                    </button>
                    <button onClick={() => onNavigate('faq')} className={navLinkClasses('faq')}>
                        Ayuda
                    </button>
                </div>
                <div className="flex items-center space-x-2">
                    <label htmlFor="voice-select" className="sr-only">Seleccionar Voz</label>
                    <select
                        id="voice-select"
                        value={selectedVoice}
                        onChange={(e) => onVoiceChange(e.target.value)}
                        className="bg-gray-700 border border-gray-600 rounded-md py-1 px-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                        {PREBUILT_VOICES.map((voice: VoiceOption) => (
                            <option key={voice.name} value={voice.name}>
                                {voice.label}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={handleTestVoice}
                        disabled={isSpeaking}
                        className="p-1.5 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50"
                        aria-label="Probar voz seleccionada"
                    >
                        <PlayCircleIcon />
                    </button>
                </div>
            </nav>
        </header>
    );
};

export default Header;
