import React, { useState } from 'react';

interface ApiKeyPromptProps {
    onApiKeySelected: () => void;
}

const ApiKeyPrompt: React.FC<ApiKeyPromptProps> = ({ onApiKeySelected }) => {
    const [error, setError] = useState<string | null>(null);

    const handleSelectKey = async () => {
        try {
            if ((window as any).aistudio && typeof (window as any).aistudio.openSelectKey === 'function') {
                await (window as any).aistudio.openSelectKey();
                // Assume success and let App.tsx re-check.
                // Race condition mitigation: we assume the key is selected.
                onApiKeySelected();
            } else {
                setError("La función para seleccionar la clave de API no está disponible. Asegúrate de que estás en el entorno correcto.");
            }
        } catch (e) {
            console.error("Error al abrir el selector de clave de API:", e);
            setError("Ocurrió un error al intentar seleccionar la clave de API.");
        }
    };
    
    const handleUseEnvVar = () => {
        // This is a fallback for local dev where window.aistudio might not exist
        // but an env var is set.
        if (process.env.API_KEY) {
            onApiKeySelected();
        } else {
            setError("No se encontró la clave de API en las variables de entorno.");
        }
    };
    
    // Show a streamlined UI if window.aistudio is not available (local dev)
    if (typeof (window as any).aistudio === 'undefined') {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-4">
                <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-md text-center">
                    <h1 className="text-2xl font-bold mb-4">Clave de API Requerida</h1>
                    <p className="mb-6 text-gray-400">
                        Para desarrollo local, por favor asegúrate que tu clave de API está configurada en un archivo .env.
                    </p>
                     <button
                        onClick={handleUseEnvVar}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                    >
                        Continuar con la Clave de Entorno
                    </button>
                    {error && <p className="text-red-500 mt-4">{error}</p>}
                </div>
            </div>
        );
    }


    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-4">
            <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-md text-center">
                <h1 className="text-2xl font-bold mb-4">Selecciona tu Clave de API</h1>
                <p className="mb-6 text-gray-400">
                    Para usar esta aplicación, necesitas seleccionar una clave de API de Google AI Studio.
                    El uso de los modelos de IA puede incurrir en costos.
                </p>
                <p className="mb-6">
                    <a 
                        href="https://ai.google.dev/gemini-api/docs/billing" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                    >
                        Más información sobre la facturación
                    </a>
                </p>
                <button
                    onClick={handleSelectKey}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                >
                    Seleccionar Clave de API
                </button>
                {error && <p className="text-red-500 mt-4">{error}</p>}
            </div>
        </div>
    );
};

export default ApiKeyPrompt;
