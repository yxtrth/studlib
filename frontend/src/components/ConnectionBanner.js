import { useState, useEffect } from 'react';
import { socket } from '../lib/socket';

const RECONNECT_ATTEMPTS = [1000, 2000, 4000, 8000, 16000]; // Exponential backoff

export const ConnectionBanner = () => {
    const [isOffline, setIsOffline] = useState(false);
    const [reconnectAttempt, setReconnectAttempt] = useState(0);
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        const handleDisconnect = () => {
            setIsOffline(true);
            setShowBanner(true);
            attemptReconnect();
        };

        const handleConnect = () => {
            setIsOffline(false);
            setShowBanner(false);
            setReconnectAttempt(0);
        };

        const attemptReconnect = () => {
            if (reconnectAttempt >= RECONNECT_ATTEMPTS.length) {
                return; // Max attempts reached
            }

            const timeout = RECONNECT_ATTEMPTS[reconnectAttempt];
            setTimeout(() => {
                if (isOffline) {
                    socket.connect();
                    setReconnectAttempt(prev => prev + 1);
                }
            }, timeout);
        };

        socket.on('disconnect', handleDisconnect);
        socket.on('connect', handleConnect);
        socket.on('connect_error', handleDisconnect);

        return () => {
            socket.off('disconnect', handleDisconnect);
            socket.off('connect', handleConnect);
            socket.off('connect_error', handleDisconnect);
        };
    }, [isOffline, reconnectAttempt]);

    if (!showBanner) return null;

    return (
        <div className={`fixed top-0 left-0 right-0 p-4 text-white text-center ${
            isOffline ? 'bg-red-500' : 'bg-green-500'
        } transition-all duration-300 ease-in-out z-50`}>
            {isOffline ? (
                <>
                    <span className="font-semibold">You're offline!</span>
                    <span className="ml-2">
                        Attempting to reconnect... 
                        (Attempt {reconnectAttempt + 1}/{RECONNECT_ATTEMPTS.length})
                    </span>
                </>
            ) : (
                <span className="font-semibold">Connected!</span>
            )}
        </div>
    );
};

export default ConnectionBanner;
