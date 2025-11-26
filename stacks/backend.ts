export function BackendStack() {
  const stage = $app.stage;
  const isProd = stage === 'production';
  const isStaging = stage === 'staging';

  // Environment-specific configuration
  const cpu = isProd ? '1 vCPU' : '0.5 vCPU';
  const memory = isProd ? '2 GB' : '1 GB';
  const minContainers = isProd ? 2 : 1;
  const maxContainers = isProd ? 10 : 3;

  // Create VPC for ECS
  const vpc = new sst.aws.Vpc('BackendVpc', {
    nat: isProd ? 'redundant' : 'single',
  });

  // Create RDS PostgreSQL database
  const database = new sst.aws.Postgres('Database', {
    vpc,
    instance: isProd ? 'db.t3.small' : 'db.t3.micro',
    storage: isProd ? '100' : '20',
    version: '15.4',
    database: `titans_${stage}`,
  });

  // Create Redis cache
  const redis = new sst.aws.Redis('Cache', {
    vpc,
    instance: isProd ? 'cache.t3.micro' : 'cache.t3.micro',
    version: '7.0',
  });

  // Create ECS Cluster
  const cluster = new sst.aws.Cluster('BackendCluster', {
    vpc,
  });

  // Environment variables for the backend
  const environment = {
    NODE_ENV: isProd ? 'production' : isStaging ? 'staging' : 'development',
    PORT: '3001',
    DATABASE_URL: $interpolate`postgresql://${database.username}:${database.password}@${database.host}:${database.port}/${database.database}`,
    REDIS_URL: $interpolate`redis://${redis.host}:${redis.port}`,
    JWT_SECRET: process.env.JWT_SECRET || 'development-secret-key',
    CORS_ORIGINS: isProd
      ? 'https://app.titans-tech.com,https://www.titans-tech.com'
      : isStaging
        ? 'https://staging.titans-tech.com'
        : 'http://localhost:3000',
    AWS_REGION: 'us-east-1',
    S3_BUCKET: process.env.S3_BUCKET || 'titans-tech-uploads',
    SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
    SMTP_PORT: process.env.SMTP_PORT || '587',
    SMTP_USER: process.env.SMTP_USER || '',
    SMTP_PASS: process.env.SMTP_PASS || '',
    FRONTEND_URL: isProd
      ? 'https://app.titans-tech.com'
      : isStaging
        ? 'https://staging.titans-tech.com'
        : 'http://localhost:3000',
  };

  // Create ECS Service with Fargate
  const backend = new sst.aws.Service('BackendService', {
    cluster,
    image: {
      context: './apps/backend',
      dockerfile: 'Dockerfile',
    },
    cpu,
    memory,
    scaling: {
      min: minContainers,
      max: maxContainers,
      cpuUtilization: 70,
      memoryUtilization: 80,
    },
    port: 3001,
    environment,
    health: {
      path: '/health',
      interval: '30 seconds',
      timeout: '10 seconds',
      retries: 3,
      startPeriod: '60 seconds',
    },
    public: {
      domain: isProd
        ? 'api.titans-tech.com'
        : isStaging
          ? 'api-staging.titans-tech.com'
          : undefined,
      ports: [
        {
          listen: '443/https',
          forward: '3001/http',
        },
      ],
    },
    logging: {
      retention: isProd ? '30 days' : '7 days',
    },
    link: [database, redis],
  });

  // Create CloudFront CDN for static assets
  const cdn = new sst.aws.Cdn('BackendCdn', {
    origin: backend.url,
    caching: {
      'api/*': {
        behavior: 'no-cache',
      },
      'static/*': {
        behavior: 'max-age=31536000',
      },
    },
  });

  // Output the backend URL
  return {
    url: backend.url,
    cdnUrl: cdn.url,
    database: {
      host: database.host,
      port: database.port,
      database: database.database,
    },
    redis: {
      host: redis.host,
      port: redis.port,
    },
  };
}
