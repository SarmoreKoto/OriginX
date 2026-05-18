'use client';

import AuthLayout from '@/shared_component/auth_layout';
import AuthFooter from '@/shared_component/auth_footer';
import RegisterForm from './register';

export default function RegisterPage() {
  return (
    <AuthLayout
      quote={{
        text: "Join thousands of professionals who trust our platform to streamline their workflow and boost productivity.",
        author: "Sarah Chen",
        role: "Engineering Lead at StartupX",
        initials: "SC",
      }}
    >
      <RegisterForm />
      <AuthFooter
        text="Already have an account?"
        linkText="Sign in"
        href="/authentication/login"
      />
    </AuthLayout>
  );
}