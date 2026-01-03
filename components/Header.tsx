import React, { useState, useRef, useEffect } from 'react';

interface HeaderProps {
    onShowInfo: (type: 'privacy' | 'terms') => void;
}

const Header: React.FC<HeaderProps> = ({ onShowInfo }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="flex items-center justify-between p-3 border-b border-gray-700/50 shrink-0">
            <div className="flex items-center gap-2">
                <div className="text-2xl">💬</div>
                <h1 className="text-xl font-bold tracking-wider text-white">PopChat</h1>
            </div>
            <div className="relative" ref={menuRef}>
                <button 
                    onClick={() => setIsMenuOpen(prev => !prev)} 
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label="More options"
                    aria-haspopup="true"
                    aria-expanded={isMenuOpen}
                >
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                </button>
                {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-50 animate-fade-in-up">
                        <button
                            onClick={() => { onShowInfo('privacy'); setIsMenuOpen(false); }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                        >
                            Privacy
                        </button>
                        <button
                            onClick={() => { onShowInfo('terms'); setIsMenuOpen(false); }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                        >
                            Terms
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;