import React from 'react';
import { Colors } from '../constants/Colors';

interface InputProps {
  label?: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  style?: React.CSSProperties;
}

export const Input: React.FC<InputProps> = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  style,
}) => {
  return (
    <div style={{ marginBottom: '20px', ...style }}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '600',
          color: Colors.text,
          marginBottom: '8px',
        }}>
          {label} {required && <span style={{ color: Colors.error }}>*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        style={{
          width: '100%',
          padding: '12px 16px',
          fontSize: '16px',
          border: `1px solid ${error ? Colors.error : '#E0E0E0'}`,
          borderRadius: '12px',
          backgroundColor: Colors.lightGray,
          outline: 'none',
          transition: 'border-color 0.2s',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = Colors.primary;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? Colors.error : '#E0E0E0';
        }}
      />
      {error && (
        <span style={{
          display: 'block',
          fontSize: '12px',
          color: Colors.error,
          marginTop: '4px',
        }}>
          {error}
        </span>
      )}
    </div>
  );
};

