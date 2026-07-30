import NextAuth from 'next-auth';
import { options } from './options';

const handler = NextAuth(options);

export const { GET, POST } = handler;
