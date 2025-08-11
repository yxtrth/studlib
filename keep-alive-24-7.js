#!/usr/bin/env node

// 24/7 Keep-Alive Service for Render Backend
const https = require('https');

class KeepAliveService {
    constructor() {
        this.backendUrl = 'https://student-library-backend-o116.onrender.com';
        this.healthEndpoint = '/api/health';
        this.intervalMinutes = 10; // Ping every 10 minutes
        this.isRunning = false;
        this.intervalId = null;
        this.stats = {
            totalPings: 0,
            successfulPings: 0,
            failedPings: 0,
            startTime: new Date(),
            lastSuccessfulPing: null,
            lastFailedPing: null
        };
    }

    async pingBackend() {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            console.log(`🏓 Pinging backend at ${new Date().toISOString()}`);
            
            const request = https.get(`${this.backendUrl}${this.healthEndpoint}`, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    const responseTime = Date.now() - startTime;
                    
                    try {
                        const parsedData = JSON.parse(data);
                        resolve({
                            success: true,
                            status: res.statusCode,
                            responseTime,
                            data: parsedData
                        });
                    } catch (e) {
                        resolve({
                            success: true,
                            status: res.statusCode,
                            responseTime,
                            data: data
                        });
                    }
                });
            });

            request.setTimeout(30000, () => {
                request.destroy();
                reject(new Error('Request timeout (30s)'));
            });

            request.on('error', (error) => {
                reject(error);
            });
        });
    }

    async performHealthCheck() {
        this.stats.totalPings++;
        
        try {
            const result = await this.pingBackend();
            
            if (result.status === 200) {
                this.stats.successfulPings++;
                this.stats.lastSuccessfulPing = new Date();
                
                console.log(`✅ Backend alive! Response time: ${result.responseTime}ms`);
                console.log(`📊 Stats: ${this.stats.successfulPings}/${this.stats.totalPings} successful`);
                
                // Log uptime info if available
                if (result.data && result.data.uptime) {
                    console.log(`⏰ Backend uptime: ${Math.floor(result.data.uptime / 3600)}h ${Math.floor((result.data.uptime % 3600) / 60)}m`);
                }
                
                return true;
            } else {
                throw new Error(`HTTP ${result.status}`);
            }
        } catch (error) {
            this.stats.failedPings++;
            this.stats.lastFailedPing = new Date();
            
            console.log(`❌ Backend ping failed: ${error.message}`);
            console.log(`📊 Stats: ${this.stats.failedPings} failures out of ${this.stats.totalPings} total`);
            
            return false;
        }
    }

    start() {
        if (this.isRunning) {
            console.log('⚠️  Keep-alive service is already running');
            return;
        }

        console.log('🚀 STARTING 24/7 BACKEND KEEP-ALIVE SERVICE');
        console.log('=' .repeat(50));
        console.log(`🎯 Target: ${this.backendUrl}`);
        console.log(`⏱️  Interval: Every ${this.intervalMinutes} minutes`);
        console.log(`🕐 Started: ${this.stats.startTime.toISOString()}`);
        console.log('');

        this.isRunning = true;

        // Initial ping
        this.performHealthCheck();

        // Set up recurring pings
        this.intervalId = setInterval(() => {
            this.performHealthCheck();
        }, this.intervalMinutes * 60 * 1000);

        // Log service status every hour
        setInterval(() => {
            this.logServiceStats();
        }, 60 * 60 * 1000);

        console.log(`🟢 Keep-alive service started! Pinging every ${this.intervalMinutes} minutes...`);
    }

    stop() {
        if (!this.isRunning) {
            console.log('⚠️  Keep-alive service is not running');
            return;
        }

        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        this.isRunning = false;
        console.log('🔴 Keep-alive service stopped');
        this.logServiceStats();
    }

    logServiceStats() {
        const runtime = new Date() - this.stats.startTime;
        const runtimeHours = Math.floor(runtime / (1000 * 60 * 60));
        const runtimeMinutes = Math.floor((runtime % (1000 * 60 * 60)) / (1000 * 60));
        
        console.log('');
        console.log('📈 KEEP-ALIVE SERVICE STATS');
        console.log('-'.repeat(30));
        console.log(`🕐 Runtime: ${runtimeHours}h ${runtimeMinutes}m`);
        console.log(`🏓 Total pings: ${this.stats.totalPings}`);
        console.log(`✅ Successful: ${this.stats.successfulPings}`);
        console.log(`❌ Failed: ${this.stats.failedPings}`);
        
        if (this.stats.totalPings > 0) {
            const successRate = ((this.stats.successfulPings / this.stats.totalPings) * 100).toFixed(1);
            console.log(`📊 Success rate: ${successRate}%`);
        }
        
        if (this.stats.lastSuccessfulPing) {
            const timeSinceSuccess = new Date() - this.stats.lastSuccessfulPing;
            const minutesSinceSuccess = Math.floor(timeSinceSuccess / (1000 * 60));
            console.log(`🟢 Last success: ${minutesSinceSuccess} minutes ago`);
        }
        
        console.log('');
    }

    // Method to get current stats
    getStats() {
        return { ...this.stats };
    }
}

// Create and start the service
const keepAlive = new KeepAliveService();

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Received shutdown signal...');
    keepAlive.stop();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Received termination signal...');
    keepAlive.stop();
    process.exit(0);
});

// Start the service
keepAlive.start();

// Export for potential use as a module
module.exports = KeepAliveService;
