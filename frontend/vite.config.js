import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import net from 'net';

const RENDER_BACKEND = 'https://fundmanagement-xlr5.onrender.com';

function checkLocalBackend(host, port, timeoutMs = 800) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(timeoutMs);
    socket.on('connect', () => { socket.destroy(); resolve(true); });
    socket.on('error',   () => { socket.destroy(); resolve(false); });
    socket.on('timeout', () => { socket.destroy(); resolve(false); });
    socket.connect(port, host);
  });
}

export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const localBackend = env.VITE_BACKEND_URL || 'http://localhost:5000';

  const localUrl = new URL(localBackend);
  const localAvailable = await checkLocalBackend(
    localUrl.hostname,
    parseInt(localUrl.port || 5000),
  );

  const BACKEND = localAvailable ? localBackend : RENDER_BACKEND;
  console.log(localAvailable
    ? `[vite] Local backend detected → proxying to ${BACKEND}`
    : `[vite] Local backend not found → falling back to Render: ${BACKEND}`
  );

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api':     { target: BACKEND, changeOrigin: true },
        '/uploads': { target: BACKEND, changeOrigin: true },
      },
    },
  };
});
