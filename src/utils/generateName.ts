import axios from 'axios';
import { serverPath } from './index';

export async function generateName(): Promise<string> {
  const response = await axios.get<string>(serverPath + '/generateName');
  return response.data;
}
