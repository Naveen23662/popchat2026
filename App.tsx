import React, { useState, useRef, useCallback, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import VideoPlayer from './components/VideoPlayer';
import Controls from './components/Controls';
import ChatPanel from './components/ChatPanel';
import SafetyModal from './components/SafetyModal';
import { ConnectionState, Message } from './types';

// PeerJS is loaded via CDN in index.html
declare var Peer: any;

const App: React.FC = () => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerInstance = useRef<any>(null);
  const currentCall = useRef<any>(null);
  const dataConn = useRef<any>(null);
  
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const handleDisconnect = useCallback(() => {
    setConnectionStatus(ConnectionState.DISCONNECTED);
    setRemoteStream(null);
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (currentCall.current) currentCall.current.close();
    if (dataConn.current) dataConn.current.close();
  }, []);

  const setupDataConnection = useCallback((conn: any) => {
    dataConn.current = conn;
    conn.on('open', () => {
      setConnectionStatus(ConnectionState.CONNECTED);
      setMessages([{
        id: 'system-1',
        sender: 'ai',
        text: 'Connected to a new peer. Stay safe!',
        timestamp: Date.now()
      }]);
    });
    conn.on('data', (data: string) => {
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        sender: 'peer',
        text: data,
        timestamp: Date.now()
      }]);
    });
    conn.on('close', handleDisconnect);
    conn.on('error', handleDisconnect);
  }, [handleDisconnect]);

  const startLocalStream = useCallback(async () => {
    if (localStream) return localStream;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 1280 }, height: { ideal: 720 } }, 
        audio: true 
      });
      setLocalStream(stream);
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      return stream;
    } catch (error: any) {
      console.error("Media Error:", error);
      alert("Please allow camera and microphone access to use PopChat.");
      return null;
    }
  }, [localStream]);

  const handlePopNow = useCallback(async () => {
    if (connectionStatus === ConnectionState.SEARCHING) return;
    
    setConnectionStatus(ConnectionState.SEARCHING);
    const stream = await startLocalStream();
    
    if (!stream) {
      setConnectionStatus(ConnectionState.FAILED);
      return;
    }

    // SIMULATED MATCHING ENGINE
    setTimeout(() => {
      setConnectionStatus(ConnectionState.CONNECTING);
    }, 1500);

  }, [connectionStatus, startLocalStream]);

  const handleNext = useCallback(() => {
    handleDisconnect();
    setMessages([]);
    setTimeout(handlePopNow, 500);
  }, [handleDisconnect, handlePopNow]);

  const handlePanic = useCallback(() => {
    handleDisconnect();
    setMessages([]);
  }, [handleDisconnect]);

  const handleSendMessage = useCallback((text: string) => {
    if (dataConn.current && dataConn.current.open) {
      dataConn.current.send(text);
    }
    setMessages(prev => [...prev, {
      id: crypto.randomUUID(),
      sender: 'me',
      text,
      timestamp: Date.now()
    }]);
  }, []);

  useEffect(() => {
    if (hasAcceptedTerms) {
      const peerConfig = {
        debug: 1,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' }
          ]
        }
      };
      
      peerInstance.current = new Peer(undefined, peerConfig);
      
      peerInstance.current.on('call', async (call: any) => {
        const stream = localStream || await startLocalStream();
        if (!stream) return;
        call.answer(stream);
        call.on('stream', (userRemoteStream: MediaStream) => {
          setRemoteStream(userRemoteStream);
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = userRemoteStream;
          setConnectionStatus(ConnectionState.CONNECTED);
        });
        currentCall.current = call;
      });
      
      peerInstance.current.on('connection', (conn: any) => setupDataConnection(conn));
    }
    return () => {
      if (peerInstance.current) peerInstance.current.destroy();
    };
  }, [hasAcceptedTerms, localStream, setupDataConnection, startLocalStream]);

  const onTouchStart = (e: React.TouchEvent) => touchStartX.current = e.targetTouches[0].clientX;
  const onTouchMove = (e: React.TouchEvent) => touchEndX.current = e.targetTouches[0].clientX;
  const onTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 70) setIsChatOpen(false); 
    if (diff < -70) setIsChatOpen(true); 
  };

  return (
    <div 
      className="flex flex-col h-[100dvh] bg-dark-bg text-dark-text-primary overflow-hidden relative selection:bg-dark-accent selection:text-dark-bg"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {!hasAcceptedTerms && <SafetyModal onAccept={() => setHasAcceptedTerms(true)} />}

      <Header onToggleChat={() => setIsChatOpen(!isChatOpen)} isChatOpen={isChatOpen} />

      <main className="flex-1 flex flex-row h-full min-h-0 relative">
        <div className="flex-1 flex flex-col gap-2 p-2 md:p-4 min-h-0">
          <div className="flex-1 glass rounded-[2.5rem] p-2 md:p-4 min-h-0 relative overflow-hidden flex flex-col lg:flex-row gap-4 shadow-2xl">
            <VideoPlayer videoRef={remoteVideoRef} stream={remoteStream} username="Stranger" showReport onReport={handleNext} />
            <VideoPlayer videoRef={localVideoRef} stream={localStream} isMuted={true} username="You" />
          </div>
          
          <div className="md:hidden mt-1">
            <Controls 
              onPopNow={handlePopNow} 
              onNext={handleNext} 
              onPanic={handlePanic} 
              onToggleMute={() => setIsMuted(!isMuted)} 
              onToggleCamera={() => setIsCameraOff(!isCameraOff)} 
              connectionStatus={connectionStatus} 
              isMuted={isMuted} 
              isCameraOff={isCameraOff} 
              mobileMode 
            />
          </div>
        </div>

        <aside className={`
          fixed md:relative inset-y-0 right-0 z-50 bg-black/95 md:bg-black/20 backdrop-blur-3xl md:backdrop-blur-none border-l border-white/5 flex flex-col transition-all duration-500
          ${isChatOpen ? 'w-[90%] md:w-[380px] translate-x-0 shadow-[-20px_0_50px_rgba(0,0,0,0.5)]' : 'w-0 translate-x-full md:hidden'}
        `}>
          <ChatPanel messages={messages} onSendMessage={handleSendMessage} onClose={() => setIsChatOpen(false)} />
        </aside>

        <div className="hidden md:flex md:w-[220px] bg-black/30 border-l border-white/5 flex-col p-5 gap-6">
          <Controls 
            onPopNow={handlePopNow} 
            onNext={handleNext} 
            onPanic={handlePanic} 
            onToggleMute={() => setIsMuted(!isMuted)} 
            onToggleCamera={() => setIsCameraOff(!isCameraOff)} 
            connectionStatus={connectionStatus} 
            isMuted={isMuted} 
            isCameraOff={isCameraOff} 
          />
          <div className="mt-auto glass-light rounded-2xl p-4 border border-white/5">
            <p className="text-[8px] font-black uppercase text-dark-text-secondary tracking-widest mb-2 opacity-50">Local Protocol</p>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
              <span className="text-[9px] font-bold text-white/80">P2P SECURE</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default App;
