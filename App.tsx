import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ImageCreator from './components/ImageCreator';
import ImageEditor from './components/ImageEditor';
import FaqBot from './components/FaqBot';
import LiveConversation from './components/LiveConversation'; // Importar el nuevo componente
import { PREBUILT_VOICES } from './constants';
import { View } from './types';

const DAILY_LIMIT = 5;

const App: React.FC = () => {
    const [selectedVoice, setSelectedVoice] = useState<string>(PREBUILT_VOICES[0].id);
    const [view, setView] = useState<View>('creator');
    const [generationCount, setGenerationCount] = useState<number>(0);

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        const storedDate = localStorage.getItem('generationDate');
        const storedCount = localStorage.getItem('generationCount');

        if (storedDate === today && storedCount) {
            setGenerationCount(parseInt(storedCount, 10));
        } else {
            // Es un nuevo día, reiniciar el contador
            localStorage.setItem('generationDate', today);
            localStorage.setItem('generationCount', '0');
            setGenerationCount(0);
        }
    }, []);

    const handleGenerationSuccess = () => {
        const newCount = generationCount + 1;
        setGenerationCount(newCount);
        localStorage.setItem('generationCount', newCount.toString());
    };

    const renderView = () => {
        const imageProps = {
            selectedVoice,
            generationCount,
            dailyLimit: DAILY_LIMIT,
            onGenerationSuccess: handleGenerationSuccess,
        };
        switch (view) {
            case 'creator':
                return <ImageCreator {...imageProps} />;
            case 'editor':
                return <ImageEditor {...imageProps} />;
            case 'faq':
                return <FaqBot />;
            case 'live':
                return <LiveConversation selectedVoice={selectedVoice} />;
            default:
                return <ImageCreator {...imageProps} />;
        }
    };

    return (
        <div className="bg-gray-900 text-gray-100 min-h-screen font-sans flex flex-col">
            <Header 
                selectedVoice={selectedVoice} 
                setSelectedVoice={setSelectedVoice}
                view={view}
                setView={setView}
            />
            <main className="container mx-auto p-4 sm:p-6 lg:p-8 flex-grow">
                {renderView()}
            </main>
            <footer className="text-center py-6 mt-8 border-t border-gray-700 text-gray-400">
                <p>&copy; 2024 Asistente Creativo de Imágenes. Creado con la API de Google Gemini.</p>
            </footer>
        </div>
    );
};

export default App;