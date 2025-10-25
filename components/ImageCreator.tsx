import React, { useState } from 'react';
import { generateImage } from '../services/geminiService';
import Spinner from './Spinner';
import { DownloadIcon } from './Icons';
import { AspectRatio } from '../types';

interface ImageCreatorProps {}

const aspectRatios: { value: AspectRatio, label: string }[] = [
    { value: '1:1', label: 'Cuadrado (1:1)' },
    { value: '16:9', label: 'Paisaje (16:9)' },
    { value: '9:16', label: 'Retrato (9:16)' },
    { value: '4:3', label: 'Estándar (4:3)' },
    { value: '3:4', label: 'Vertical (3:4)' },
];

const ImageCreator: React.FC<ImageCreatorProps> = () => {
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState<string>('');

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError("Por favor, escribe una descripción para la imagen.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);
        setStatusMessage("Generando tu imagen. Por favor, espera.");
        
        try {
            const imageUrl = await generateImage(prompt, aspectRatio);
            if (imageUrl) {
                setGeneratedImage(imageUrl);
                setStatusMessage("¡Tu imagen ha sido creada exitosamente!");
            } else {
                throw new Error("No se recibió ninguna imagen.");
            }
        } catch (err) {
            console.error(err);
            const errorMessage = "Lo siento, ha ocurrido un error al generar la imagen. Por favor, inténtalo de nuevo.";
            setError(errorMessage);
            setStatusMessage(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section aria-labelledby="creator-title">
            <h1 id="creator-title" className="text-2xl md:text-3xl font-bold mb-6 text-center">Creador de Imágenes con IA</h1>
            <div role="status" aria-live="polite" className="sr-only">
                {statusMessage}
            </div>
            <div className="bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <div className="mb-4">
                            <label htmlFor="prompt-input" className="block text-sm font-medium text-gray-300 mb-2">
                                Describe la imagen que quieres crear:
                            </label>
                            <textarea
                                id="prompt-input"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Ej: Un gato astronauta flotando en el espacio..."
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500"
                                rows={4}
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="aspect-ratio-select" className="block text-sm font-medium text-gray-300 mb-2">
                                Proporción de Aspecto:
                            </label>
                            <select
                                id="aspect-ratio-select"
                                value={aspectRatio}
                                onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500"
                            >
                                {aspectRatios.map(ratio => (
                                    <option key={ratio.value} value={ratio.value}>{ratio.label}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-opacity disabled:opacity-50"
                        >
                            {isLoading ? <><Spinner /> Generando...</> : 'Generar Imagen'}
                        </button>
                    </div>
                    <div className="flex items-center justify-center bg-gray-700 rounded-lg min-h-[300px] md:min-h-[400px]">
                        {isLoading && <Spinner />}
                        {error && <p className="text-red-500 text-center p-4">{error}</p>}
                        {generatedImage && (
                            <div className="relative group">
                                <img src={generatedImage} alt={prompt} className="rounded-lg max-w-full max-h-[400px]" />
                                <a
                                    href={generatedImage}
                                    download="generated-image.jpg"
                                    className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    aria-label="Descargar imagen"
                                >
                                    <DownloadIcon />
                                </a>
                            </div>
                        )}
                        {!isLoading && !generatedImage && !error && <p className="text-gray-400">La imagen aparecerá aquí.</p>}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ImageCreator;