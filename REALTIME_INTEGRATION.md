
Realtime Chat Integration Added
=============================

What I added:
- A simple Socket.IO server at `server/index.js`.
- A client socket wrapper at `src/lib/realtime.ts`.
- A React hook `src/hooks/useRealtimeMessages.tsx` to connect and manage realtime messages.
- Modified `src/components/MessagesModal.tsx` to use the realtime hook.

How to run locally:
1. Install new dependencies:
   npm install socket.io socket.io-client

2. Start the server:
   node server/index.js
   (or in dev: nodemon server/index.js)

3. Start the frontend (in project root where package.json is):
   npm install
   npm run dev

Notes:
- The server stores messages in memory (not persistent). For production, add a DB.
- The server listens by default on port 4000. Ensure that port is free.
