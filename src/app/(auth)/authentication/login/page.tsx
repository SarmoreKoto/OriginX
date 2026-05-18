'use client';

// import { useAuthRedirect } from '@/hooks/auth_hooks';
import AuthLayout from '@/shared_component/auth_layout';
import AuthFooter from '@/shared_component/auth_footer';
import LoginForm from './login';

export default function LoginPage() {
  // useAuthRedirect('/home');

  return (
    <AuthLayout>
      <LoginForm />
      <AuthFooter
        text="Don't have an account?"
        linkText="Get started"
        href="/authentication/register"
      />
    </AuthLayout>
  );
}