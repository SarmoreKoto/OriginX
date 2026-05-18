'use client';

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { loginUser } from '@/handler/auth_handler';
import AuthInput from '@/shared_component/auth_input';
import PasswordInput from '@/shared_component/password_input';
import SocialAuth from '@/shared_component/social_auth';
import SubmitButton from '@/shared_component/submit_button';

interface LoginFormErrors {
  email: string;
  password: string;
}

// ── Helper: save all user fields to localStorage ───────────────────────────
function saveUserToStorage(user: any, token: string | undefined) {
  // Save full user object as JSON
  localStorage.setItem('user', JSON.stringify(user));

  // Save individual fields for easy access in header and other components
  // Support both _id and id fields (depending on your API)
  const userId = user?._id || user?.id;
  if (userId) {
    localStorage.setItem('userId', userId);
  }

  if (user?.name) {
    localStorage.setItem('name', user.name);
  }

  if (user?.email) {
    localStorage.setItem('email', user.email);
  }

  if (user?.phone) {
    localStorage.setItem('phone', user.phone || '');
  }

  if (user?.avatar) {
    localStorage.setItem('avatar', user.avatar);
  } else {
    localStorage.setItem('avatar', ''); // Ensure avatar is never undefined
  }

  if (user?.role) {
    localStorage.setItem('role', user.role);
  }

  if (user?.status) {
    localStorage.setItem('status', user.status);
  }

  if (user?.createdAt) {
    localStorage.setItem('createdAt', user.createdAt);
  }

  // Save token
  if (token) {
    localStorage.setItem('token', token);
    localStorage.setItem('fcm_token', token);
    // Also set as cookie so middleware (server-side) can read it
    document.cookie = `fcm_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  }
}

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<LoginFormErrors>({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateForm = useCallback((): boolean => {
    const newErrors: LoginFormErrors = { email: '', password: '' };

    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = 'Please enter a valid email';

    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6)
      newErrors.password = 'Password must be at least 6 characters';

    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  }, [email, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const { ok, data, success, message } = await loginUser(email, password);

      if (!ok || !success) {
        throw new Error(message || 'Authentication failed');
      }

      const user = data?.user;
      const token = data?.token;

      if (!user) {
        throw new Error('User data missing from response');
      }

      // Save user data to localStorage
      saveUserToStorage(user, token);

      toast.success('Welcome back! Redirecting...');

      setTimeout(() => {
        window.location.replace('/home');
      }, 500);
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  const clearError = (field: keyof LoginFormErrors) => {
    if (isSubmitted) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back</h1>
        <p className="text-gray-500 text-sm">Please enter your details to sign in</p>
      </div>

      <AuthInput
        label="Email"
        type="email"
        value={email}
        placeholder="name@company.com"
        autoComplete="email"
        disabled={isLoading}
        onChange={(val) => {
          setEmail(val);
          clearError('email');
        }}
        error={errors.email}
      />

      <div className="space-y-1">
        <PasswordInput
          value={password}
          onChange={(val) => {
            setPassword(val);
            clearError('password');
          }}
          error={errors.password}
          disabled={isLoading}
        />
        <div className="flex justify-end pt-0.5">
          <button
            type="button"
            className="text-xs font-semibold text-gray-500 hover:text-black transition-colors duration-200"
          >
            Forgot password?
          </button>
        </div>
      </div>

      <SubmitButton
        loading={isLoading}
        loadingText="Signing in..."
        text="Sign in"
      />

      <SocialAuth disabled={isLoading} />
    </form>
  );
}