import React from 'react';
import type { Status } from '../types.ts';

interface ControlsProps {
    status: Status;
    isMuted: boolean;
    isCameraOff: boolean;
    onPopNow: () => void;
    onNext: () => void;
    onToggleMute: () => void;
    onToggleCamera: () => void;
    onTakeSnapshot: () => void;
    onToggleChat: () => void;
    interests: string;
    onInterestsChange: (val: string) => void;
    onPanic?: () => void;
}

const ControlButton: React.FC<{ onClick: () => void, disabled?: boolean, children: React.ReactNode, className?: string, title?: string }> = 
({ onClick, disabled = false, children, className = '', title }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={`w-full py-4 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 border ${className} disabled:opacity-20 disabled:grayscale`}
    >
        {children}
    </button>
);

const Controls: React.FC<ControlsProps> = ({
    status,
    isMuted,
    isCameraOff,
    onPopNow,
    onNext,
    onToggleMute,
    onToggleCamera,
    onTakeSnapshot,
    onToggleChat,
    onPanic
}) => {
    const isConnected = status === 'connected';
    
    return (
        <div className="grid grid-cols-1 gap-4">
            <div className="flex gap-2">
                <ControlButton 
                    onClick={onToggleMute} 
                    className={isMuted ? 'bg-red-500/10 border-red-500/50 text-red-500' : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'}
                >
                    {isMuted ? 'Unmuted' : 'Mute'}
                </ControlButton>
                <ControlButton 
                    onClick={onToggleCamera} 
                    className={isCameraOff ? 'bg-red-500/10 border-red-500/50 text-red-500' : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'}
                >
                    {isCameraOff ? 'Cam On' : 'Cam Off'}
                </ControlButton>
            </div>

            <ControlButton 
                onClick={onTakeSnapshot} 
                disabled={!isConnected} 
                className="bg-white/5 border-white/10 hover:bg-white/10 text-white"
            >
                Snapshot
            </ControlButton>

            <button
                onClick={onNext}
                disabled={status === 'idle'}
                className="w-full py-5 bg-brand-pink text-white font-black text-lg rounded-2xl shadow-xl hover:scale-[1.03] active:scale-95 transition-all uppercase tracking-[0.2em] disabled:opacity-20"
            >
                Next Peer
            </button>

            {onPanic && (
                <button
                    onClick={onPanic}
                    className="w-full py-3 bg-red-600/20 border border-red-600/50 text-red-500 font-black text-xs rounded-xl hover:bg-red-600 hover:text-white transition-all uppercase tracking-widest"
                >
                    Panic Disconnect
                </button>
            )}
        </div>
    );
};

export default Controls;