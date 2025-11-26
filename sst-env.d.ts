/// <reference types="sst" />

declare global {
  interface ConfigInput {
    stage?: string;
  }

  interface ConfigApp {
    name: string;
    removal: string;
    home: string;
    providers: {
      aws?: {
        region: string;
      };
    };
  }

  interface Config {
    app(input?: ConfigInput): ConfigApp;
    run(): Promise<any>;
  }

  const $config: (config: Config) => any;

  const $app: {
    name: string;
    stage: string;
    removal: string;
    providers: Record<string, any>;
  };

  const $interpolate: (strings: TemplateStringsArray, ...values: any[]) => string;

  namespace sst {
    namespace aws {
      class Vpc {
        constructor(name: string, props?: any);
      }

      class Postgres {
        constructor(name: string, props?: any);
        host: string;
        port: string;
        database: string;
        username: string;
        password: string;
      }

      class Redis {
        constructor(name: string, props?: any);
        host: string;
        port: string;
      }

      class Cluster {
        constructor(name: string, props?: any);
      }

      class Service {
        constructor(name: string, props?: any);
        url: string;
      }

      class Bucket {
        constructor(name: string, props?: any);
        name: string;
      }

      class Cdn {
        constructor(name: string, props?: any);
        url: string;
      }

      class Router {
        constructor(name: string, props?: any);
      }

      class Nextjs {
        constructor(name: string, props?: any);
        url: string;
      }

      class Function {
        constructor(name: string, props?: any);
        url: string;
      }
    }
  }
}

export {};
