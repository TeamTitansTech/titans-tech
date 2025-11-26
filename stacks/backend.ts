export function BackendStack() {
  const stage = $app.stage;
  const isProd = stage === 'production';
  const isStaging = stage === 'staging';

  // Environment variables for the backend
  const environment = {
    NODE_ENV: isProd ? 'production' : isStaging ? 'staging' : 'development',
    DATABASE_URL: process.env.DATABASE_URL!,
    JWT_SECRET: process.env.JWT_SECRET!,
    CORS_ORIGINS: isProd ? 'https://app.titans-tech.com,https://www.titans-tech.com' : '*',
    AWS_REGION: 'us-east-1',
    S3_BUCKET: process.env.S3_BUCKET || 'blueprints',
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',
    SMTP_HOST: process.env.SMTP_HOST || '',
    SMTP_PORT: process.env.SMTP_PORT || '587',
    SMTP_USER: process.env.SMTP_USER || '',
    SMTP_PASS: process.env.SMTP_PASS || '',
    FRONTEND_URL: isProd
      ? 'https://app.titans-tech.com'
      : isStaging
        ? 'https://staging.titans-tech.com'
        : 'http://localhost:3000',
  };

  // Lambda function for NestJS backend
  const api = new sst.aws.Function('BackendApi', {
    handler: 'apps/backend/dist/lambda.handler',
    runtime: 'nodejs20.x',
    timeout: '30 seconds',
    memory: '512 MB',
    environment,
    url: true,
  });

  return {
    url: api.url,
  };
}
