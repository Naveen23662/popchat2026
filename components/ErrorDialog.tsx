import React from 'react';

interface ErrorDialogProps {
    title: string;
    message: string;
    onClose: () => void;
}

const ErrorDialog: React.FC<ErrorDialogProps> = ({ title, message, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" aria-modal="true" role="alertdialog">
            <div className="bg-gray-800 rounded-lg shadow-xl max-w-sm w-full p-6 text-center animate-fade-in-up">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-200">
                    <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-white mt-4">{title}</h3>
                <p className="text-sm text-gray-400 mt-2">
                    {message}
                </p>
                <div className="mt-6">
                    <button
                        onClick={onClose}
                        className="w-full bg-brand-blue hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition"
                    >
                        Got it
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ErrorDialog;