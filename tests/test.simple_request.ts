import { ModuleClient, SessionClient } from '../dist/index.mjs';

const moduleClient = new ModuleClient();

const sessionClient = new SessionClient(moduleClient);

const response = await sessionClient.get('https://example.com');

console.log(response);

await sessionClient.destroySession();
await moduleClient.terminate();
