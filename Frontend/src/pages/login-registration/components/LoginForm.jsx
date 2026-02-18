import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const LoginForm = ({ onSubmit, loading, error, accessibilitySettings }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label 
          htmlFor="email" 
          className="block text-sm font-medium text-text-primary mb-2"
        >
          Email Address
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email address"
          required
          disabled={loading}
          className={`
            w-full
            ${fieldErrors.email ? 'border-error focus:ring-error' : ''}
            ${accessibilitySettings.highContrast ? 'border-2' : ''}
          `}
          aria-describedby={fieldErrors.email ? 'email-error' : undefined}
          aria-invalid={!!fieldErrors.email}
        />
        {fieldErrors.email && (
          <p 
            id="email-error" 
            className="mt-1 text-sm text-error"
            role="alert"
          >
            <Icon name="AlertCircle" size={16} className="inline mr-1" />
            {fieldErrors.email}
          </p>
        )}
      </div>

      <div>
        <label 
          htmlFor="password" 
          className="block text-sm font-medium text-text-primary mb-2"
        >
          Password
        </label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
            disabled={loading}
            className={`
              w-full pr-12
              ${fieldErrors.password ? 'border-error focus:ring-error' : ''}
              ${accessibilitySettings.highContrast ? 'border-2' : ''}
            `}
            aria-describedby={fieldErrors.password ? 'password-error' : undefined}
            aria-invalid={!!fieldErrors.password}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary rounded"
            aria-label={showPassword ? "Hide password" : "Show password"}
            disabled={loading}
          >
            <Icon name={showPassword ? "EyeOff" : "Eye"} size={20} />
          </button>
        </div>
        {fieldErrors.password && (
          <p 
            id="password-error" 
            className="mt-1 text-sm text-error"
            role="alert"
          >
            <Icon name="AlertCircle" size={16} className="inline mr-1" />
            {fieldErrors.password}
          </p>
        )}
      </div>

      {error && (
        <div 
          className="bg-error-50 border border-error-200 rounded-lg p-3"
          role="alert"
        >
          <div className="flex items-center">
            <Icon name="AlertTriangle" size={20} className="text-error mr-2" />
            <p className="text-sm text-error font-medium">
              {error}
            </p>
          </div>
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        loading={loading}
        disabled={loading}
        className="w-full min-h-[44px] font-medium"
        iconName={loading ? undefined : "LogIn"}
        iconPosition="left"
      >
        {loading ? 'Signing In...' : 'Sign In'}
      </Button>

      <div className="text-center">
        <Link
          to="/forgot-password"
          className="text-sm text-primary hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary rounded underline disabled:opacity-50 disabled:pointer-events-none"
          aria-label="Go to forgot password page"
        >
          Forgot your password?
        </Link>
      </div>
    </form>
  );
};

export default LoginForm;