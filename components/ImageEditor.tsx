import React, { useState, useRef } from 'react';
import { analyzeImage, editImage, textToSpeech } from '../services/geminiService';
import Spinner from './Spinner';
import { decode, decodeAudioData } from '../services/audioUtils';
import { DownloadIcon } from './Icons';

// Polyfill for webkitAudioContext
const AudioContext = window.AudioContext || (window as any).webkitAudioContext;

interface ImageEditorProps {
    selectedVoice: string;
    generationCount: number;
    dailyLimit: number;
    onGenerationSuccess: () => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ selectedVoice, generationCount, dailyLimit, onGenerationSuccess }) => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [editedImage, setEditedImage] = useState<string | null>(null);
    const [imageDescription, setImageDescription] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            setEditedImage(null);
            setError(null);
            setPrompt('');
            setImageDescription(null);
            
            setIsLoading(true);
            setLoadingMessage('Analizando imagen...');
            await playAudio('Imagen cargada. Analizando contenido, por favor espera.');

            try {
                const description = await analyzeImage(selectedFile);
                setImageDescription(description);
                await playAudio(`Análisis completado. Ahora puedes leer la descripción y escribir tus instrucciones de edición.`);
            } catch (err) {
                const errorMessage = 'No se pudo analizar la imagen.';
                setError(errorMessage);
                await playAudio(errorMessage);
            } finally {
                setIsLoading(false);
                setLoadingMessage('');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLimitReached) {
            setError('Has alcanzado el límite de 5 generaciones de imágenes por hoy.');
            return;
        }
        if (!file || !prompt.trim()) {
            setError('Por favor, sube una imagen y escribe una instrucción de edición.');
            return;
        }
        setIsLoading(true);
        setLoadingMessage('Editando imagen...');
        setError(null);
        setEditedImage(null);

        try {
            await playAudio("Aplicando los cambios solicitados. Esto podría tardar un momento.");
            const imageUrl = await editImage(prompt, file);
            setEditedImage(imageUrl);
            onGenerationSuccess();
            await playAudio(`¡Edición completada! La imagen ha sido modificada.`);
        } catch (err) {
            const errorMessage = 'Hubo un error al editar la imagen. Por favor, intenta de nuevo.';
            setError(errorMessage);
            await playAudio(errorMessage);
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };

    const handleDownload = () => {
        if (editedImage) {
            const link = document.createElement('a');
            link.href = editedImage;
            link.download = `imagen-editada-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };


    return (
        <section aria-labelledby="editor-title">
            <h2 id="editor-title" className="text-3xl font-bold mb-4 text-indigo-400">Editar Imagen</h2>
            <p className="mb-6 text-gray-300">
                Sube una imagen, lee su descripción y luego dile al asistente cómo quieres modificarla.
            </p>

            <div className="mb-6">
                <label htmlFor="file-upload" className="block text-lg font-medium text-gray-200 mb-2">
                    1. Sube tu imagen:
                </label>
                <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isLoading}
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                    Seleccionar Archivo
                </button>
                {file && <span className="ml-4 text-gray-300">{file.name}</span>}
            </div>

            {preview && (
                <div className="grid md:grid-cols-2 gap-8 mb-6">
                    <div>
                        <h3 className="text-xl font-semibold mb-2">Imagen Original:</h3>
                        <img 
                            src={preview} 
                            alt="Previsualización de la imagen a editar" 
                            className="rounded-lg border-4 border-gray-600"
                            aria-describedby="image-description"
                        />
                         {imageDescription && !isLoading && (
                            <div className="mt-4">
                                <h4 className="text-lg font-semibold mb-2 text-gray-200">Descripción de la imagen:</h4>
                                <p id="image-description" className="bg-gray-800 p-3 rounded-lg border border-gray-700 text-gray-300">
                                    {imageDescription}
                                </p>
                            </div>
                        )}
                    </div>
                    {editedImage && (
                        <div>
                            <h3 className="text-xl font-semibold mb-2">Imagen Editada:</h3>
                            <img src={editedImage} alt={`Resultado de la edición: ${prompt}`} className="rounded-lg border-4 border-indigo-500" />
                             <button
                                onClick={handleDownload}
                                className="mt-4 flex items-center gap-2 px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
                            >
                                <DownloadIcon />
                                Descargar Imagen Editada
                            </button>
                        </div>
                    )}
                </div>
            )}
            
            {file && !editedImage && (
                <form onSubmit={handleSubmit} className="max-w-2xl">
                    <div className="mb-4">
                        <label htmlFor="edit-prompt-input" className="block text-lg font-medium text-gray-200 mb-2">
                            2. Describe los cambios:
                        </label>
                        <textarea
                            id="edit-prompt-input"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Ej: Añade un sombrero de pirata al perro."
                            className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500"
                            rows={3}
                            disabled={isLoading || isLimitReached}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading || !prompt.trim() || isLimitReached}
                        className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                    >
                        {isLoading && loadingMessage === 'Editando imagen...' ? <span className="flex items-center"><Spinner /> <span className="ml-2">{loadingMessage}</span></span> : 'Editar Imagen'}
                    </button>
                    <div className="mt-2 text-sm text-gray-400">
                        {isLimitReached
                            ? 'Has alcanzado el límite diario de generaciones.'
                            : `Te quedan ${dailyLimit - generationCount} de ${dailyLimit} generaciones hoy.`}
                    </div>
                </form>
            )}

            {isLoading && (
                 <div className="mt-6 flex items-center gap-2"><Spinner /> <span className="ml-2">{loadingMessage || 'Procesando...'}</span></div>
            )}

            {error && (
                <div className="mt-6 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg max-w-2xl" role="alert">
                  {error}
                </div>
            )}
        </section>
    );
};

export default ImageEditor;