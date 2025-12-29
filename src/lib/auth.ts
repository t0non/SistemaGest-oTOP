import type {IronSessionOptions} from 'iron-session';

export type SessionData = {
  isLoggedIn: boolean;
  email?: string;
};

export const defaultSession: SessionData = {
  isLoggedIn: false,
};

export const sessionOptions: IronSessionOptions = {
  cookieName: 'techstore_session',
  password: process.env.AUTH_SECRET as string,
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
};

declare module 'iron-session' {
  interface IronSessionData extends SessionData {}
}
