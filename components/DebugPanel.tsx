
import React, { useState, useRef, useEffect } from 'react';
import type { LogEntry } from '../types.ts';

interface DebugPanelProps {
    logs: LogEntry[];
}

const DebugPanel: React.FC<DebugPanelProps> = ({ logs }) => {
    const [isOpen, setIsOpen] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs, isOpen]);

    return (
        <div className="border-t border-gray-700 shrink-0 text-sm">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-2 text-left text-gray-400 hover:bg-gray-700 transition"
            >
                <span className="font-mono text-xs">Debug Log</span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isOpen && (
                <div ref={scrollRef} className="bg-black p-2 h-32 overflow-y-auto font-mono text-xs">
                    {logs.length > 0 ? logs.map((log, index) => (
                        <div key={index} className="flex mb-1">
                            <span className="text-gray-500 mr-2 shrink-0">{String(log.timestamp)}</span>
                            <span className={log.source === 'webrtc' ? 'text-cyan-400' : 'text-yellow-300'}>
                                [{String(log.source).toUpperCase()}]
                            </span>
                            <p className="ml-2 text-gray-300 whitespace-pre-wrap break-all">
                                {typeof log.message === 'string' ? log.message : JSON.stringify(log.message)}
                            </p>
                        </div>
                    )) : <p className="text-gray-500">No logs yet.</p>}
                </div>
            )}
        </div>
    );
};

export default DebugPanel;
