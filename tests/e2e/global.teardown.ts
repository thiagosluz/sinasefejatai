import { cleanTestData } from './db-cleanup';

async function globalTeardown() {
  await cleanTestData('Global Teardown');
}

export default globalTeardown;
