import React, { useState, useEffect, useRef } from 'react';
import { createLiveSession } from '../services/geminiService';
import { decode, encode, decodeAudioData } from '../services/audioUtils';
import { MicrophoneIcon, StopCircleIcon, PlayCircleIcon } from './Icons';
import { LiveServerMessage, LiveSession, Blob } from '@google/genai';

interface LiveConversationProps {
    selectedVoice: string;
}

type ConversationStatus = 'idle' | 'connecting' | 'active' | 'error' | 'ended';

const LiveConversation: React.FC<LiveConversationProps> = ({ selectedVoice }) => {
    const [status, setStatus] = useState<ConversationStatus>('idle');
    const [transcripts, setTranscripts] = useState<{ user: string, model: string }[]>([]);
    const [currentUserTranscript, setCurrentUserTranscript] = useState('');
    const [currentModelTranscript, setCurrentModelTranscript] = useState('');

    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const nextStartTimeRef = useRef(0);

    const startConversation = async () => {
        setStatus('connecting');
        
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error("El acceso al micrófono no es compatible con este navegador.");
            }
            mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            nextStartTimeRef.current = 0;
            
            sessionPromiseRef.current = createLiveSession({
                onopen: () => {
                    console.log('Live session opened.');
                    setStatus('active');
                    startStreamingMicrophone();
                },
                onmessage: handleLiveMessage,
                onerror: (e) => {
                    console.error('Live session error:', e);
                    setStatus('error');
                },
                onclose: () => {
                    console.log('Live session closed.');
                    // Don't set to 'ended' if an error occurred first
                    setStatus(prev => prev === 'error' ? 'error' : 'ended');
                    stopStreamingMicrophone();
                },
            }, selectedVoice);
        } catch (error) {
            console.error("Failed to start conversation:", error);
            setStatus('error');
        }
    };
    
    const stopConversation = async () => {
        if (sessionPromiseRef.current) {
            try {
                const session = await sessionPromiseRef.current;
                session.close();
            } catch (e) {
                console.error("Error closing session:", e);
            }
        }
        stopStreamingMicrophone();
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        setStatus('ended');
    };

    const startStreamingMicrophone = () => {
        if (!audioContextRef.current || !mediaStreamRef.current || scriptProcessorRef.current) return;
        
        mediaStreamSourceRef.current = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
        scriptProcessorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
        
        scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
            const l = inputData.length;
            const int16 = new Int16Array(l);
            for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
            }
            const pcmBlob: Blob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
            };
            if(sessionPromiseRef.current) {
                sessionPromiseRef.current.then((session) => {
                    session.sendRealtimeInput({ media: pcmBlob });
                });
            }
        };

        mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
        scriptProcessorRef.current.connect(audioContextRef.current.destination);
    };

    const stopStreamingMicrophone = () => {
        mediaStreamSourceRef.current?.disconnect();
        scriptProcessorRef.current?.disconnect();
        scriptProcessorRef.current = null;
        mediaStreamSourceRef.current = null;
    };
    
    const playOutputAudio = async (base64Audio: string) => {
        if (!outputAudioContextRef.current) return;
        const audioCtx = outputAudioContextRef.current;
        if (audioCtx.state === 'suspended') {
            await audioCtx.resume();
        }
        
        const decodedData = decode(base64Audio);
        const audioBuffer = await decodeAudioData(decodedData, audioCtx, 24000, 1);
        
        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioCtx.currentTime);

        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioCtx.destination);
        source.start(nextStartTimeRef.current);

        nextStartTimeRef.current += audioBuffer.duration;
    };
    
    const handleLiveMessage = (message: LiveServerMessage) => {
        if (message.serverContent?.outputTranscription) {
            setCurrentModelTranscript(prev => prev + message.serverContent.outputTranscription.text);
        }
        if (message.serverContent?.inputTranscription) {
            setCurrentUserTranscript(prev => prev + message.serverContent.inputTranscription.text);
        }
        if (message.serverContent?.turnComplete) {
            setTranscripts(prev => [...prev, { user: currentUserTranscript, model: currentModelTranscript }]);
            setCurrentUserTranscript('');
            setCurrentModelTranscript('');
        }
        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
        if (base64Audio) {
            playOutputAudio(base64Audio);
        }
    };
    
    useEffect(() => {
        return () => {
            // Cleanup on unmount
            if (status === 'active' || status === 'connecting') {
                stopConversation();
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    const getStatusMessage = () => {
        switch(status) {
            case 'idle': return 'Presiona Iniciar para comenzar la conversación.';
            case 'connecting': return 'Conectando...';
            case 'active': return 'Conversación activa. ¡Habla ahora!';
            case 'error': return 'Error de conexión. Por favor, intenta de nuevo.';
            case 'ended': return 'Conversación terminada.';
            default: return '';
        }
    }

    return (
        <section aria-labelledby="live-title">
            <h1 id="live-title" className="text-3xl font-bold mb-6 text-center">Conversación en Vivo con IA</h1>
            <div className="bg-gray-800 rounded-lg shadow-lg max-w-4xl mx-auto p-6">
                <div className="flex justify-center items-center space-x-4 mb-4">
                    <button
                        onClick={startConversation}
                        disabled={status === 'active' || status === 'connecting'}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full flex items-center space-x-2 disabled:opacity-50"
                        aria-label="Iniciar conversación"
                    >
                        <PlayCircleIcon /> <span>Iniciar</span>
                    </button>
                    <button
                        onClick={stopConversation}
                        disabled={status !== 'active' && status !== 'connecting'}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full flex items-center space-x-2 disabled:opacity-50"
                        aria-label="Detener conversación"
                    >
                        <StopCircleIcon /> <span>Detener</span>
                    </button>
                </div>
                <div className="text-center p-4 bg-gray-700 rounded-md mb-4">
                    <p className="flex items-center justify-center">
                        {status === 'active' && <span className="animate-pulse"><MicrophoneIcon /></span>} 
                        <span className="ml-2">{getStatusMessage()}</span>
                    </p>
                </div>
                <div className="h-[300px] overflow-y-auto p-4 bg-gray-900 rounded-md flex flex-col space-y-2">
                    {transcripts.map((t, i) => (
                        <div key={i}>
                            <p><strong className="text-blue-400">Tú:</strong> {t.user}</p>
                            <p><strong className="text-green-400">Asistente:</strong> {t.model}</p>
                        </div>
                    ))}
                    {currentUserTranscript && <p><strong className="text-blue-400">Tú:</strong> {currentUserTranscript}</p>}
                    {currentModelTranscript && <p><strong className="text-green-400">Asistente:</strong> {currentModelTranscript}</p>}
                </div>
            </div>
        </section>
    );
};

export default LiveConversation;
