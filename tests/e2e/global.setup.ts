import { cleanTestData } from './db-cleanup';

async function globalSetup() {
  await cleanTestData('Global Setup');
}

export default globalSetup;
