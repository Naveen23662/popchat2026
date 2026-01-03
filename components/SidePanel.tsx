import React from 'react';
import ChatPanel from './ChatPanel.tsx';
import SnapshotPreview from './SnapshotPreview.tsx';
import DebugPanel from './DebugPanel.tsx';
import type { ChatMessage, Status, LogEntry } from '../types.ts';

interface SidePanelProps {
    messages: ChatMessage[];
    inputValue: string;
    onInputChange: (val: string) => void;
    onSendMessage: (text: string) => void;
    onSendTyping: () => void;
    disabled?: boolean;
    snapshot: string | null;
    onClearSnapshot: () => void;
    logs: LogEntry[];
    onClose: () => void;
    onClearChat: () => void;
    isTranslationEnabled: boolean;
    onToggleTranslation: () => void;
    onRequestIcebreaker: () => void;
    isRemoteTyping: boolean;
    status: Status;
}

const SidePanel: React.FC<SidePanelProps> = ({
    messages,
    inputValue,
    onInputChange,
    onSendMessage,
    onSendTyping,
    snapshot,
    onClearSnapshot,
    logs,
    onClose,
    onClearChat,
    isTranslationEnabled,
    onToggleTranslation,
    onRequestIcebreaker,
    isRemoteTyping,
    status
}) => {
    return (
        <div className="h-full flex flex-col bg-gray-800 border-l border-gray-700 shadow-xl">
             {/* Mobile Header Close Button (Only visible on small screens inside this panel) */}
             <div className="lg:hidden p-2 flex justify-end">
                <button onClick={onClose} className="p-2 text-gray-400 hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {snapshot && (
                <SnapshotPreview snapshot={snapshot} onClear={onClearSnapshot} />
            )}

            <ChatPanel
                messages={messages}
                inputValue={inputValue}
                onInputChange={onInputChange}
                onSendMessage={onSendMessage}
                onSendTyping={onSendTyping}
                onClearChat={onClearChat}
                isTranslationEnabled={isTranslationEnabled}
                onToggleTranslation={onToggleTranslation}
                onRequestIcebreaker={onRequestIcebreaker}
                isRemoteTyping={isRemoteTyping}
                status={status}
            />

            <DebugPanel logs={logs} />
        </div>
    );
};

export default SidePanel;