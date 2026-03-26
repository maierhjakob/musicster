import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { sha256 } from '@noble/hashes/sha2.js';

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID as string;
const NATIVE_REDIRECT_URI = 'com.musicster.app://callback';
const SCOPES = [
  'user-read-email',
  'user-read-private',
  'user-modify-playback-state',
  'user-read-playback-state',
].join(' ');

function getRedirectUri(): string {
  return Capacitor.isNativePlatform() ? NATIVE_REDIRECT_URI : window.location.origin;
}

function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(values).map(v => chars[v % chars.length]).join('');
}

function base64url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export async function redirectToSpotifyAuth(): Promise<void> {
  const verifier = generateRandomString(128);
  const challenge = base64url(sha256(new TextEncoder().encode(verifier)));
  localStorage.setItem('spotify_code_verifier', verifier);

  const url = `https://accounts.spotify.com/authorize?${new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: getRedirectUri(),
    code_challenge_method: 'S256',
    code_challenge: challenge,
    scope: SCOPES,
  })}`;

  if (Capacitor.isNativePlatform()) {
    await Browser.open({ url });
  } else {
    window.location.href = url;
  }
}

export async function exchangeCodeForToken(code: string): Promise<string> {
  const verifier = localStorage.getItem('spotify_code_verifier');
  if (!verifier) throw new Error('No code verifier found');

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'authorization_code',
      code,
      redirect_uri: getRedirectUri(),
      code_verifier: verifier,
    }),
  });
  if (!res.ok) throw new Error('Token exchange failed');

  const data = await res.json();
  localStorage.removeItem('spotify_code_verifier');
  storeTokens(data);
  return data.access_token as string;
}

export async function refreshAccessToken(): Promise<string | null> {
  const refresh = localStorage.getItem('spotify_refresh_token');
  if (!refresh) return null;

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'refresh_token',
      refresh_token: refresh,
    }),
  });
  if (!res.ok) { clearStoredTokens(); return null; }

  const data = await res.json();
  storeTokens(data);
  return data.access_token as string;
}

export function getStoredToken(): string | null {
  const token = localStorage.getItem('spotify_token');
  const expiresAt = parseInt(localStorage.getItem('spotify_token_expires') ?? '0');
  if (!token || Date.now() > expiresAt - 5 * 60 * 1000) return null;
  return token;
}

export function clearStoredTokens(): void {
  localStorage.removeItem('spotify_token');
  localStorage.removeItem('spotify_refresh_token');
  localStorage.removeItem('spotify_token_expires');
}

function storeTokens(data: { access_token: string; refresh_token?: string; expires_in: number }) {
  localStorage.setItem('spotify_token', data.access_token);
  localStorage.setItem('spotify_token_expires', String(Date.now() + data.expires_in * 1000));
  if (data.refresh_token) {
    localStorage.setItem('spotify_refresh_token', data.refresh_token);
  }
}
