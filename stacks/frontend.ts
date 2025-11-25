interface FrontendStackProps {
  backendUrl: string;
}

export function FrontendStack(props: FrontendStackProps) {
  const stage = $app.stage;
  const isProd = stage === 'production';
  const isStaging = stage === 'staging';

  const cpu = isProd ? '1 vCPU' : '0.5 vCPU';
  const memory = isProd ? '2 GB' : '1 GB';
  const minContainers = isProd ? 2 : 1;
  const maxContainers = isProd ? 10 : 3;

  const vpc = new sst.aws.Vpc('FrontendVpc', {
    nat: isProd ? 'redundant' : 'single',
  });

  const cluster = new sst.aws.Cluster('FrontendCluster', {
    vpc,
  });

  const environment = {
    NODE_ENV: isProd ? 'production' : isStaging ? 'staging' : 'development',
    NEXT_PUBLIC_API_URL: props.backendUrl,
    NEXT_PUBLIC_APP_URL: isProd
      ? 'https://app.titans-tech.com'
      : isStaging
        ? 'https://staging.titans-tech.com'
        : 'http://localhost:3000',
    NEXT_PUBLIC_ENVIRONMENT: stage,
    NEXT_PUBLIC_GA_ID: isProd ? process.env.GA_TRACKING_ID || '' : '',
    NEXT_PUBLIC_SENTRY_DSN: process.env.SENTRY_DSN_FRONTEND || '',
    NEXT_PUBLIC_STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY || '',
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || '',
  };

  const frontend = new sst.aws.Service('FrontendService', {
    cluster,
    image: {
      context: './apps/dashboard',
      dockerfile: 'Dockerfile',
      args: {
        NEXT_PUBLIC_API_URL: props.backendUrl,
        NEXT_PUBLIC_APP_URL: isProd
          ? 'https://app.titans-tech.com'
          : isStaging
            ? 'https://staging.titans-tech.com'
            : 'http://localhost:3000',
      },
    },
    cpu,
    memory,
    scaling: {
      min: minContainers,
      max: maxContainers,
      cpuUtilization: 70,
      memoryUtilization: 80,
    },
    port: 3000,
    environment,
    health: {
      path: '/api/health',
      interval: '30 seconds',
      timeout: '10 seconds',
      retries: 3,
      startPeriod: '60 seconds',
    },
    public: {
      domain: isProd ? 'app.titans-tech.com' : isStaging ? 'staging.titans-tech.com' : undefined,
      ports: [
        {
          listen: '443/https',
          forward: '3000/http',
        },
      ],
    },
    logging: {
      retention: isProd ? '30 days' : '7 days',
    },
  });

  if (isProd) {
    new sst.aws.Router('MainWebsite', {
      domain: 'www.titans-tech.com',
      routes: {
        '/*': frontend.url,
      },
    });

    new sst.aws.Router('AdminSubdomain', {
      domain: 'admin.titans-tech.com',
      routes: {
        '/*': $interpolate`${frontend.url}/admin`,
      },
    });
  }

  const cdn = new sst.aws.Cdn('FrontendCdn', {
    origin: frontend.url,
    caching: {
      '_next/static/*': {
        behavior: 'max-age=31536000,immutable',
      },
      '_next/image*': {
        behavior: 'max-age=60',
      },
      'api/*': {
        behavior: 'no-cache',
      },
      '*': {
        behavior: 'max-age=0,must-revalidate',
      },
    },
    invalidation: {
      wait: true,
      paths: ['/*'],
    },
  });

  const staticBucket = new sst.aws.Bucket('FrontendStatic', {
    public: true,
    cors: {
      maxAge: '1 day',
      allowedOrigins: ['*'],
      allowedMethods: ['GET', 'HEAD'],
      allowedHeaders: ['*'],
    },
  });

  return {
    url: isProd && cdn ? cdn.url : frontend.url,
    serviceUrl: frontend.url,
    cdnUrl: cdn.url,
    staticBucket: staticBucket.name,
    subdomains: {
      app: isProd
        ? 'https://app.titans-tech.com'
        : isStaging
          ? 'https://staging.titans-tech.com'
          : 'http://localhost:3000',
      www: isProd ? 'https://www.titans-tech.com' : undefined,
      admin: isProd ? 'https://admin.titans-tech.com' : undefined,
    },
  };
}
