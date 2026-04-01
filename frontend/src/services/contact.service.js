import { appApiClient } from './apiClient';

export async function createContact(payload) {
  const { data } = await appApiClient.post('/contacts', payload);
  return data;
}
