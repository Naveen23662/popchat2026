
# PopChat - Random Video Chat

PopChat is a modern, production-ready single-page web app for random video chatting, inspired by Omegle. It features a robust, mobile-first UI and a fully functional WebRTC peer-to-peer connection flow with WebSocket signaling, DataChannel for text chat, and a snapshot feature.

This project is built with React and Tailwind CSS for the frontend, and a simple Node.js, Express, and WebSocket backend for signaling.

## Features

- **Random Pairing**: Connect with random users for a video chat.
- **WebRTC Video/Audio**: High-quality, low-latency peer-to-peer video and audio streams.
- **Text Chat**: Real-time text messaging over a WebRTC DataChannel.
- **Snapshot**: Capture a frame from your local video, preview it, and download it as a PNG.
- **Mobile-First Responsive Design**: A great experience on any device, from phones to desktops.
- **Clean Lifecycle**: Gracefully handles connections, disconnections, and finding new peers.
- **Developer Friendly**: Clean code, clear comments, and a built-in debug panel.

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS version recommended, e.g., 18.x or later)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

## Getting Started

Follow these steps to get your local development environment running.

1.  **Clone the repository or copy the files**
    ```bash
    # If this were a git repository:
    # git clone https://github.com/your-repo/popchat.git
    # cd popchat
    ```

2.  **Create your environment file**
    Copy the example environment file and customize it if needed. The default port is `8081`.
    ```bash
    cp .env.example .env
    ```

3.  **Install dependencies**
    This will install Express, `ws` for WebSockets, and `nodemon` for development.
    ```bash
    npm install
    ```

4.  **Run the development server**
    This command starts the Node.js server using `nodemon`, which will automatically restart on file changes.
    ```bash
    npm run dev
    ```

5.  **Open the app**
    Navigate to [http://localhost:8081](http://localhost:8081) in your browser. You will need to open two separate browser tabs or windows to test the peer-to-peer connection.

## Production

To run the app in production, use the `start` script:

```bash
npm start
```

For a real production deployment, you should:
-   **Use HTTPS**: WebRTC requires a secure context (HTTPS) to get camera/microphone access, except for `localhost`. Use a reverse proxy like Nginx or a platform like Render/Vercel that handles this for you.
-   **Set Environment Variables**: Securely set `PORT` and `ADMIN_TOKEN` on your hosting provider.
-   **Scalable Signaling**: The current in-memory pairing server works for a single instance. For a larger scale, consider using a service like Redis to manage the `waitingPeers` queue across multiple server instances.

---

## Manual Testing Checklist

Use this checklist to verify that all core functionalities are working correctly.

-   [ ] **1. Initial Load & Permissions**:
    -   [ ] Open the site.
    -   [ ] A "Pop Now" screen is visible.
    -   [ ] Click "Pop Now".
    -   [ ] The browser prompts for camera and microphone access.
    -   [ ] **Expected**: After allowing, your local video preview appears.

-   [ ] **2. Pairing & Connection**:
    -   [ ] Open a second tab/browser and repeat step 1.
    -   [ ] **Expected**: The status changes from `Searching...` to `Connected!`. The remote video from the other tab appears.

-   [ ] **3. Media Controls**:
    -   [ ] Click **Mute** (or press `M`).
    -   [ ] **Expected**: The button text changes to "Unmute". Your audio is muted for the peer.
    -   [ ] Click **Camera Off** (or press `C`).
    -   [ ] **Expected**: The button text changes to "Camera On". Your video feed is replaced by a placeholder for the peer, but the connection remains active.

-   [ ] **4. Text Chat**:
    -   [ ] Type a message in the chat input and click **Send** (or press `Enter`).
    -   [ ] **Expected**: The message appears in your chat window and in the peer's chat window, labeled correctly.

-   [ ] **5. Snapshot Feature**:
    -   [ ] Click the **Snapshot** button.
    -   [ ] **Expected**: A preview of the snapshot appears below the chat.
    -   [ ] Click the **Download** button.
    -   [ ] **Expected**: A PNG file named `popchat-snapshot.png` is downloaded.
    -   [ ] Click the **Clear** button.
    -   [ ] **Expected**: The snapshot preview disappears.

-   [ ] **6. "Next" Peer Flow**:
    -   [ ] While connected, click **Next** (or press `N`).
    -   [ ] **Expected**: The current connection is cleanly terminated. The status returns to `Searching...` to find a new peer. The other peer sees a "Peer has left" message.

-   [ ] **7. Mobile Responsiveness**:
    -   [ ] Open browser developer tools and simulate different device sizes (e.g., iPhone 12, Samsung Galaxy S20, iPad).
    -   [ ] **Expected**: The layout adjusts gracefully. The controls are at the bottom and are easy to tap. The video feeds and chat are legible.

-   [ ] **8. Disconnect Handling**:
    -   [ ] Close one of the two connected browser tabs.
    -   [ ] **Expected**: The remaining tab shows a "Peer has left" status and provides the "Pop Now" button to start a new search.

---

## Troubleshooting

-   **Camera/Mic Not Working**:
    -   Make sure you've granted permissions. If you accidentally blocked them, you'll need to go into your browser's site settings for `localhost` to reset the permissions. The app will show a dialog with instructions if it detects denial.
    -   Ensure no other application (like Zoom or Teams) is using your camera.

-   **Not Connecting to Other Peer**:
    -   Check the server console for any WebSocket errors.
    -   Check the browser's developer console (on both peers) for WebRTC or WebSocket errors.
    -   This can sometimes be caused by restrictive firewalls or NAT configurations. The provided STUN server (`stun:stun.l.google.com:19302`) helps with this, but complex networks may require a TURN server for relaying media.

-   **Mobile Testing with `ngrok`**:
    To test on a real mobile device, you can expose your local server to the internet using `ngrok`.
    ```bash
    # Install ngrok if you haven't: https://ngrok.com/download
    ngrok http 8081
    ```
    `ngrok` will give you a public HTTPS URL that you can open on your phone.

## Future AI Integration

This scaffold is designed to be easily extensible with AI features. Here are some ideas and where to implement them:

-   **Where to add AI logic**: The `server.js` file is the ideal place to proxy requests to AI services like the Google Gemini API. This keeps your API keys secure on the backend.
-   **Implementation**:
    1.  Add a new WebSocket message type, e.g., `gemini-proxy`.
    2.  The client would send a message: `{ type: 'gemini-proxy', payload: { prompt: '...' } }`.
    3.  In `server.js`, on receiving this message, the server would use the `@google/genai` SDK to call the Gemini API with your secret API key (stored in `.env`).
    4.  The server relays the AI's response back to the client via another WebSocket message.
-   **Potential Features**:
    -   **Conversation Starters**: Generate fun icebreakers.
    -   **Live Captions/Translation**: Transcribe the audio stream and translate it.
    -   **Content Moderation**: Analyze video frames or chat messages for inappropriate content.
    -   **Fun Filters/Effects**: Use AI to apply real-time effects to the video stream (this is more advanced and may require client-side AI).