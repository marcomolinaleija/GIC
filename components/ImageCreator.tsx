import React, { useState } from 'react';
import { generateImage, textToSpeech } from '../services/geminiService';
import { AspectRatio } from '../types';
import Spinner from './Spinner';
import { decode, decodeAudioData } from '../services/audioUtils';
import { DownloadIcon } from './Icons';

// Polyfill for webkitAudioContext
const AudioContext = window.AudioContext || (window as any).webkitAudioContext;

interface ImageCreatorProps {
    selectedVoice: string;
    generationCount: number;
    dailyLimit: number;
    onGenerationSuccess: () => void;
}

const ImageCreator: React.FC<ImageCreatorProps> = ({ selectedVoice, generationCount, dailyLimit, onGenerationSuccess }) => {
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);

    const isLimitReached = generationCount >= dailyLimit;

    const playAudio = async (text: string) => {
        try {
            const audioContent = await textToSpeech(text, selectedVoice);
            if (audioContent) {
                const audioContext = new AudioContext({ sampleRate: 24000 });
                const audioBytes = decode(audioContent);
                const audioBuffer = await decodeAudioData(audioBytes, audioContext, 24000, 1);
                const source = audioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioContext.destination);
                source.start();
            }
        } catch (audioError) {
            console.error("Error al reproducir audio:", audioError);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLimitReached) {
            setError('Has alcanzado el límite de 5 generaciones de imágenes por hoy.');
            return;
        }
        if (!prompt.trim()) {
            setError('Por favor, introduce una descripción para la imagen.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);

        try {
            await playAudio("Generando una imagen con la descripción proporcionada. Por favor, espera.");
            const imageUrl = await generateImage(prompt, aspectRatio);
            setGeneratedImage(imageUrl);
            onGenerationSuccess();
            await playAudio(`¡Imagen generada! Se ha creado una imagen basada en tu descripción.`);
        } catch (err) {
            const errorMessage = 'Hubo un error al generar la imagen. Por favor, intenta de nuevo.';
            setError(errorMessage);
            await playAudio(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = () => {
        if (generatedImage) {
            const link = document.createElement('a');
            link.href = generatedImage;
            link.download = `imagen-generada-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <section aria-labelledby="creator-title">
            <h2 id="creator-title" className="text-3xl font-bold mb-4 text-indigo-400">Crear Imagen</h2>
            <p className="mb-6 text-gray-300">
                Describe la imagen que quieres crear. Sé lo más detallado posible para obtener los mejores resultados.
            </p>
            <form onSubmit={handleSubmit} className="max-w-2xl">
                <div className="mb-4">
                    <label htmlFor="prompt-input" className="block text-lg font-medium text-gray-200 mb-2">
                        Descripción de la imagen:
                    </label>
                    <textarea
                        id="prompt-input"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ej: Un gato astronauta con un casco de cristal, flotando en el espacio profundo con nebulosas de colores de fondo."
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        rows={3}
                        disabled={isLoading || isLimitReached}
                    />
                </div>
                <div className="mb-6">
                    <label htmlFor="aspect-ratio-select" className="block text-lg font-medium text-gray-200 mb-2">
                        Proporción de aspecto:
                    </label>
                    <select
                        id="aspect-ratio-select"
                        value={aspectRatio}
                        onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                        className="bg-gray-800 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500"
                        disabled={isLoading || isLimitReached}
                    >
                        <option value="1:1">Cuadrado (1:1)</option>
                        <option value="16:9">Horizontal (16:9)</option>
                        <option value="9:16">Vertical (9:16)</option>
                        <option value="4:3">Paisaje (4:3)</option>
                        <option value="3:4">Retrato (3:4)</option>
                    </select>
                </div>
                <button
                    type="submit"
                    disabled={isLoading || !prompt.trim() || isLimitReached}
                    className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                >
                    {isLoading ? <span className="flex items-center"><Spinner /> <span className="ml-2">Generando...</span></span> : 'Generar Imagen'}
                </button>
                <div className="mt-2 text-sm text-gray-400">
                    {isLimitReached
                        ? 'Has alcanzado el límite diario de generaciones.'
                        : `Te quedan ${dailyLimit - generationCount} de ${dailyLimit} generaciones hoy.`}
                </div>
            </form>

            {error && (
                <div className="mt-6 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg max-w-2xl" role="alert">
                  {error}
                </div>
            )}

            {generatedImage && (
                <div className="mt-8 max-w-2xl">
                    <h3 className="text-2xl font-semibold mb-4">Imagen Generada:</h3>
                    <div className="relative group">
                        <img
                            src={generatedImage}
                            alt={prompt}
                            className="rounded-lg border-4 border-indigo-500"
                        />
                    </div>
                    <button
                        onClick={handleDownload}
                        className="mt-4 flex items-center gap-2 px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
                    >
                        <DownloadIcon />
                        Descargar Imagen
                    </button>
                </div>
            )}
        </section>
    );
};

export default ImageCreator;
