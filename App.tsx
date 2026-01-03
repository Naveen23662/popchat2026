import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useWebRTC } from './hooks/useWebRTC.ts';
import type { Status, ChatMessage, LogEntry } from './types.ts';

import Header from './components/Header.tsx';
import VideoPlayer from './components/VideoPlayer.tsx';
import Controls from './components/Controls.tsx';
import SidePanel from './components/SidePanel.tsx';
import ErrorDialog from './components/ErrorDialog.tsx';
import PermissionDialog from './components/PermissionDialog.tsx';
import InfoDialog from './components/InfoDialog.tsx';
import StatusBar from './components/StatusBar.tsx';

const App: React.FC = () => {
    const [status, setStatus] = useState<Status>('idle');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [error, setError] = useState<{ title: string; message: string } | null>(null);
    const [infoDialog, setInfoDialog] = useState<{ title: string; content: string } | null>(null);
    const [showPermissionDialog, setShowPermissionDialog] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isTranslationEnabled, setIsTranslationEnabled] = useState(true);
    const [userCount, setUserCount] = useState(0);
    const [chatInput, setChatInput] = useState('');
    const [interests, setInterests] = useState('');
    const [isRemoteTyping, setIsRemoteTyping] = useState(false);
    
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const [snapshot, setSnapshot] = useState<string | null>(null);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    const onLog = useCallback((source: 'webrtc' | 'ws', message: string) => {
        const timestamp = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLogs(prev => [...prev, { timestamp, source, message }].slice(-50));
    }, []);

    const handleStatusChange = useCallback((s: Status) => {
        setStatus(s);
        if (s === 'connected' && window.innerWidth >= 1024) {
            setIsChatOpen(true);
        }
    }, []);

    const handleLocalStream = useCallback((s: MediaStream) => {
        if (localVideoRef.current) localVideoRef.current.srcObject = s;
    }, []);

    const handleRemoteStream = useCallback((s: MediaStream | null) => {
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = s;
    }, []);

    const handleMessage = useCallback((m: ChatMessage) => {
        setMessages(prev => [...prev, m]);
    }, []);

    const handleTranslationResult = useCallback((res: any) => {
        setMessages(prev => prev.map(m => m.timestamp === res.timestamp ? { ...m, translatedText: res.translatedText } : m));
    }, []);

    const handleIcebreakerResult = useCallback((text: string) => {
        setChatInput(text);
    }, []);

    const handleConnectionError = useCallback((e: Error) => {
        setError({ title: 'Connection Failed', message: e.message });
    }, []);

    const handlePermissionError = useCallback(() => {
        setShowPermissionDialog(true);
    }, []);
    
    const { start, next, toggleMute, toggleCamera, sendMessage, sendTyping, requestIcebreaker, connect } = useWebRTC({
        onStatusChange: handleStatusChange,
        onLocalStream: handleLocalStream,
        onRemoteStream: handleRemoteStream,
        onMessage: handleMessage,
        onLog,
        onTranslationResult: handleTranslationResult,
        onUserCountChange: setUserCount,
        onIcebreakerResult: handleIcebreakerResult,
        onRemoteTyping: setIsRemoteTyping,
        isTranslationEnabled,
        onConnectionError: handleConnectionError,
        onPermissionError: handlePermissionError
    });

    const handleTakeSnapshot = useCallback(() => {
        if (localVideoRef.current) {
            const video = localVideoRef.current;
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.translate(canvas.width, 0);
                ctx.scale(-1, 1);
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                setSnapshot(canvas.toDataURL('image/png'));
                setIsChatOpen(true);
            }
        }
    }, []);

    const handleToggleMute = useCallback(() => {
        setIsMuted(prev => !prev);
        toggleMute();
    }, [toggleMute]);

    const handleToggleCamera = useCallback(() => {
        setIsCameraOff(prev => !prev);
        toggleCamera();
    }, [toggleCamera]);

    const handlePopNow = useCallback(() => {
        const tags = interests.split(',').map(i => i.trim()).filter(Boolean);
        start(tags);
    }, [interests, start]);

    const handlePanic = useCallback(() => {
        next();
        setMessages([]);
        setStatus('idle');
    }, [next]);

    const handleReport = useCallback(() => {
        if (status === 'connected') {
            alert('User reported. Finding a new peer...');
            handlePanic();
        }
    }, [status, handlePanic]);

    const isIdle = useMemo(() => 
        ['idle', 'disconnected', 'peer-left', 'error-ws', 'error-media', 'connecting-ws'].includes(status), 
    [status]);

    return (
        <div className="flex flex-col h-full bg-dark-bg text-white overflow-hidden selection:bg-brand-blue/30">
            <Header onShowInfo={(t) => setInfoDialog({ 
                title: t === 'privacy' ? 'Privacy Policy' : 'Terms of Service',
                content: t === 'privacy' 
                    ? 'PopChat respects your privacy. We do not store video, audio, or chat logs on our servers. All media is peer-to-peer.' 
                    : 'By using PopChat, you agree to be respectful. Harassment, illegal content, and nudity are strictly prohibited.'
            })} />
            
            <main className="flex-1 flex flex-row overflow-hidden relative">
                {/* 1. CHAT COLUMN (Desktop Left / Mobile Overlay) */}
                <div 
                    className={`
                        fixed lg:static inset-y-0 left-0 z-40 w-full sm:w-80 lg:w-[30%]
                        transform transition-transform duration-500 ease-in-out
                        ${isChatOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:flex'}
                        bg-gray-900 border-r border-white/5 flex flex-col
                    `}
                >
                    <SidePanel
                        messages={messages}
                        inputValue={chatInput}
                        onInputChange={setChatInput}
                        onSendMessage={sendMessage}
                        onSendTyping={() => sendTyping(true)}
                        snapshot={snapshot}
                        onClearSnapshot={() => setSnapshot(null)}
                        logs={logs}
                        onClose={() => setIsChatOpen(false)}
                        onClearChat={() => setMessages([])}
                        isTranslationEnabled={isTranslationEnabled}
                        onToggleTranslation={() => setIsTranslationEnabled(!isTranslationEnabled)}
                        onRequestIcebreaker={requestIcebreaker}
                        isRemoteTyping={isRemoteTyping}
                        status={status}
                    />
                </div>

                {/* 2. VIDEO COLUMN (Center) */}
                <div className="flex-1 flex flex-col min-w-0 h-full relative p-2 lg:p-4 gap-2">
                    <StatusBar status={status} userCount={userCount} />
                    
                    <div className="flex-1 relative flex flex-col gap-2 min-h-0">
                        <VideoPlayer 
                            localVideoRef={localVideoRef} 
                            remoteVideoRef={remoteVideoRef} 
                            status={status} 
                            isLocalCameraOff={isCameraOff}
                            onReport={handleReport}
                        />
                        
                        {isIdle && (
                            <div className="absolute inset-0 z-[30] flex flex-col items-center justify-center bg-dark-bg/95 backdrop-blur-3xl rounded-3xl border border-white/10 p-6 text-center animate-fade-in shadow-2xl overflow-hidden">
                                <div className="absolute top-0 -left-20 w-64 h-64 bg-brand-blue/10 blur-[100px] rounded-full"></div>
                                <div className="absolute bottom-0 -right-20 w-64 h-64 bg-brand-pink/10 blur-[100px] rounded-full"></div>

                                <div className="mb-10 space-y-4 relative z-10">
                                    <div className="text-7xl sm:text-8xl mb-6 animate-bounce">
                                        {status === 'error-ws' ? '🔌' : '🚀'}
                                    </div>
                                    <h2 className="text-4xl sm:text-6xl font-black tracking-tighter text-white uppercase italic drop-shadow-2xl">
                                        {status === 'error-ws' ? 'Offline' : 'Start Popping'}
                                    </h2>
                                    <p className="text-gray-400 max-w-sm mx-auto text-sm sm:text-lg font-medium opacity-80">
                                        {status === 'error-ws' 
                                            ? 'The signaling server is offline. Please retry.' 
                                            : 'Connecting you to the world, one pop at a time.'}
                                    </p>
                                </div>
                                
                                <div className="w-full max-w-md space-y-6 relative z-10">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={interests}
                                            onChange={(e) => setInterests(e.target.value)}
                                            placeholder="Add interests (gaming, art...)"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 transition-all text-center text-lg font-semibold"
                                        />
                                    </div>
                                    
                                    <button
                                        onClick={status === 'error-ws' ? connect : handlePopNow}
                                        disabled={status === 'connecting-ws'}
                                        className="w-full py-5 bg-gradient-to-r from-brand-blue via-brand-pink to-brand-blue bg-[length:200%_auto] animate-gradient-slow text-white font-black text-2xl rounded-2xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest disabled:opacity-50"
                                    >
                                        {status === 'connecting-ws' ? 'Connecting...' : (status === 'error-ws' ? 'Retry' : 'Pop Now')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Mobile Only Control Bar */}
                    <div className="lg:hidden flex gap-2">
                        {!isIdle && (
                            <button 
                                onClick={() => setIsChatOpen(true)}
                                className="flex-1 py-4 bg-gray-800 rounded-xl font-bold flex items-center justify-center gap-2"
                            >
                                💬 Chat
                            </button>
                        )}
                        {!isIdle && (
                            <button 
                                onClick={next}
                                className="flex-1 py-4 bg-red-600 rounded-xl font-black uppercase tracking-widest"
                            >
                                Next
                            </button>
                        )}
                    </div>
                </div>

                {/* 3. ADVANCED CONTROLS COLUMN (Desktop Right) */}
                <div className="hidden lg:flex w-full lg:w-[30%] bg-gray-900 border-l border-white/5 p-6 flex-col gap-6 overflow-y-auto">
                    <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500 mb-4">Master Controls</h3>
                        <Controls
                            status={status}
                            isMuted={isMuted}
                            isCameraOff={isCameraOff}
                            onPopNow={handlePopNow}
                            onNext={next}
                            onToggleMute={handleToggleMute}
                            onToggleCamera={handleToggleCamera}
                            onTakeSnapshot={handleTakeSnapshot}
                            onToggleChat={() => setIsChatOpen(!isChatOpen)}
                            interests={interests}
                            onInterestsChange={setInterests}
                            onPanic={handlePanic}
                        />
                    </div>
                    <div className="mt-auto pt-6 border-t border-white/5">
                        <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                             <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-blue mb-2">Live Statistics</h4>
                             <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-400">Online Users</span>
                                <span className="text-sm font-mono text-white font-bold">{userCount}</span>
                             </div>
                        </div>
                    </div>
                </div>
            </main>

            {showPermissionDialog && <PermissionDialog onClose={() => setShowPermissionDialog(false)} />}
            {error && <ErrorDialog title={error.title} message={error.message} onClose={() => { setError(null); setStatus('idle'); }} />}
            {infoDialog && (
                <InfoDialog title={infoDialog.title} onClose={() => setInfoDialog(null)}>
                    <p className="text-gray-300 leading-relaxed font-medium">{infoDialog.content}</p>
                </InfoDialog>
            )}
        </div>
    );
};

export default App;