'use client';

import { TextField } from '@mui/material';

interface AuthInputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  autoComplete?: string;
}

export default function AuthInput({
  label,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  disabled = false,
  autoComplete,
}: AuthInputProps) {
  return (
    <TextField
      fullWidth
      label={label}
      type={type}
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      autoComplete={autoComplete}
      onChange={(e) => onChange(e.target.value)}
      error={Boolean(error)}
      helperText={error || ' '}
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