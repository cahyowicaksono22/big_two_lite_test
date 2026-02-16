/**
 * Socket.io client — singleton factory.
 * TODO: Connect to real backend URL.
 */

// import { io } from 'socket.io-client'
// import { useAuthStore } from '../store/useAuthStore'

let socketInstance = null

export function getSocket() {
    if (socketInstance) return socketInstance

    // TODO: Replace with real backend URL
    // const token = useAuthStore.getState().token
    // socketInstance = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001', {
    //   auth: { token },
    //   reconnection: true,
    //   reconnectionDelay: 1000,
    //   reconnectionAttempts: 10,
    // })

    // For now, return a mock object
    socketInstance = {
        on: (event, cb) => console.log(`[Socket Mock] Listening: ${event}`),
        emit: (event, data) => console.log(`[Socket Mock] Emit: ${event}`, data),
        off: (event) => console.log(`[Socket Mock] Removed: ${event}`),
        disconnect: () => console.log('[Socket Mock] Disconnected'),
        connected: false,
    }

    return socketInstance
}

export function disconnectSocket() {
    if (socketInstance) {
        socketInstance.disconnect()
        socketInstance = null
    }
}
