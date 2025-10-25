import React, { useState, useRef, useCallback } from 'react';
import Header from './components/Header';
import ImageCreator from './components/ImageCreator';
import ImageEditor from './components/ImageEditor';
import FaqBot from './components/FaqBot';
import { View } from './types';
import { generateTextToSpeech } from './services/geminiService';
import { decode, decodeAudioData } from './services/audioUtils';

const App: React.FC = () => {
    const [view, setView] = useState<View>('creator');
    const [selectedVoice, setSelectedVoice] = useState<string>('Kore');
    const [isSpeaking, setIsSpeaking] = useState(false);

    const audioContextRef = useRef<AudioContext | null>(null);
    const audioQueueRef = useRef<string[]>([]);
    
    const playNextInQueue = useCallback(async () => {
        if (audioQueueRef.current.length === 0) {
            setIsSpeaking(false);
            return;
        }

        setIsSpeaking(true);
        const base64Audio = audioQueueRef.current.shift();
        
        if (!base64Audio) {
            playNextInQueue();
            return;
        }

        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            const audioCtx = audioContextRef.current;
            if (audioCtx.state === 'suspended') {
                await audioCtx.resume();
            }

            const decodedData = decode(base64Audio);
            const audioBuffer = await decodeAudioData(decodedData, audioCtx, 24000, 1);
            
            const source = audioCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioCtx.destination);
            source.onended = playNextInQueue;
            source.start();

        } catch (error) {
            console.error("Error playing audio:", error);
            playNextInQueue(); // Continue with the next item even if one fails
        }

    }, []);

    const speak = useCallback(async (text: string) => {
        try {
            const audioData = await generateTextToSpeech(text, selectedVoice);
            if (audioData) {
                audioQueueRef.current.push(audioData);
                if (!isSpeaking) {
                    playNextInQueue();
                }
            }
        } catch (error) {
            console.error("Error in speak function:", error);
        }
    }, [selectedVoice, isSpeaking, playNextInQueue]);

    return (
        <div className="bg-gray-900 text-white min-h-screen font-sans">
            <Header
                currentView={view}
                onNavigate={setView}
                selectedVoice={selectedVoice}
                onVoiceChange={setSelectedVoice}
                speak={speak}
                isSpeaking={isSpeaking}
            />
            <main className="container mx-auto p-4 md:p-8">
                {view === 'creator' && <ImageCreator speak={speak} />}
                {view === 'editor' && <ImageEditor speak={speak} />}
                {view === 'faq' && <FaqBot />}
            </main>
        </div>
    );
};

export default App;
