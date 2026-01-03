
export type Status = 
  | 'idle' 
  | 'getting-media'
  | 'connecting-ws' 
  | 'waiting' 
  | 'pairing'
  | 'connected' 
  | 'disconnected' 
  | 'peer-left' 
  | 'error-ws' 
  | 'error-media';

export interface SignalingMessage {
  type: 'find' | 'waiting' | 'paired' | 'signal' | 'peer-left' | 'leave' | 'translate' | 'translation-result' | 'translation-error' | 'stats' | 'icebreaker' | 'icebreaker-result';
  payload?: any;
}

export interface ChatMessage {
  sender: 'local' | 'remote';
  text: string;
  translatedText?: string;
  timestamp: number;
  status?: 'queued' | 'sent';
}

export interface LogEntry {
  timestamp: string;
  source: 'webrtc' | 'ws';
  message: string;
}

export interface DataChannelMessage {
    type: 'chat' | 'typing';
    payload?: any;
}
