import React, { useState } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const RegisterForm = ({ onSubmit, loading, error, accessibilitySettings }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    caregiverEmail: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    
    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must contain uppercase, lowercase, and number';
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (formData.caregiverEmail && !/\S+@\S+\.\S+/.test(formData.caregiverEmail)) {
      errors.caregiverEmail = 'Please enter a valid caregiver email address';
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
          htmlFor="name" 
          className="block text-sm font-medium text-text-primary mb-2"
        >
          Full Name
        </label>
        <Input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter your full name"
          required
          disabled={loading}
          className={`
            w-full
            ${fieldErrors.name ? 'border-error focus:ring-error' : ''}
            ${accessibilitySettings.highContrast ? 'border-2' : ''}
          `}
          aria-describedby={fieldErrors.name ? 'name-error' : undefined}
          aria-invalid={!!fieldErrors.name}
        />
        {fieldErrors.name && (
          <p 
            id="name-error" 
            className="mt-1 text-sm text-error"
            role="alert"
          >
            <Icon name="AlertCircle" size={16} className="inline mr-1" />
            {fieldErrors.name}
          </p>
        )}
      </div>

      <div>
        <label 
          htmlFor="register-email" 
          className="block text-sm font-medium text-text-primary mb-2"
        >
          Email Address
        </label>
        <Input
          id="register-email"
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
          aria-describedby={fieldErrors.email ? 'register-email-error' : undefined}
          aria-invalid={!!fieldErrors.email}
        />
        {fieldErrors.email && (
          <p 
            id="register-email-error" 
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
          htmlFor="register-password" 
          className="block text-sm font-medium text-text-primary mb-2"
        >
          Password
        </label>
        <div className="relative">
          <Input
            id="register-password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a strong password"
            required
            disabled={loading}
            className={`
              w-full pr-12
              ${fieldErrors.password ? 'border-error focus:ring-error' : ''}
              ${accessibilitySettings.highContrast ? 'border-2' : ''}
            `}
            aria-describedby={fieldErrors.password ? 'register-password-error' : 'password-help'}
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
        <p id="password-help" className="mt-1 text-xs text-text-secondary">
          Must be 8+ characters with uppercase, lowercase, and number
        </p>
        {fieldErrors.password && (
          <p 
            id="register-password-error" 
            className="mt-1 text-sm text-error"
            role="alert"
          >
            <Icon name="AlertCircle" size={16} className="inline mr-1" />
            {fieldErrors.password}
          </p>
        )}
      </div>

      <div>
        <label 
          htmlFor="confirmPassword" 
          className="block text-sm font-medium text-text-primary mb-2"
        >
          Confirm Password
        </label>
        <div className="relative">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            required
            disabled={loading}
            className={`
              w-full pr-12
              ${fieldErrors.confirmPassword ? 'border-error focus:ring-error' : ''}
              ${accessibilitySettings.highContrast ? 'border-2' : ''}
            `}
            aria-describedby={fieldErrors.confirmPassword ? 'confirm-password-error' : undefined}
            aria-invalid={!!fieldErrors.confirmPassword}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary rounded"
            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
            disabled={loading}
          >
            <Icon name={showConfirmPassword ? "EyeOff" : "Eye"} size={20} />
          </button>
        </div>
        {fieldErrors.confirmPassword && (
          <p 
            id="confirm-password-error" 
            className="mt-1 text-sm text-error"
            role="alert"
          >
            <Icon name="AlertCircle" size={16} className="inline mr-1" />
            {fieldErrors.confirmPassword}
          </p>
        )}
      </div>

      <div>
        <label 
          htmlFor="caregiverEmail" 
          className="block text-sm font-medium text-text-primary mb-2"
        >
          Caregiver Email <span className="text-text-secondary">(Optional)</span>
        </label>
        <Input
          id="caregiverEmail"
          name="caregiverEmail"
          type="email"
          value={formData.caregiverEmail}
          onChange={handleChange}
          placeholder="Caregiver's email address"
          disabled={loading}
          className={`
            w-full
            ${fieldErrors.caregiverEmail ? 'border-error focus:ring-error' : ''}
            ${accessibilitySettings.highContrast ? 'border-2' : ''}
          `}
          aria-describedby={fieldErrors.caregiverEmail ? 'caregiver-email-error' : 'caregiver-help'}
          aria-invalid={!!fieldErrors.caregiverEmail}
        />
        <p id="caregiver-help" className="mt-1 text-xs text-text-secondary">
          Your caregiver will receive progress updates and can provide support
        </p>
        {fieldErrors.caregiverEmail && (
          <p 
            id="caregiver-email-error" 
            className="mt-1 text-sm text-error"
            role="alert"
          >
            <Icon name="AlertCircle" size={16} className="inline mr-1" />
            {fieldErrors.caregiverEmail}
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
        iconName={loading ? undefined : "UserPlus"}
        iconPosition="left"
      >
        {loading ? 'Creating Account...' : 'Create Account'}
      </Button>

      <div className="bg-surface-secondary rounded-lg p-3 mt-4">
        <p className="text-xs text-text-secondary">
          By creating an account, you agree to our privacy policy and terms of service. 
          Your data is encrypted and used only to provide routine management services.
        </p>
      </div>
    </form>
  );
};

export default RegisterForm;