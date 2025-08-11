const jwt = require('jsonwebtoken');
const Redis = require('ioredis');
const { promisify } = require('util');

// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL);
redis.on('error', (err) => console.error('Redis Client Error:', err));
redis.on('connect', () => console.log('✅ Redis connected'));

const TOKEN_TYPES = {
    ACCESS: 'access',
    REFRESH: 'refresh'
};

class TokenService {
    constructor() {
        this.accessTokenExpiry = process.env.JWT_EXPIRE || '15m';
        this.refreshTokenExpiry = process.env.REFRESH_TOKEN_EXPIRE || '7d';
    }

    /**
     * Generate JWT token
     * @param {Object} payload - Token payload
     * @param {string} type - Token type (access/refresh)
     * @returns {string} JWT token
     */
    generateToken(payload, type = TOKEN_TYPES.ACCESS) {
        const secret = type === TOKEN_TYPES.REFRESH 
            ? process.env.REFRESH_TOKEN_SECRET 
            : process.env.JWT_SECRET;
            
        const expiry = type === TOKEN_TYPES.REFRESH 
            ? this.refreshTokenExpiry 
            : this.accessTokenExpiry;

        return jwt.sign(payload, secret, { expiresIn: expiry });
    }

    /**
     * Verify JWT token
     * @param {string} token - JWT token to verify
     * @param {string} type - Token type (access/refresh)
     * @returns {Object} Decoded token payload
     */
    async verifyToken(token, type = TOKEN_TYPES.ACCESS) {
        try {
            // Check if token is blacklisted
            const isBlacklisted = await this.isTokenBlacklisted(token);
            if (isBlacklisted) {
                throw new Error('Token is blacklisted');
            }

            const secret = type === TOKEN_TYPES.REFRESH 
                ? process.env.REFRESH_TOKEN_SECRET 
                : process.env.JWT_SECRET;

            return jwt.verify(token, secret);
        } catch (error) {
            throw new Error(`Token verification failed: ${error.message}`);
        }
    }

    /**
     * Generate token pair (access + refresh)
     * @param {Object} user - User object
     * @returns {Object} Token pair
     */
    generateAuthTokens(user) {
        const payload = {
            userId: user._id,
            email: user.email,
            role: user.role
        };

        const accessToken = this.generateToken(payload, TOKEN_TYPES.ACCESS);
        const refreshToken = this.generateToken(payload, TOKEN_TYPES.REFRESH);

        return {
            accessToken,
            refreshToken,
            accessTokenExpiry: this.accessTokenExpiry,
            refreshTokenExpiry: this.refreshTokenExpiry
        };
    }

    /**
     * Blacklist a token
     * @param {string} token - Token to blacklist
     * @param {string} expiry - Token expiry time
     */
    async blacklistToken(token, expiry = '24h') {
        const key = `bl_${token}`;
        await redis.set(key, 'blacklisted');
        await redis.expire(key, this.parseExpiry(expiry));
    }

    /**
     * Check if a token is blacklisted
     * @param {string} token - Token to check
     * @returns {boolean} True if blacklisted
     */
    async isTokenBlacklisted(token) {
        const exists = await redis.exists(`bl_${token}`);
        return exists === 1;
    }

    /**
     * Parse expiry time to seconds
     * @param {string} expiry - Expiry time (e.g., '24h', '7d')
     * @returns {number} Seconds
     */
    parseExpiry(expiry) {
        const unit = expiry.slice(-1);
        const value = parseInt(expiry.slice(0, -1));

        switch (unit) {
            case 'h': return value * 60 * 60;
            case 'd': return value * 24 * 60 * 60;
            case 'm': return value * 60;
            case 's': return value;
            default: return 24 * 60 * 60; // Default 24h
        }
    }
}

module.exports = new TokenService();
