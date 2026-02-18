import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Icon from '../../components/AppIcon';
import { useAuth } from '../../contexts/AuthContext';
import { useRole } from '../../components/ui/RoleBasedRouter';
import AuthToggle from './components/AuthToggle';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import LoadingSpinner from './components/LoadingSpinner';

const LoginRegistration = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, login } = useAuth();
  const { setUserRole } = useRole();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    reducedMotion: false,
    highContrast: false,
    fontSize: 'medium',
    theme: 'light'
  });

  // Mock credentials for testing
  const mockCredentials = {
    user: {
      email: "user@nestifynd.com",
      password: "UserPass123"
    },
    therapist: {
      email: "therapist@nestifynd.com", 
      password: "TherapistPass123"
    }
  };

  // Redirect to role-based dashboard if already authenticated
  if (isAuthenticated && user) {
    const dashboardPath = user.role === 'therapist' ? '/therapist-dashboard' : '/home-dashboard';
    return <Navigate to={dashboardPath} replace />;
  }

  useEffect(() => {
    // Load accessibility settings from localStorage
    const savedSettings = localStorage.getItem('accessibilitySettings');
    let parsed = null;
    if (savedSettings) {
      try {
        parsed = JSON.parse(savedSettings);
        setAccessibilitySettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to parse accessibility settings:', error);
      }
    }

    // Check system preferences
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const highContrast = window.matchMedia('(prefers-contrast: high)').matches;
    const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    setAccessibilitySettings(prev => ({
      ...prev,
      reducedMotion: prev.reducedMotion || reducedMotion,
      highContrast: prev.highContrast || highContrast,
      theme: prev.theme === 'auto' ? (darkMode ? 'dark' : 'light') : prev.theme
    }));

    // Apply theme to document using local values (state not yet updated)
    const effectiveDark = parsed?.theme === 'dark' || (parsed?.theme === 'auto' && darkMode) || (!parsed && darkMode);
    document.documentElement.classList.toggle('dark', effectiveDark);
  }, []);

  const handleLogin = async (formData) => {
    setLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Check mock credentials
      const isValidUser = formData.email === mockCredentials.user.email && 
                         formData.password === mockCredentials.user.password;
      const isValidTherapist = formData.email === mockCredentials.therapist.email && 
                              formData.password === mockCredentials.therapist.password;

      if (isValidUser) {
        login({ email: formData.email, role: 'user' });
        setUserRole('user');
        navigate('/home-dashboard', { replace: true });
      } else if (isValidTherapist) {
        login({ email: formData.email, role: 'therapist' });
        setUserRole('therapist');
        navigate('/therapist-dashboard', { replace: true });
      } else {
        setError(`Invalid credentials. Try:\nUser: ${mockCredentials.user.email} / ${mockCredentials.user.password}\nTherapist: ${mockCredentials.therapist.email} / ${mockCredentials.therapist.password}`);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (formData) => {
    setLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock successful registration (users always register as role 'user')
      login({ email: formData.email, name: formData.name, role: 'user' });
      setUserRole('user');
      if (formData.caregiverEmail) {
        localStorage.setItem('caregiverEmail', formData.caregiverEmail);
      }
      navigate('/home-dashboard', { replace: true });
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Helmet>
        <title>{isLogin ? 'Sign In' : 'Create Account'} - NestifyND</title>
        <meta 
          name="description" 
          content={isLogin ? 'Sign in to your NestifyND account' : 'Create a new NestifyND account'} 
        />
      </Helmet>

      <div className="w-full max-w-md space-y-5">
        <div className="bg-surface rounded-2xl shadow-xl border border-border p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-primary-foreground"
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
                  <path
                    d="M2 12L12 17L22 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              NestifyND
            </h1>
            <p className="text-sm text-text-secondary">
              {isLogin ? 'Welcome back! Sign in to continue.' : 'Create your account to get started.'}
            </p>
          </div>

          {loading ? (
            <LoadingSpinner accessibilitySettings={accessibilitySettings} />
          ) : (
            <>
              {/* Auth Toggle */}
              <AuthToggle
                isLogin={isLogin}
                onToggle={setIsLogin}
                accessibilitySettings={accessibilitySettings}
              />

              {/* Forms */}
              {isLogin ? (
                <LoginForm
                  onSubmit={handleLogin}
                  loading={loading}
                  error={error}
                  accessibilitySettings={accessibilitySettings}
                />
              ) : (
                <RegisterForm
                  onSubmit={handleRegister}
                  loading={loading}
                  error={error}
                  accessibilitySettings={accessibilitySettings}
                />
              )}
            </>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-border">
            <div className="flex items-center justify-center space-x-4 text-xs text-text-secondary">
              <button 
                className="hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary rounded"
                onClick={() => navigate('/settings-accessibility')}
              >
                <Icon name="Settings" size={16} className="inline mr-1" />
                Accessibility
              </button>
              <span>•</span>
              <span>WCAG 2.1 AA Compliant</span>
            </div>
          </div>
        </div>

        {/* Demo Credentials Info */}
        <div className="bg-surface rounded-xl shadow-md border border-border p-4">
          <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <Icon name="Info" size={18} className="text-primary" aria-hidden />
            Demo Credentials
          </h3>
          <div className="grid gap-3 text-sm">
            <div className="bg-surface-secondary rounded-lg p-3 border border-border">
              <p className="font-medium text-text-primary mb-1">User account</p>
              <p className="text-text-secondary text-xs font-mono break-all">
                {mockCredentials.user.email}
              </p>
              <p className="text-text-tertiary text-xs mt-0.5">Password: {mockCredentials.user.password}</p>
            </div>
            <div className="bg-surface-secondary rounded-lg p-3 border border-border">
              <p className="font-medium text-text-primary mb-1">Therapist account</p>
              <p className="text-text-secondary text-xs font-mono break-all">
                {mockCredentials.therapist.email}
              </p>
              <p className="text-text-tertiary text-xs mt-0.5">Password: {mockCredentials.therapist.password}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Screen reader announcements */}
      <div 
        id="auth-announcements"
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      />
    </div>
  );
};

export default LoginRegistration;