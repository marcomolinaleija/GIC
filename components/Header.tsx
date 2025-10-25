import React, { useState, useEffect } from 'react';
import { View } from '../types';
import { CloseIcon, MenuIcon } from './Icons';

interface HeaderProps {
    currentView: View;
    onNavigate: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleNavigation = (view: View) => {
        onNavigate(view);
        setIsMenuOpen(false);
    };

    // Efecto para prevenir el scroll del body cuando el menú está abierto
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isMenuOpen]);
    
    const navLinkClasses = (view: View, isMobile: boolean = false) => 
        `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isMobile ? 'text-2xl block w-full text-center' : ''
        } ${
            currentView === view 
            ? 'bg-gray-700 text-white' 
            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
        }`;

    return (
        <header className="bg-gray-800 shadow-md sticky top-0 z-50">
            <nav className="container mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
                <div className="text-xl font-bold">
                    <span>Asistente Creativo</span>
                </div>
                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-2 sm:space-x-4">
                    <button onClick={() => handleNavigation('creator')} className={navLinkClasses('creator')}>
                        Crear
                    </button>
                    <button onClick={() => handleNavigation('editor')} className={navLinkClasses('editor')}>
                        Editar
                    </button>
                    <button onClick={() => handleNavigation('explorer')} className={navLinkClasses('explorer')}>
                        Explorar
                    </button>
                    <button onClick={() => handleNavigation('faq')} className={navLinkClasses('faq')}>
                        Ayuda
                    </button>
                </div>
                {/* Mobile Menu Button */}
                <div className="md:hidden">
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Abrir menú de navegación" aria-expanded={isMenuOpen}>
                        <MenuIcon />
                    </button>
                </div>
            </nav>
            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="md:hidden fixed inset-0 bg-gray-900 bg-opacity-95 z-50 flex flex-col items-center justify-center">
                    <button onClick={() => setIsMenuOpen(false)} className="absolute top-5 right-5" aria-label="Cerrar menú de navegación">
                        <CloseIcon />
                    </button>
                    <div className="flex flex-col items-center space-y-8">
                        <button onClick={() => handleNavigation('creator')} className={navLinkClasses('creator', true)}>
                            Crear
                        </button>
                        <button onClick={() => handleNavigation('editor')} className={navLinkClasses('editor', true)}>
                            Editar
                        </button>
                        <button onClick={() => handleNavigation('explorer')} className={navLinkClasses('explorer', true)}>
                            Explorar
                        </button>
                        <button onClick={() => handleNavigation('faq')} className={navLinkClasses('faq', true)}>
                            Ayuda
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;