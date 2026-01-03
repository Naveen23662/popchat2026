import { useEffect, useRef, useCallback } from 'react';
import type { ChatMessage, Status, SignalingMessage, DataChannelMessage } from '../types.ts';

interface UseWebRTCProps {
    onStatusChange: (status: Status) => void;
    onLocalStream: (stream: MediaStream) => void;
    onRemoteStream: (stream: MediaStream | null) => void;
    onMessage: (message: ChatMessage) => void;
    onLog: (source: 'webrtc' | 'ws', message: string) => void;
    onTranslationResult: (result: any) => void;
    onUserCountChange: (count: number) => void;
    onIcebreakerResult: (text: string) => void;
    onRemoteTyping: (isTyping: boolean) => void;
    isTranslationEnabled: boolean;
    onConnectionError: (err: Error) => void;
    onPermissionError: () => void;
}

export function useWebRTC({
    onStatusChange, onLocalStream, onRemoteStream, onMessage, onLog,
    onTranslationResult, onUserCountChange, onIcebreakerResult, onRemoteTyping,
    isTranslationEnabled, onConnectionError, onPermissionError
}: UseWebRTCProps) {
    const wsRef = useRef<WebSocket | null>(null);
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const dcRef = useRef<RTCDataChannel | null>(null);
    const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);
    const messageQueue = useRef<{text: string, timestamp: number}[]>([]);
    const statusRef = useRef<Status>('idle');
    const reconnectTimeoutRef = useRef<number | null>(null);
    const retryCountRef = useRef(0);
    
    const translationEnabledRef = useRef(isTranslationEnabled);
    useEffect(() => { translationEnabledRef.current = isTranslationEnabled; }, [isTranslationEnabled]);

    const sendWS = useCallback((type: string, payload?: any) => {
        const ws = wsRef.current;
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type, payload }));
        }
    }, []);

    const flushQueue = useCallback(() => {
        const dc = dcRef.current;
        if (dc && dc.readyState === 'open') {
            messageQueue.current.forEach(m => dc.send(JSON.stringify({ type: 'chat', payload: m })));
            messageQueue.current = [];
        }
    }, []);

    const setupDC = useCallback((dc: RTCDataChannel) => {
        dc.onopen = () => { 
            onLog('webrtc', 'DataChannel established'); 
            dcRef.current = dc;
            flushQueue(); 
        };
        dc.onmessage = (e) => {
            try {
                const data: DataChannelMessage = JSON.parse(e.data);
                if (data.type === 'chat') {
                    onMessage({ sender: 'remote', text: data.payload.text, timestamp: data.payload.timestamp, status: 'sent' });
                    if (translationEnabledRef.current) sendWS('translate', { text: data.payload.text, timestamp: data.payload.timestamp });
                } else if (data.type === 'typing') {
                    onRemoteTyping(data.payload.isTyping);
                }
            } catch (err) {
                onLog('webrtc', `DC Message Error: ${err}`);
            }
        };
        dc.onclose = () => {
            onLog('webrtc', 'DataChannel closed');
            dcRef.current = null;
        };
        dcRef.current = dc;
    }, [onLog, onMessage, onRemoteTyping, sendWS, flushQueue]);

    const createPC = useCallback(() => {
        const pc = new RTCPeerConnection({ 
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' }
            ] 
        });
        
        pc.onicecandidate = (e) => e.candidate && sendWS('signal', { candidate: e.candidate });
        pc.ontrack = (e) => {
            onLog('webrtc', 'Remote track received');
            onRemoteStream(e.streams[0]);
        };
        pc.onconnectionstatechange = () => {
            onLog('webrtc', `P2P State: ${pc.connectionState}`);
            if (pc.connectionState === 'connected') {
                statusRef.current = 'connected';
                onStatusChange('connected');
            } else if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
                onRemoteStream(null);
            }
        };
        
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(t => pc.addTrack(t, localStreamRef.current!));
        }
        
        pcRef.current = pc;
        return pc;
    }, [onLog, onRemoteStream, onStatusChange, sendWS]);

    const connectWS = useCallback(() => {
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }

        // Fix: Use origin for WebSocket URL to ensure compatibility with proxied environments
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/`;
        
        onLog('ws', `Connecting to signaling server...`);
        statusRef.current = 'connecting-ws';
        onStatusChange('connecting-ws');

        try {
            const ws = new WebSocket(wsUrl);
            
            ws.onopen = () => { 
                onLog('ws', 'Server connected.'); 
                statusRef.current = 'idle';
                onStatusChange('idle'); 
                retryCountRef.current = 0;
            };
            
            ws.onmessage = async (e) => {
                const msg: SignalingMessage = JSON.parse(e.data);
                switch (msg.type) {
                    case 'stats': onUserCountChange(msg.payload.users); break;
                    case 'waiting': 
                        statusRef.current = 'waiting';
                        onStatusChange('waiting'); 
                        break;
                    case 'paired':
                        onLog('ws', 'Pair found!');
                        statusRef.current = 'pairing';
                        onStatusChange('pairing');
                        const pc = createPC();
                        if (msg.payload.role === 'initiator') {
                            setupDC(pc.createDataChannel('chat'));
                            const offer = await pc.createOffer();
                            await pc.setLocalDescription(offer);
                            sendWS('signal', offer);
                        } else {
                            pc.ondatachannel = (ev) => setupDC(ev.channel);
                        }
                        break;
                    case 'signal':
                        if (!pcRef.current) return;
                        if (msg.payload.candidate) {
                            if (pcRef.current.remoteDescription) {
                                await pcRef.current.addIceCandidate(msg.payload.candidate).catch(e => onLog('webrtc', `ICE Error: ${e}`));
                            } else {
                                pendingCandidates.current.push(msg.payload.candidate);
                            }
                        } else if (msg.payload.type === 'offer') {
                            await pcRef.current.setRemoteDescription(new RTCSessionDescription(msg.payload));
                            for (const c of pendingCandidates.current) {
                                await pcRef.current.addIceCandidate(c).catch(e => onLog('webrtc', `ICE Error: ${e}`));
                            }
                            pendingCandidates.current = [];
                            const answer = await pcRef.current.createAnswer();
                            await pcRef.current.setLocalDescription(answer);
                            sendWS('signal', answer);
                        } else if (msg.payload.type === 'answer') {
                            await pcRef.current.setRemoteDescription(new RTCSessionDescription(msg.payload));
                        }
                        break;
                    case 'peer-left':
                        onLog('ws', 'Peer disconnected.');
                        statusRef.current = 'peer-left';
                        onStatusChange('peer-left');
                        onRemoteStream(null);
                        pcRef.current?.close();
                        pcRef.current = null;
                        dcRef.current = null;
                        break;
                    case 'translation-result': onTranslationResult(msg.payload); break;
                    case 'icebreaker-result': onIcebreakerResult(msg.payload.text); break;
                }
            };
            
            ws.onerror = () => {
                onLog('ws', 'WebSocket connection error.');
            };
            
            ws.onclose = (event) => {
                onLog('ws', `WebSocket closed (Code: ${event.code})`);
                wsRef.current = null;
                if (statusRef.current !== 'idle' && statusRef.current !== 'peer-left') {
                    statusRef.current = 'error-ws';
                    onStatusChange('error-ws');
                }
                
                const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 5000);
                retryCountRef.current++;
                reconnectTimeoutRef.current = window.setTimeout(connectWS, delay);
            };
            
            wsRef.current = ws;
        } catch (e) {
            onLog('ws', `WS Exception: ${e}`);
        }
    }, [onStatusChange, onLog, onUserCountChange, onTranslationResult, onIcebreakerResult, createPC, setupDC, sendWS]);

    useEffect(() => { 
        connectWS(); 
        return () => {
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
            if (wsRef.current) wsRef.current.close();
        }; 
    }, [connectWS]);

    return {
        connect: connectWS,
        start: async (interests: string[]) => {
            if (!localStreamRef.current) {
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    onLog('webrtc', 'getUserMedia not supported in this browser.');
                    onPermissionError();
                    return;
                }
                
                statusRef.current = 'getting-media';
                onStatusChange('getting-media');
                try {
                    const s = await navigator.mediaDevices.getUserMedia({ 
                        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }, 
                        audio: true 
                    });
                    localStreamRef.current = s;
                    onLocalStream(s);
                } catch (e) { 
                    onLog('webrtc', `Media Error: ${e}`);
                    statusRef.current = 'error-media';
                    onPermissionError(); 
                    return; 
                }
            }
            sendWS('find', { interests });
        },
        next: () => {
            sendWS('leave');
            if (pcRef.current) {
                pcRef.current.close();
                pcRef.current = null;
            }
            dcRef.current = null;
            onRemoteStream(null);
            statusRef.current = 'idle';
            onStatusChange('idle');
        },
        sendMessage: (text: string) => {
            const ts = Date.now();
            const dc = dcRef.current;
            const isOpen = dc && dc.readyState === 'open';
            onMessage({ sender: 'local', text, timestamp: ts, status: isOpen ? 'sent' : 'queued' });
            if (isOpen) {
                dc.send(JSON.stringify({ type: 'chat', payload: { text, timestamp: ts } }));
            } else {
                messageQueue.current.push({ text, timestamp: ts });
            }
        },
        sendTyping: (isTyping: boolean) => {
            const dc = dcRef.current;
            if (dc && dc.readyState === 'open') {
                dc.send(JSON.stringify({ type: 'typing', payload: { isTyping } }));
            }
        },
        requestIcebreaker: () => sendWS('icebreaker'),
        toggleMute: () => {
            if (localStreamRef.current) {
                localStreamRef.current.getAudioTracks().forEach(t => t.enabled = !t.enabled);
            }
        },
        toggleCamera: () => {
            if (localStreamRef.current) {
                localStreamRef.current.getVideoTracks().forEach(t => t.enabled = !t.enabled);
            }
        }
    };
}