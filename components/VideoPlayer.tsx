import React from 'react';
import type { Status } from '../types.ts';

interface VideoPlayerProps {
    localVideoRef: React.RefObject<HTMLVideoElement>;
    remoteVideoRef: React.RefObject<HTMLVideoElement>;
    status: Status;
    isLocalCameraOff: boolean;
    onReport?: () => void;
}

const VideoFrame: React.FC<{
    videoRef: React.RefObject<HTMLVideoElement>;
    label: string;
    isMuted: boolean;
    showVideo: boolean;
    isCameraOff?: boolean;
    placeholderText: string;
    isMirrored?: boolean;
    status: Status;
    type: 'local' | 'remote';
    onReport?: () => void;
}> = ({ videoRef, label, isMuted, showVideo, isCameraOff, placeholderText, isMirrored, status, type, onReport }) => {
    
    const isSearching = ['getting-media', 'connecting-ws', 'waiting', 'pairing'].includes(status);

    return (
        <div className={`relative w-full h-full bg-black rounded-2xl overflow-hidden flex items-center justify-center border border-white/5 shadow-inner transition-all duration-500`}>
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={isMuted}
                className={`w-full h-full object-cover transition-opacity duration-700 ${showVideo && !isCameraOff ? 'opacity-100' : 'opacity-0'} ${isMirrored ? 'scale-x-[-1]' : ''}`}
            />
            
            {/* Overlay UI */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border border-white/10 shadow-lg">
                    {label}
                </span>
                {type === 'local' && isMuted && (
                    <span className="bg-red-500/80 backdrop-blur-md text-white text-[10px] font-bold uppercase px-2 py-1 rounded-md">Muted</span>
                )}
            </div>

            {type === 'remote' && status === 'connected' && onReport && (
                <button 
                    onClick={onReport}
                    className="absolute top-4 right-4 z-20 bg-white/10 hover:bg-red-500/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-md border border-white/10 transition-all"
                >
                    Report
                </button>
            )}

            {/* Placeholder Overlay */}
            <div className={`absolute inset-0 z-10 flex flex-col items-center justify-center text-center p-6 transition-all duration-500 ${!showVideo || isCameraOff ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                {isSearching && type === 'remote' ? (
                    <div className="relative mb-6">
                        <div className="absolute -inset-10 bg-brand-blue/10 rounded-full animate-radar opacity-50"></div>
                        <div className="relative bg-brand-blue/20 p-5 rounded-full ring-1 ring-brand-blue/30">
                            <svg className="h-10 w-10 text-brand-blue animate-pulse" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white/5 p-6 rounded-full mb-4 ring-1 ring-white/10">
                         <svg className="h-10 w-10 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}
                <p className="text-gray-500 text-sm font-bold tracking-widest uppercase">{isCameraOff ? 'Camera Off' : placeholderText}</p>
                {isSearching && type === 'remote' && (
                    <p className="text-[10px] text-brand-blue mt-3 font-black tracking-widest uppercase animate-pulse">Scanning Grid...</p>
                )}
            </div>
        </div>
    );
};


const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
    localVideoRef, 
    remoteVideoRef, 
    status, 
    isLocalCameraOff,
    onReport
}) => {
    const showRemoteVideo = status === 'connected';
    const showLocalVideo = !['idle'].includes(status);
    
    let remotePlaceholder: string;
    if (['getting-media', 'connecting-ws', 'waiting', 'pairing'].includes(status)) remotePlaceholder = 'Searching...';
    else if (status === 'peer-left') remotePlaceholder = 'Peer Left';
    else remotePlaceholder = 'Awaiting Match';

    return (
        <div className="flex flex-col gap-2 h-full min-h-0">
            {/* Stranger Video (Top - Priority) */}
            <div className="flex-[3] min-h-0">
                <VideoFrame
                    videoRef={remoteVideoRef}
                    label="Stranger"
                    isMuted={false}
                    showVideo={showRemoteVideo}
                    placeholderText={remotePlaceholder}
                    status={status}
                    type="remote"
                    onReport={onReport}
                />
            </div>
            
            {/* Local Video (Bottom) */}
            <div className="flex-[2] min-h-0">
                <VideoFrame
                    videoRef={localVideoRef}
                    label="You"
                    isMuted={true}
                    showVideo={showLocalVideo}
                    isCameraOff={isLocalCameraOff}
                    placeholderText="Camera Local"
                    isMirrored={true}
                    status={status}
                    type="local"
                />
            </div>
        </div>
    );
};

export default VideoPlayer;