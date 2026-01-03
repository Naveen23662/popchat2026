import React from 'react';
import type { Status } from '../types.ts';

interface StatusBarProps {
    status: Status;
    userCount: number;
}

const statusMap: Record<Status, string> = {
    'idle': 'Ready',
    'getting-media': 'Starting camera...',
    'connecting-ws': 'Connecting to server...',
    'waiting': 'Looking for someone...',
    'pairing': 'Found someone!',
    'connected': 'Connected',
    'disconnected': 'Disconnected',
    'peer-left': 'Peer left',
    'error-ws': 'Connection Error',
    'error-media': 'Camera Error'
};

const statusColors: Record<Status, string> = {
    'idle': 'text-gray-400',
    'getting-media': 'text-yellow-400',
    'connecting-ws': 'text-yellow-400',
    'waiting': 'text-brand-blue animate-pulse',
    'pairing': 'text-green-400',
    'connected': 'text-green-500 font-bold',
    'disconnected': 'text-red-400',
    'peer-left': 'text-orange-400',
    'error-ws': 'text-red-500',
    'error-media': 'text-red-500'
};

const StatusBar: React.FC<StatusBarProps> = ({ status, userCount }) => {
    const statusText = statusMap[status] || 'Unknown';
    const statusColor = statusColors[status] || 'text-gray-400';

    return (
        <div className="flex items-center justify-between text-xs sm:text-sm px-2 py-1 bg-gray-900/50 rounded-md mb-2 border border-gray-700/50">
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                <span className="text-gray-400">Status: <span className={statusColor}>{statusText}</span></span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-gray-400">Online: <span className="text-white font-mono">{userCount}</span></span>
            </div>
        </div>
    );
};

export default StatusBar;