import express from 'express';
import { WebSocketServer } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
// Fix: Always use named import for GoogleGenAI and double quotes as per guidelines
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 8081;

const app = express();
// Fix: Always initialize GoogleGenAI with a named parameter { apiKey: process.env.API_KEY }
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

app.use(express.static(__dirname));

app.get('/health', (req, res) => res.send('OK'));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

const server = app.listen(PORT, () => console.log(`PopChat Server running on port ${PORT}`));
const wss = new WebSocketServer({ server });

const waitingPeers = new Map(); // ws -> string[]
const pairedPeers = new Map(); // ws -> ws

function broadcastStats() {
    const msg = JSON.stringify({ type: 'stats', payload: { users: wss.clients.size } });
    wss.clients.forEach(c => c.readyState === 1 && c.send(msg));
}

wss.on('connection', (ws) => {
    ws.id = Math.random().toString(36).substr(2, 9);
    broadcastStats();

    ws.on('message', async (message) => {
        const data = JSON.parse(message);
        
        switch (data.type) {
            case 'find':
                const myInterests = (data.payload?.interests || []).map(i => i.toLowerCase().trim());
                let peerToPair = null;

                for (const [p, pInterests] of waitingPeers.entries()) {
                    if (p.readyState !== 1) { waitingPeers.delete(p); continue; }
                    
                    const common = myInterests.filter(i => pInterests.includes(i));
                    // Match if interests overlap OR both are looking for random (empty interests)
                    if (common.length > 0 || (myInterests.length === 0 && pInterests.length === 0)) {
                        peerToPair = p;
                        break;
                    }
                }

                if (peerToPair) {
                    waitingPeers.delete(peerToPair);
                    pairedPeers.set(ws, peerToPair);
                    pairedPeers.set(peerToPair, ws);
                    peerToPair.send(JSON.stringify({ type: 'paired', payload: { role: 'initiator' } }));
                    ws.send(JSON.stringify({ type: 'paired', payload: { role: 'receiver' } }));
                } else {
                    waitingPeers.set(ws, myInterests);
                    ws.send(JSON.stringify({ type: 'waiting' }));
                }
                break;

            case 'signal':
                const peer = pairedPeers.get(ws);
                if (peer) peer.send(JSON.stringify({ type: 'signal', payload: data.payload }));
                break;

            case 'leave':
                handleDisconnect(ws);
                break;

            case 'icebreaker':
                try {
                    // Fix: Directly call ai.models.generateContent with both model name and prompt
                    const response = await ai.models.generateContent({
                        model: 'gemini-3-flash-preview',
                        contents: "Generate one fun, short icebreaker question for two strangers in a random video chat. Output only the question.",
                    });
                    // Fix: Use response.text directly (getter, not a function)
                    ws.send(JSON.stringify({ type: 'icebreaker-result', payload: { text: response.text.trim() } }));
                } catch (e) { console.error(e); }
                break;

            case 'translate':
                try {
                    // Fix: Directly call ai.models.generateContent with both model name and prompt
                    const response = await ai.models.generateContent({
                        model: 'gemini-3-flash-preview',
                        contents: `Translate to English: "${data.payload.text}". If already English, return as is. Output only translated text.`,
                    });
                    // Fix: Use response.text directly (getter, not a function)
                    ws.send(JSON.stringify({ type: 'translation-result', payload: { ...data.payload, translatedText: response.text.trim() } }));
                } catch (e) { console.error(e); }
                break;
        }
    });

    ws.on('close', () => { handleDisconnect(ws); broadcastStats(); });
});

function handleDisconnect(ws) {
    waitingPeers.delete(ws);
    const peer = pairedPeers.get(ws);
    if (peer) {
        if (peer.readyState === 1) peer.send(JSON.stringify({ type: 'peer-left' }));
        pairedPeers.delete(ws);
        pairedPeers.delete(peer);
    }
}