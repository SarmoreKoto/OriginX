'use client';

import { useState } from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  autoComplete?: string;
}

export default function PasswordInput({
  value,
  onChange,
  error,
  label = 'Password',
  placeholder = 'Enter your password',
  disabled = false,
  autoComplete = 'current-password',
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const toggleVisibility = () => setShowPassword((prev) => !prev);

  return (
    <TextField
      fullWidth
      label={label}
      type={showPassword ? 'text' : 'password'}
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      autoComplete={autoComplete}
      onChange={(e) => onChange(e.target.value)}
      error={Boolean(error)}
      helperText={error || ' '}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              onClick={toggleVisibility}
              edge="end"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              sx={{ color: '#6b7280' }}
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ),
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: '12px',
          backgroundColor: '#fafafa',
          transition: 'all 0.2s ease',
          '& fieldset': {
            borderColor: '#e5e7eb',
            borderWidth: '1.5px',
          },
          '&:hover fieldset': {
            borderColor: '#9ca3af',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#000000',
            borderWidth: '2px',
          },
          '&.Mui-error fieldset': {
            borderColor: '#ef4444',
          },
        },
        '& .MuiInputLabel-root': {
          color: '#6b7280',
          fontSize: '0.95rem',
          '&.Mui-focused': {
            color: '#000000',
          },
          '&.Mui-error': {
            color: '#ef4444',
          },
        },
        '& .MuiInputBase-input': {
          padding: '14px 16px',
          fontSize: '0.95rem',
          color: '#111827',
        },
      }}
    />
  );
}