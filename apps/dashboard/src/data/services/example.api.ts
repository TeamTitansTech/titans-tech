'use server';
import { responseHandler } from '@/data/helpers/responseHandler';

export const getHelloWorld = async () => {
  return await responseHandler<{ message: string }>('/');
};
