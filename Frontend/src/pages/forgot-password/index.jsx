import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import axiosClient from '../../api/axiosClient';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState('');

  const validateEmail = () => {
    if (!email.trim()) {
      setFieldError('Email address is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setFieldError('Please enter a valid email address');
      return false;
    }
    setFieldError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateEmail()) return;

    setLoading(true);
    try {
      await axiosClient.post('/api/auth/forgot-password', { email });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.msg || 'Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Helmet>
          <title>Check your email - NestifyND</title>
          <meta name="description" content="Password reset instructions sent to your email" />
        </Helmet>
        <div className="w-full max-w-md">
          <div className="bg-surface rounded-2xl shadow-xl border border-border p-8 text-center">
            <div className="w-14 h-14 bg-success-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="Mail" size={28} className="text-success" aria-hidden />
            </div>
            <h1 className="text-xl font-semibold text-text-primary mb-2">Check your email</h1>
            <p className="text-text-secondary text-sm mb-6">
              If an account exists for <strong className="text-text-primary">{email}</strong>, we’ve sent
              instructions to reset your password.
            </p>
            <p className="text-text-tertiary text-xs mb-6">
              Didn’t receive an email? Check your spam folder or try again with a different address.
            </p>
            <div className="space-y-3">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => setSubmitted(false)}
              >
                Try another email
              </Button>
              <Link
                to="/login"
                className="block w-full"
              >
                <Button variant="outline" className="w-full">
                  Back to sign in
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Helmet>
        <title>Forgot password - NestifyND</title>
        <meta name="description" content="Reset your NestifyND account password" />
      </Helmet>
      <div className="w-full max-w-md">
        <div className="bg-surface rounded-2xl shadow-xl border border-border p-8">
          <Link
            to="/login"
            className="inline-flex items-center text-sm text-text-secondary hover:text-primary mb-6 focus:outline-none focus:ring-2 focus:ring-primary rounded"
          >
            <Icon name="ArrowLeft" size={18} className="mr-1" aria-hidden />
            Back to sign in
          </Link>

          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-primary-foreground"
                aria-hidden
              >
                <path
                  d="M12 2L2 7L12 12L22 7L12 2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 17L12 22L22 17"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-text-primary text-center mb-2">
            Forgot your password?
          </h1>
          <p className="text-sm text-text-secondary text-center mb-6">
            Enter the email address for your account and we’ll send you a link to reset your password.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="forgot-email"
                className="block text-sm font-medium text-text-primary mb-2"
              >
                Email address
              </label>
              <Input
                id="forgot-email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldError) setFieldError('');
                }}
                placeholder="Enter your email address"
                required
                disabled={loading}
                className={fieldError ? 'border-error focus:ring-error' : ''}
                aria-describedby={fieldError ? 'forgot-email-error' : undefined}
                aria-invalid={!!fieldError}
              />
              {fieldError && (
                <p
                  id="forgot-email-error"
                  className="mt-1 text-sm text-error flex items-center"
                  role="alert"
                >
                  <Icon name="AlertCircle" size={16} className="inline mr-1" />
                  {fieldError}
                </p>
              )}
            </div>

            {error && (
              <div
                className="bg-error-50 border border-error-200 rounded-lg p-3 flex items-start"
                role="alert"
              >
                <Icon name="AlertTriangle" size={20} className="text-error mr-2 flex-shrink-0" />
                <p className="text-sm text-error font-medium">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={loading}
              className="w-full min-h-[44px] font-medium"
            >
              {loading ? 'Sending...' : 'Send reset link'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
