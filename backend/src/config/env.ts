import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  jwtSecret: process.env.JWT_SECRET || 'super_secret_jwt_key_pdf_orchestrator_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pdf_orchestrator',
  redisHost: process.env.REDIS_HOST || '127.0.0.1',
  redisPort: parseInt(process.env.REDIS_PORT || '6379', 10),
  kafkaBroker: process.env.KAFKA_BROKER || 'localhost:9092',
  kafkaClientId: process.env.KAFKA_CLIENT_ID || 'pdf-processor-client',
  kafkaGroupId: process.env.KAFKA_GROUP_ID || 'pdf-processor-group',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  useS3: process.env.USE_S3 === 'true',
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  awsRegion: process.env.AWS_REGION || 'us-east-1',
  s3BucketName: process.env.S3_BUCKET_NAME || 'pdf-orchestrator-uploads',
};
