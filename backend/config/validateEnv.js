const Joi = require('joi');

const envSchema = Joi.object({
    // Server
    PORT: Joi.number().default(5000),
    NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
    
    // Database
    MONGODB_URI: Joi.string().required().description('MongoDB connection string'),
    
    // JWT Configuration
    JWT_SECRET: Joi.string().required().min(32).description('JWT secret key'),
    JWT_EXPIRE: Joi.string().default('15m').description('JWT expiration time'),
    REFRESH_TOKEN_SECRET: Joi.string().required().min(32).description('Refresh token secret key'),
    REFRESH_TOKEN_EXPIRE: Joi.string().default('7d').description('Refresh token expiration'),
    
    // Client
    CLIENT_URL: Joi.string().required().uri().description('Frontend application URL'),
    
    // Cloudinary
    CLOUDINARY_CLOUD_NAME: Joi.string().required(),
    CLOUDINARY_API_KEY: Joi.string().required(),
    CLOUDINARY_API_SECRET: Joi.string().required(),
    
    // Redis
    REDIS_URL: Joi.string().required().description('Redis connection string'),
    
    // Email (optional but recommended)
    EMAIL_USER: Joi.string().email().optional(),
    EMAIL_PASS: Joi.string().optional()
}).unknown();

const validateEnv = () => {
    const { error, value: validatedEnvConfig } = envSchema.validate(process.env, {
        abortEarly: false
    });

    if (error) {
        console.error('❌ Environment validation failed:');
        error.details.forEach(detail => {
            console.error(`  • ${detail.message}`);
        });
        process.exit(1);
    }

    return validatedEnvConfig;
};

module.exports = validateEnv;
