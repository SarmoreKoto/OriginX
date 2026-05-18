'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { registerUser } from '@/handler/user_handler';
import AuthInput from '@/shared_component/auth_input';
import PasswordInput from '@/shared_component/password_input';
import SocialAuth from '@/shared_component/social_auth';
import SubmitButton from '@/shared_component/submit_button';

interface RegisterFormErrors {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterForm() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<RegisterFormErrors>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateField = (name: keyof RegisterFormErrors, value: string): string => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Full name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        return '';
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email';
        return '';
      case 'phone':
        if (!value.trim()) return 'Phone number is required';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        if (!/[A-Z]/.test(value)) return 'Must contain one uppercase letter';
        if (!/[a-z]/.test(value)) return 'Must contain one lowercase letter';
        if (!/[0-9]/.test(value)) return 'Must contain one number';
        return '';
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== formData.password) return 'Passwords do not match';
        return '';
      default:
        return '';
    }
  };

  const validateForm = useCallback((): boolean => {
    const newErrors: RegisterFormErrors = {
      name: validateField('name', formData.name),
      email: validateField('email', formData.email),
      phone: validateField('phone', formData.phone),
      password: validateField('password', formData.password),
      confirmPassword: validateField('confirmPassword', formData.confirmPassword),
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  }, [formData]);

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (isSubmitted) {
      setErrors((prev) => ({ ...prev, [field]: validateField(field as keyof RegisterFormErrors, value) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);

    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setIsLoading(true);

    try {
      const { ok, data } = await registerUser({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
      });

      if (!ok) {
        throw new Error(data?.message || 'Registration failed');
      }

      if (data?.success) {
        toast.success('Account created successfully! Please sign in.');
        router.push('/authentication/login');
      } else {
        throw new Error(data?.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-5">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create account</h1>
        <p className="text-gray-500 text-sm">Start your journey with us today</p>
      </div>

      <AuthInput
        label="Full Name"
        value={formData.name}
        placeholder="John Doe"
        autoComplete="name"
        disabled={isLoading}
        onChange={(val) => updateField('name', val)}
        error={errors.name}
      />

      <AuthInput
        label="Email"
        type="email"
        value={formData.email}
        placeholder="name@company.com"
        autoComplete="email"
        disabled={isLoading}
        onChange={(val) => updateField('email', val)}
        error={errors.email}
      />

      <AuthInput
        label="Phone Number"
        type="tel"
        value={formData.phone}
        placeholder="+1 (555) 000-0000"
        autoComplete="tel"
        disabled={isLoading}
        onChange={(val) => updateField('phone', val)}
        error={errors.phone}
      />

      <PasswordInput
        value={formData.password}
        onChange={(val) => updateField('password', val)}
        error={errors.password}
        disabled={isLoading}
        autoComplete="new-password"
        label="Password"
        placeholder="Create a strong password"
      />

      <PasswordInput
        value={formData.confirmPassword}
        onChange={(val) => updateField('confirmPassword', val)}
        error={errors.confirmPassword}
        disabled={isLoading}
        autoComplete="new-password"
        label="Confirm Password"
        placeholder="Repeat your password"
      />

      <SubmitButton
        loading={isLoading}
        loadingText="Creating account..."
        text="Create account"
      />

      <SocialAuth disabled={isLoading} />
    </form>
  );
}