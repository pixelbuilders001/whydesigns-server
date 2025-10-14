import { SESClient } from '@aws-sdk/client-ses';

export const sesClient = new SESClient({
  region: process.env.AWS_SES_REGION || process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export const SES_CONFIG = {
  region: process.env.AWS_SES_REGION || process.env.AWS_REGION || 'ap-south-1',
  fromEmail: process.env.AWS_SES_FROM_EMAIL || 'noreply@why-designers.com',
  fromName: process.env.AWS_SES_FROM_NAME || 'Why Designers',
};
