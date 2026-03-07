import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import axiosClient from '../../api/axiosClient';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState({});

  const validate = () => {
    const err = {};
    if (newPassword.length < 6) err.newPassword = 'Password must be at least 6 characters';
    if (newPassword !== confirmPassword) err.confirmPassword = 'Passwords do not match';
    setFieldError(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!token) {
      setError('Invalid or missing reset link. Please request a new one.');
      return;
    }
    if (!validate()) return;

    setLoading(true);
    try {
      await axiosClient.post('/api/auth/reset-password', { token, newPassword });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Helmet>
          <title>Password reset - NestifyND</title>
        </Helmet>
        <div className="w-full max-w-md bg-surface rounded-2xl shadow-xl border border-border p-8 text-center">
          <div className="w-14 h-14 bg-success-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="CheckCircle" size={28} className="text-success" aria-hidden />
          </div>
          <h1 className="text-xl font-semibold text-text-primary mb-2">Password reset</h1>
          <p className="text-text-secondary text-sm mb-6">Your password has been updated. You can now sign in.</p>
          <Link to="/login">
            <Button variant="primary" className="w-full">Sign in</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Helmet>
        <title>Reset password - NestifyND</title>
      </Helmet>
      <div className="w-full max-w-md bg-surface rounded-2xl shadow-xl border border-border p-8">
        <Link
          to="/login"
          className="inline-flex items-center text-sm text-text-secondary hover:text-primary mb-6"
        >
          <Icon name="ArrowLeft" size={18} className="mr-1" />
          Back to sign in
        </Link>
        <h1 className="text-2xl font-bold text-text-primary mb-2">Set new password</h1>
        <p className="text-sm text-text-secondary mb-6">Enter your new password below.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-text-primary mb-2">New password</label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
              minLength={6}
              disabled={loading}
              className={fieldError.newPassword ? 'border-error' : ''}
            />
            {fieldError.newPassword && (
              <p className="mt-1 text-sm text-error">{fieldError.newPassword}</p>
            )}
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-text-primary mb-2">Confirm password</label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              disabled={loading}
              className={fieldError.confirmPassword ? 'border-error' : ''}
            />
            {fieldError.confirmPassword && (
              <p className="mt-1 text-sm text-error">{fieldError.confirmPassword}</p>
            )}
          </div>
          {error && (
            <div className="bg-error-50 border border-error-200 rounded-lg p-3">
              <p className="text-sm text-error">{error}</p>
            </div>
          )}
          <Button type="submit" variant="primary" loading={loading} disabled={loading} className="w-full">
            Reset password
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
