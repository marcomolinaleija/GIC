import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob as GenAiBlob } from '@google/genai';
import { decode, decodeAudioData, encode } from '../services/audioUtils';
import { MicrophoneIcon, StopCircleIcon, PlayCircleIcon } from './Icons';

// Polyfill for webkitAudioContext
const AudioContext = window.AudioContext || (window as any).webkitAudioContext;

interface LiveConversationProps {
    selectedVoice: string;
}

const LiveConversation: React.FC<LiveConversationProps> = ({ selectedVoice }) => {
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [transcriptionHistory, setTranscriptionHistory] = useState<string[]>([]);
    const [currentLiveInput, setCurrentLiveInput] = useState('');
    const [currentLiveOutput, setCurrentLiveOutput] = useState('');
    const [status, setStatus] = useState<'idle' | 'connecting' | 'active' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);
    
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const currentInputRef = useRef('');
    const currentOutputRef = useRef('');

    const nextStartTime = useRef(0);
    const audioSources = useRef(new Set<AudioBufferSourceNode>());

    const stopAudioPlayback = useCallback(() => {
        if (outputAudioContextRef.current) {
            audioSources.current.forEach(source => source.stop());
            audioSources.current.clear();
            nextStartTime.current = 0;
        }
    }, []);

    const cleanup = useCallback(() => {
        stopAudioPlayback();

        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current.onaudioprocess = null;
            scriptProcessorRef.current = null;
        }
        if (mediaStreamSourceRef.current) {
            mediaStreamSourceRef.current.disconnect();
            mediaStreamSourceRef.current = null;
        }
        if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
            inputAudioContextRef.current.close().catch(console.error);
            inputAudioContextRef.current = null;
        }
        if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
            outputAudioContextRef.current.close().catch(console.error);
            outputAudioContextRef.current = null;
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        
        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => session.close());
            sessionPromiseRef.current = null;
        }

        setIsSessionActive(false);
        setStatus('idle');
    }, [stopAudioPlayback]);
    
    useEffect(() => {
        return () => cleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const startSession = async () => {
        setTranscriptionHistory([]);
        setCurrentLiveInput('');
        setCurrentLiveOutput('');
        currentInputRef.current = '';
        currentOutputRef.current = '';
        setError(null);
        setStatus('connecting');

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            
            inputAudioContextRef.current = new AudioContext({ sampleRate: 16000 });
            outputAudioContextRef.current = new AudioContext({ sampleRate: 24000 });

            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setStatus('active');
                        setIsSessionActive(true);
                        
                        const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
                        mediaStreamSourceRef.current = source;
                        const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current = scriptProcessor;

                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            sessionPromiseRef.current?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContextRef.current!.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                        if (base64Audio && outputAudioContextRef.current) {
                            const ctx = outputAudioContextRef.current;
                            nextStartTime.current = Math.max(nextStartTime.current, ctx.currentTime);
                            const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
                            const source = ctx.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(ctx.destination);
                            source.addEventListener('ended', () => audioSources.current.delete(source));
                            source.start(nextStartTime.current);
                            nextStartTime.current += audioBuffer.duration;
                            audioSources.current.add(source);
                        }

                        if(message.serverContent?.interrupted){
                            stopAudioPlayback();
                        }

                        if (message.serverContent?.inputTranscription) {
                            const text = message.serverContent.inputTranscription.text;
                            currentInputRef.current += text;
                            setCurrentLiveInput(currentInputRef.current);
                        }
                        if (message.serverContent?.outputTranscription) {
                            const text = message.serverContent.outputTranscription.text;
                            currentOutputRef.current += text;
                            setCurrentLiveOutput(currentOutputRef.current);
                        }
                
                        if (message.serverContent?.turnComplete) {
                            const fullInput = currentInputRef.current.trim();
                            const fullOutput = currentOutputRef.current.trim();
                            
                            setTranscriptionHistory(prev => {
                                const newHistory = [...prev];
                                if (fullInput) newHistory.push(`Tú: ${fullInput}`);
                                if (fullOutput) newHistory.push(`Asistente: ${fullOutput}`);
                                return newHistory;
                            });
                            
                            currentInputRef.current = '';
                            currentOutputRef.current = '';
                            setCurrentLiveInput('');
                            setCurrentLiveOutput('');
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Error de sesión:', e);
                        setError('Se produjo un error en la conexión. Inténtalo de nuevo.');
                        cleanup();
                    },
                    onclose: (e: CloseEvent) => {
                        cleanup();
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    // Use the selected voice from props
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedVoice } } },
                    systemInstruction: 'Eres un asistente creativo y útil. Ayuda al usuario a generar ideas para imágenes o a describirlas. Sé amigable y conversador.',
                },
            });
        } catch (err) {
            console.error('Error al iniciar la sesión:', err);
            setError('No se pudo acceder al micrófono. Por favor, comprueba los permisos.');
            setStatus('error');
        }
    };

    const createBlob = (data: Float32Array): GenAiBlob => {
        const l = data.length;
        const int16 = new Int16Array(l);
        for (let i = 0; i < l; i++) {
            int16[i] = data[i] * 32768;
        }
        return {
            data: encode(new Uint8Array(int16.buffer)),
            mimeType: 'audio/pcm;rate=16000',
        };
    };

    return (
        <section aria-labelledby="live-title">
            <h2 id="live-title" className="text-3xl font-bold mb-4 text-indigo-400">Conversación por Voz</h2>
            <p className="mb-6 text-gray-300">
                Habla directamente con el asistente para crear o describir imágenes. Pulsa "Iniciar" y empieza a hablar.
            </p>
            <div className="flex justify-center gap-4 mb-6">
                {!isSessionActive ? (
                    <button
                        onClick={startSession}
                        disabled={status === 'connecting'}
                        className="flex items-center gap-3 px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-green-500 disabled:bg-green-400 disabled:cursor-wait"
                    >
                       <PlayCircleIcon />
                        {status === 'connecting' ? 'Iniciando...' : 'Iniciar Conversación'}
                    </button>
                ) : (
                    <button
                        onClick={cleanup}
                        className="flex items-center gap-3 px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-red-500"
                    >
                        <StopCircleIcon/>
                        Detener Conversación
                    </button>
                )}
            </div>

            {error && (
                <div className="my-4 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg" role="alert">
                  {error}
                </div>
            )}
            
            <div
              className="mt-6 p-4 bg-gray-800 border border-gray-700 rounded-lg min-h-[200px]"
              aria-live="polite"
              aria-atomic="false"
              aria-relevant="additions"
            >
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><MicrophoneIcon /> Transcripción en vivo</h3>
              <div className="space-y-2">
                {transcriptionHistory.length === 0 && !currentLiveInput && !currentLiveOutput && status === 'active' && <p className="text-gray-400">Escuchando...</p>}
                {transcriptionHistory.length === 0 && status === 'idle' && <p className="text-gray-400">La transcripción aparecerá aquí cuando inicies la conversación.</p>}
                {transcriptionHistory.map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
                {currentLiveInput && <p className="text-gray-400">Tú: {currentLiveInput}</p>}
                {currentLiveOutput && <p>Asistente: {currentLiveOutput}</p>}
              </div>
            </div>
        </section>
    );
};

export default LiveConversation;
