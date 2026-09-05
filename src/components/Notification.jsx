import React from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export default function Notification({ message, type = 'info', onClose }) {
  if (!message) return null;

  const bgColors = {
    error: 'rgba(239, 68, 68, 0.15)',
    success: 'rgba(16, 185, 129, 0.15)',
    info: 'rgba(59, 130, 246, 0.15)',
    warning: 'rgba(245, 158, 11, 0.15)',
  };

  const borderColors = {
    error: 'rgba(239, 68, 68, 0.4)',
    success: 'rgba(16, 185, 129, 0.4)',
    info: 'rgba(59, 130, 246, 0.4)',
    warning: 'rgba(245, 158, 11, 0.4)',
  };

  const textColors = {
    error: '#FCA5A5',
    success: '#6EE7B7',
    info: '#93C5FD',
    warning: '#FDE047',
  };

  const Icon = type === 'error' ? AlertCircle : type === 'success' ? CheckCircle : Info;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between',
        gap: '12px',
        padding: '12px 16px',
        borderRadius: '8px',
        backgroundColor: bgColors[type] || bgColors.info,
        border: `1px solid ${borderColors[type] || borderColors.info}`,
        color: textColors[type] || textColors.info,
        fontSize: '0.9rem',
        fontWeight: '500',
        marginBottom: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Icon size={18} />
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            padding: '2px',
          }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
