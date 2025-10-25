import React from 'react';
import { View } from '../types';

interface HeaderProps {
    currentView: View;
    onNavigate: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
    
    const navLinkClasses = (view: View) => 
        `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            currentView === view 
            ? 'bg-gray-700 text-white' 
            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
        }`;

    return (
        <header className="bg-gray-800 shadow-md">
            <nav className="container mx-auto px-4 md:px-8 py-3 flex items-center justify-center">
                <div className="flex items-center space-x-2 sm:space-x-4">
                    <button onClick={() => onNavigate('creator')} className={navLinkClasses('creator')}>
                        Crear
                    </button>
                    <button onClick={() => onNavigate('editor')} className={navLinkClasses('editor')}>
                        Editar
                    </button>
                    <button onClick={() => onNavigate('explorer')} className={navLinkClasses('explorer')}>
                        Explorar
                    </button>
                    <button onClick={() => onNavigate('faq')} className={navLinkClasses('faq')}>
                        Ayuda
                    </button>
                </div>
            </nav>
        </header>
    );
};

export default Header;