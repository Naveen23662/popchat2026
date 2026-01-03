import React from 'react';

interface InfoDialogProps {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
}

const InfoDialog: React.FC<InfoDialogProps> = ({ title, onClose, children }) => {
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
            <div className="bg-gray-800 rounded-lg shadow-xl max-w-lg w-full p-6 text-left relative animate-fade-in-up">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                        aria-label="Close dialog"
                    >
                        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div>
                    {children}
                </div>
                 <div className="mt-6 text-right">
                    <button
                        onClick={onClose}
                        className="bg-brand-blue hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-md transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InfoDialog;
