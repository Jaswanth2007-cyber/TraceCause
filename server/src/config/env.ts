import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  hindsight: {
    baseUrl: process.env.HINDSIGHT_BASE_URL || process.env.HINDSIGHT_API_URL || 'https://api.hindsight.vectorize.io',
    apiKey: process.env.HINDSIGHT_API_KEY || '',
    bankId: process.env.HINDSIGHT_BANK_ID || 'tracecause-bank',
  },
  groq: {
    apiKey: process.env.GROQ_API_KEY || '',
    model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  },
};
