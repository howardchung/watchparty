import { serverPath } from './index';

export async function generateName(): Promise<string> {
  const response = await fetch(serverPath + '/generateName');
  return response.text();
}
