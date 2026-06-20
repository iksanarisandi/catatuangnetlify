import { supabase } from './supabase.js';

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
}

export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export function translateAuthError(message) {
  const map = {
    'Invalid login credentials': 'Email atau password salah.',
    'User already registered': 'Email sudah terdaftar.',
    'Password should be at least 6 characters': 'Password minimal 6 karakter.',
    'Unable to validate email address: invalid format': 'Format email tidak valid.',
    'Email not confirmed': 'Email belum dikonfirmasi. Cek inbox Anda.',
  };
  return map[message] || message;
}
