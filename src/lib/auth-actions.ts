'use server';

import {getIronSession} from 'iron-session';
import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import {defaultSession, sessionOptions} from './auth';

export async function signIn(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // This is a mock authentication.
  // In a real application, you would replace this with a call to Firebase Auth.
  // Example:
  // try {
  //   const userCredential = await signInWithEmailAndPassword(auth, email, password);
  //   // ... proceed to create session
  // } catch (error) {
  //   return { error: 'Invalid email or password' };
  // }
  if (email === 'admin@topinfo.bh' && password === 'admin123') {
    const session = await getIronSession(cookies(), sessionOptions);
    session.isLoggedIn = true;
    session.email = email;
    await session.save();
    revalidatePath('/', 'layout');
    redirect('/dashboard');
  }

  return {error: 'Invalid email or password.'};
}

export async function signOut() {
  const session = await getIronSession(cookies(), sessionOptions);
  session.destroy();
  revalidatePath('/', 'layout');
  redirect('/login');
}
