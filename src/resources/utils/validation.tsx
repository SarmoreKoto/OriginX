// src/components/utils/validation.tsx

export function validateEmail(email: string): string | null {
  if (!email.trim()) {
    return 'Email is required';
  }

  // Optional: Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Invalid email format';
  }

  return null;
}

export function validatePassword(password: string): string | null {
  if (!password.trim()) {
    return 'Password is required';
  }

//   // Optional: Add rules like min length, special char, etc.
//   if (password.length < 6) {
//     return 'Password must be at least 6 characters';
//   }

  return null;
}
