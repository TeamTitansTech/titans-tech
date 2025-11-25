export default $config({
  app(input: ConfigInput | undefined) {
    return {
      name: 'titans-tech',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      home: 'aws',
      providers: {
        aws: {
          region: 'us-east-1',
        },
      },
    };
  },
  async run() {
    // Import stacks
    const backend = await import('./stacks/backend');
    const frontend = await import('./stacks/frontend');

    // Deploy backend first
    const backendStack = await backend.BackendStack();

    // Deploy frontend with backend URL
    const frontendStack = await frontend.FrontendStack({
      backendUrl: backendStack.url,
    });

    return {
      backend: backendStack.url,
      frontend: frontendStack.url,
    };
  },
});
