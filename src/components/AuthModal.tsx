import React, { useState } from 'react';
import { PlayfulButton } from './PlayfulButton';
import { authService } from '../api/services/auth';
import { wsClient } from '../websocket/client';
import type { ApiError } from '../utils/errorHandler';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let response;
      if (isLogin) {
        response = await authService.login({
          email: formData.email,
          password: formData.password,
        });
      } else {
        response = await authService.register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        });
      }

      // Connect WebSocket after successful auth
      if (response.success && response.data?.token) {
        wsClient.connect(response.data.token);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-4 sm:mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">
            {isLogin ? 'Нэвтрэх' : 'Бүртгүүлэх'}
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            {isLogin ? 'Тавтай морилно уу!' : 'Шинэ хэрэглэгч үү?'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Хэрэглэгчийн нэр
              </label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Username"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Имэйл
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Нууц үг
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <PlayfulButton
              type="submit"
              variant="primary"
              size="large"
              disabled={loading}
              className="flex-1 w-full sm:w-auto"
            >
              {loading ? 'Хүлээгдэж байна...' : isLogin ? 'Нэвтрэх' : 'Бүртгүүлэх'}
            </PlayfulButton>
            <PlayfulButton
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Цуцлах
            </PlayfulButton>
          </div>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
              setFormData({ username: '', email: '', password: '' });
            }}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            {isLogin ? 'Бүртгэл байхгүй юу? Бүртгүүлэх' : 'Аль хэдийн бүртгэлтэй юу? Нэвтрэх'}
          </button>
        </div>
      </div>
    </div>
  );
}

