import React, { useState } from 'react';
import Header from './components/Header';
import ImageCreator from './components/ImageCreator';
import ImageEditor from './components/ImageEditor';
import FaqBot from './components/FaqBot';
import { View } from './types';

const App: React.FC = () => {
    const [view, setView] = useState<View>('creator');

    return (
        <div className="bg-gray-900 text-white min-h-screen font-sans">
            <Header
                currentView={view}
                onNavigate={setView}
            />
            <main className="container mx-auto p-4 md:p-8">
                {view === 'creator' && <ImageCreator />}
                {view === 'editor' && <ImageEditor />}
                {view === 'faq' && <FaqBot />}
            </main>
        </div>
    );
};

export default App;