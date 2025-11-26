interface FrontendStackProps {
  backendUrl: string;
}

export function FrontendStack(props: FrontendStackProps) {
  const stage = $app.stage;
  const isProd = stage === 'production';
  const isStaging = stage === 'staging';

  const frontend = new sst.aws.Nextjs('Frontend', {
    path: 'apps/dashboard',
    environment: {
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
    },
    domain: isProd ? 'app.titans-tech.com' : undefined,
  });

  // Production-only routers for additional domains
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

  return {
    url: frontend.url,
  };
}
