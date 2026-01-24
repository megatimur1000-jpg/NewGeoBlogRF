import React, { useState } from 'react';
import { requestPasswordReset, confirmPasswordReset } from '../api/auth';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { AlertCircle, CheckCircle, RefreshCw, ArrowLeft } from 'lucide-react';

interface PasswordResetProps {
  onSuccess: (user: any, token: string) => void;
  onCancel: () => void;
}

export default function PasswordReset({ onSuccess, onCancel }: PasswordResetProps) {
  const [step, setStep] = useState<'request' | 'confirm'>('request');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      setError('Введите номер телефона');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await requestPasswordReset(phone);
      setStep('confirm');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка запроса восстановления');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError('Введите 6-значный код');
      return;
    }
    if (newPassword.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await confirmPasswordReset(phone, code, newPassword);
      onSuccess(response.user, response.token);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка восстановления пароля');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep('request');
    setCode('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
  };

  if (step === 'request') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="w-8 h-8 text-orange-600" />
          </div>
          <CardTitle className="text-xl">Восстановление пароля</CardTitle>
          <p className="text-gray-600 text-sm">
            Введите номер телефона для получения SMS-кода
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleRequestReset} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Номер телефона
              </label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="+7 (999) 123-45-67"
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !phone}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Отправка...
                </>
              ) : (
                'Отправить код'
              )}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
                className="text-sm text-gray-500"
              >
                Отмена
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <CardTitle className="text-xl">Новый пароль</CardTitle>
        <p className="text-gray-600 text-sm">
          Введите код из SMS и новый пароль
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleConfirmReset} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SMS-код
            </label>
            <Input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="text-center text-xl tracking-widest"
              maxLength={6}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Новый пароль
            </label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Минимум 6 символов"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Подтвердите пароль
            </label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Повторите пароль"
              required
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading || code.length !== 6 || newPassword.length < 6 || newPassword !== confirmPassword}
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Восстановление...
              </>
            ) : (
              'Восстановить пароль'
            )}
          </Button>

          <div className="text-center">
            <Button
              type="button"
              variant="ghost"
              onClick={handleBack}
              className="text-sm text-gray-500"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Назад
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
