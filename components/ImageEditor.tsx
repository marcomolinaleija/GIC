import React, { useState, useRef } from 'react';
import { editImage, describeImage } from '../services/geminiService';
import Spinner from './Spinner';
import { DownloadIcon, CloseIcon } from './Icons';
import { UploadedImage } from '../types';

interface ImageEditorProps {
    speak: (text: string) => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ speak }) => {
    const [prompt, setPrompt] = useState('');
    const [originalImages, setOriginalImages] = useState<UploadedImage[]>([]);
    const [editedImage, setEditedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDescribing, setIsDescribing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [description, setDescription] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        setError(null);
        setEditedImage(null);

        const filesArray = Array.from(files);

        // FIX: Explicitly type 'file' as 'File' to prevent TypeScript from inferring it as 'unknown'.
        const imageFiles = filesArray.filter((file: File) => {
            if (!file.type.startsWith('image/')) {
                const newError = `${file.name} no es un archivo de imagen válido.`;
                setError(prev => prev ? `${prev}\n${newError}`: newError);
                return false;
            }
            return true;
        });

        if (imageFiles.length === 0) return;
        
        let processedCount = 0;
        const currentImages = [...originalImages];

        imageFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUrl = e.target?.result as string;
                currentImages.push({
                    dataUrl,
                    mimeType: file.type,
                    name: file.name,
                });
                processedCount++;
                if (processedCount === imageFiles.length) {
                    setOriginalImages(currentImages);
                    if (currentImages.length === 1) {
                        describeSingleImage(currentImages[0]);
                    } else {
                        setDescription(null);
                    }
                }
            };
            reader.readAsDataURL(file);
        });
        
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const describeSingleImage = async (image: UploadedImage) => {
        setDescription(null);
        setIsDescribing(true);
        speak("Analizando la imagen subida.");
        try {
            const descriptionResult = await describeImage(image.dataUrl, image.mimeType);
            if (descriptionResult) {
                setDescription(descriptionResult);
                speak("Descripción de la imagen lista.");
            } else {
                const descError = "No se pudo obtener una descripción para la imagen.";
                setDescription(descError);
                speak(descError);
            }
        } catch (err) {
            console.error("Error describing image:", err);
            const descError = "Ocurrió un error al analizar la imagen.";
            setDescription(descError);
            speak(descError);
        } finally {
            setIsDescribing(false);
        }
    };
    
    const handleRemoveImage = (indexToRemove: number) => {
        const newImages = originalImages.filter((_, index) => index !== indexToRemove);
        setOriginalImages(newImages);
        if (newImages.length === 1) {
            describeSingleImage(newImages[0]);
        } else {
            setDescription(null);
        }
    };

    const handleEdit = async () => {
        if (originalImages.length === 0) {
            setError("Por favor, primero sube una o más imágenes.");
            return;
        }
        if (!prompt.trim()) {
            setError("Por favor, escribe las instrucciones para editar la imagen.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setEditedImage(null);
        speak("Aplicando tus cambios a las imágenes.");
        try {
            const imagesToProcess = originalImages.map(img => ({
                imageData: img.dataUrl,
                mimeType: img.mimeType,
            }));
            const imageUrl = await editImage(prompt, imagesToProcess);
            if (imageUrl) {
                setEditedImage(imageUrl);
                speak("¡Tu imagen ha sido editada exitosamente!");
            } else {
                throw new Error("No se recibió ninguna imagen editada.");
            }
        } catch (err) {
            console.error(err);
            const errorMessage = "Lo siento, ha ocurrido un error al editar la imagen. Por favor, inténtalo de nuevo.";
            setError(errorMessage);
            speak(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <section aria-labelledby="editor-title">
            <h1 id="editor-title" className="text-3xl font-bold mb-6 text-center">Editor de Imágenes con IA</h1>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Input Column */}
                    <div className="flex flex-col space-y-4">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isDescribing || isLoading}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-opacity disabled:opacity-50"
                        >
                            {isDescribing ? <><Spinner/> Analizando...</> : '1. Subir Imagen(es)'}
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                            multiple
                        />
                        {originalImages.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-gray-700 rounded-lg p-2">
                                {originalImages.map((image, index) => (
                                    <div key={`${image.name}-${index}`} className="relative group">
                                        <img src={image.dataUrl} alt={`Original ${index + 1}: ${image.name}`} className="rounded-md w-full h-24 object-cover" />
                                        <button
                                            onClick={() => handleRemoveImage(index)}
                                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 opacity-75 group-hover:opacity-100 transition-opacity"
                                            aria-label={`Quitar imagen ${index + 1}`}
                                        >
                                            <CloseIcon />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center bg-gray-700 rounded-lg min-h-[150px] p-2">
                                <p className="text-gray-400 text-center">Las imágenes que subas aparecerán aquí.</p>
                            </div>
                        )}
                        {isDescribing && <div className="flex items-center justify-center p-3 rounded-md text-gray-300"><Spinner /><span className="ml-2">Analizando...</span></div>}
                        {description && originalImages.length === 1 && (
                            <div className="bg-gray-900 p-3 rounded-md">
                                <p className="text-sm text-gray-300">
                                    <strong className="font-semibold text-white block mb-1">Descripción de la Imagen:</strong>
                                    {description}
                                </p>
                            </div>
                        )}
                         <label htmlFor="edit-prompt" className="block text-sm font-medium text-gray-300">
                            2. Describe la edición que quieres hacer:
                        </label>
                        <textarea
                            id="edit-prompt"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Ej: Pon a la persona de la primera imagen en el paisaje de la segunda..."
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500"
                            rows={3}
                            disabled={originalImages.length === 0 || isLoading || isDescribing}
                        />
                        <button
                            onClick={handleEdit}
                            disabled={isLoading || originalImages.length === 0 || isDescribing}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-opacity disabled:opacity-50"
                        >
                            {isLoading ? <><Spinner /> Editando...</> : '3. Editar Imagen'}
                        </button>
                    </div>
                    {/* Output Column */}
                    <div className="flex items-center justify-center bg-gray-700 rounded-lg min-h-[300px]">
                        {isLoading && <Spinner />}
                        {error && <p className="text-red-500 text-center p-4 whitespace-pre-line">{error}</p>}
                        {editedImage && (
                            <div className="relative group">
                                <img src={editedImage} alt={`Editado: ${prompt}`} className="rounded-lg max-w-full max-h-[400px]" />
                                 <a
                                    href={editedImage}
                                    download="edited-image.png"
                                    className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    aria-label="Descargar imagen editada"
                                >
                                    <DownloadIcon />
                                </a>
                            </div>
                        )}
                        {!isLoading && !editedImage && !error && <p className="text-gray-400">La imagen editada aparecerá aquí.</p>}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ImageEditor;