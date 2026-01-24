import React, { useState, useEffect } from 'react';
import { verifySMS, resendSMS } from '../api/auth';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react';

interface SMSVerificationProps {
  phone: string;
  onSuccess: (user: any, token: string) => void;
  onCancel: () => void;
}

export default function SMSVerification({ phone, onSuccess, onCancel }: SMSVerificationProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 минут
  const [canResend, setCanResend] = useState(false);

  // Таймер для повторной отправки
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError('Введите 6-значный код');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await verifySMS(phone, code);
      onSuccess(response.user, response.token);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка верификации');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError('');

    try {
      await resendSMS(phone);
      setTimeLeft(300);
      setCanResend(false);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка повторной отправки');
    } finally {
      setResendLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-blue-600" />
        </div>
        <CardTitle className="text-xl">Подтверждение номера</CardTitle>
        <p className="text-gray-600 text-sm">
          Мы отправили SMS-код на номер<br />
          <span className="font-medium text-gray-900">+{phone}</span>
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Введите код из SMS
            </label>
            <Input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="text-center text-2xl tracking-widest"
              maxLength={6}
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
            disabled={loading || code.length !== 6}
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Проверка...
              </>
            ) : (
              'Подтвердить'
            )}
          </Button>

          <div className="text-center">
            {canResend ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleResend}
                disabled={resendLoading}
                className="text-sm"
              >
                {resendLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Отправка...
                  </>
                ) : (
                  'Отправить код повторно'
                )}
              </Button>
            ) : (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                Повторная отправка через {formatTime(timeLeft)}
              </div>
            )}
          </div>

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
