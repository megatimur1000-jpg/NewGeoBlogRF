// frontend/src/api/auth.ts
import api from './apiClient';

export async function login(email: string, password: string) {
  const res = await api.post('/users/login', { email, password });
  return res.data;
}

export async function register(
  email: string, 
  username: string, 
  password: string, 
  phone: string,
  first_name?: string,
  last_name?: string,
  avatar_url?: string,
  bio?: string
) {
  const res = await api.post('/users/register', { 
    email, 
    username, 
    password, 
    phone,
    first_name,
    last_name,
    avatar_url,
    bio
  });
  return res.data;
}

export async function getProfile() {
  const res = await api.get('/users/profile');
  return res.data;
}

export async function updateAvatar(avatarUrl: string) {
  const res = await api.put('/users/avatar', { avatar_url: avatarUrl });
  return res.data;
}

// SMS-верификация
export async function verifySMS(phone: string, code: string) {
  const res = await api.post('/users/verify-sms', { phone, code });
  return res.data;
}

export async function resendSMS(phone: string) {
  const res = await api.post('/users/resend-sms', { phone });
  return res.data;
}

// Восстановление пароля
export async function requestPasswordReset(phone: string) {
  const res = await api.post('/users/request-password-reset', { phone });
  return res.data;
}

export async function confirmPasswordReset(phone: string, code: string, newPassword: string) {
  const res = await api.post('/users/confirm-password-reset', { phone, code, newPassword });
  return res.data;
}
