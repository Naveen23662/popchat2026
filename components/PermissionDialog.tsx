
import React from 'react';

interface PermissionDialogProps {
    onClose: () => void;
}

const PermissionDialog: React.FC<PermissionDialogProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4" aria-modal="true" role="dialog">
            <div className="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-fade-in-up">
                <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-brand-blue/10 mb-6">
                    <svg className="h-10 w-10 text-brand-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-2">Camera Access Required</h3>
                <p className="text-gray-400 mb-8 leading-relaxed">
                    PopChat needs your camera and microphone to connect you with people around the world.
                </p>

                <div className="space-y-4 text-left mb-8">
                    <div className="flex items-start gap-3">
                        <div className="bg-brand-blue/20 text-brand-blue rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
                        <p className="text-sm text-gray-300">Look for the <span className="text-white font-semibold italic">camera icon</span> in your browser's address bar.</p>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="bg-brand-blue/20 text-brand-blue rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
                        <p className="text-sm text-gray-300">Set permissions to <span className="text-brand-blue font-semibold">"Always Allow"</span> for this site.</p>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="bg-brand-blue/20 text-brand-blue rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
                        <p className="text-sm text-gray-300">Refresh the page to start your first Pop.</p>
                    </div>
                </div>

                <button
                    onClick={() => window.location.reload()}
                    className="w-full bg-brand-blue hover:bg-blue-600 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-brand-blue/20 uppercase tracking-widest"
                >
                    Refresh & Try Again
                </button>
                
                <button
                    onClick={onClose}
                    className="mt-4 text-gray-500 hover:text-white text-sm font-medium transition-colors"
                >
                    Maybe later
                </button>
            </div>
        </div>
    );
};

export default PermissionDialog;
