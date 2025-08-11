/**
 * 24/7 Keep-Alive Service for Free Hosting
 * Prevents Render backend from sleeping due to inactivity
 * 
 * Deploy this as a separate service or run locally
 */

const https = require('https');
const http = require('http');

// Your deployed backend URL (replace with your actual Render URL)
const BACKEND_URL = 'https://your-app-name.onrender.com';
const PING_INTERVAL = 14 * 60 * 1000; // 14 minutes (Render sleeps after 15 min)

class KeepAliveService {
    constructor() {
        this.isRunning = false;
        this.intervalId = null;
    }

    start() {
        if (this.isRunning) {
            console.log('Keep-alive service is already running');
            return;
        }

        console.log(`🚀 Starting 24/7 keep-alive service for ${BACKEND_URL}`);
        console.log(`⏰ Ping interval: ${PING_INTERVAL / 1000 / 60} minutes`);
        
        this.isRunning = true;
        
        // Initial ping
        this.pingServer();
        
        // Set up regular pings
        this.intervalId = setInterval(() => {
            this.pingServer();
        }, PING_INTERVAL);

        console.log('✅ Keep-alive service started successfully');
    }

    stop() {
        if (!this.isRunning) {
            console.log('Keep-alive service is not running');
            return;
        }

        console.log('🛑 Stopping keep-alive service...');
        clearInterval(this.intervalId);
        this.isRunning = false;
        console.log('✅ Keep-alive service stopped');
    }

    pingServer() {
        const startTime = Date.now();
        const url = `${BACKEND_URL}/api/health`;
        
        console.log(`📡 Pinging server: ${url}`);
        
        const protocol = BACKEND_URL.startsWith('https') ? https : http;
        
        const req = protocol.get(url, (res) => {
            const responseTime = Date.now() - startTime;
            console.log(`✅ Server responded: ${res.statusCode} (${responseTime}ms) - ${new Date().toISOString()}`);
        });

        req.on('error', (error) => {
            const responseTime = Date.now() - startTime;
            console.error(`❌ Ping failed (${responseTime}ms):`, error.message);
            
            // Try the root endpoint as fallback
            this.fallbackPing();
        });

        req.setTimeout(30000, () => {
            req.destroy();
            console.error('❌ Ping timeout (30s)');
        });
    }

    fallbackPing() {
        console.log('🔄 Trying fallback ping to root endpoint...');
        
        const protocol = BACKEND_URL.startsWith('https') ? https : http;
        
        const req = protocol.get(BACKEND_URL, (res) => {
            console.log(`✅ Fallback ping successful: ${res.statusCode}`);
        });

        req.on('error', (error) => {
            console.error('❌ Fallback ping also failed:', error.message);
        });

        req.setTimeout(30000, () => {
            req.destroy();
            console.error('❌ Fallback ping timeout');
        });
    }

    getStatus() {
        return {
            isRunning: this.isRunning,
            backendUrl: BACKEND_URL,
            pingInterval: PING_INTERVAL,
            nextPing: this.isRunning ? new Date(Date.now() + PING_INTERVAL) : null
        };
    }
}

// Create and start the service
const keepAlive = new KeepAliveService();

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n📨 Received SIGINT signal');
    keepAlive.stop();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n📨 Received SIGTERM signal');
    keepAlive.stop();
    process.exit(0);
});

// Start the service
keepAlive.start();

// Export for use as module
module.exports = KeepAliveService;
