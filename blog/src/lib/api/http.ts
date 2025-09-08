import axios, { AxiosError } from 'axios';
import httpClient from './http-with-refresh';

export const http = httpClient;

export function normalizeError(err: unknown): Error {
  if (axios.isAxiosError(err)) {
    const e = err as AxiosError<{ message?: string }>;
    const msg = e.response?.data?.message || e.message || 'Request failed';
    return new Error(msg);
  }
  if (typeof err === 'object' && err !== null && 'message' in err) {
    return new Error((err as any).message || 'Request failed');
  }
  return new Error('Request failed');
}

export default http;
