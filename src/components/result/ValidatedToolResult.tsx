import React from 'react';
import { Alert } from '@mui/material';

interface ValidatedToolResultProps {
  isValid: boolean | null;
  hasInteracted: boolean;
  errorMessage?: string;
  children: React.ReactNode;
}

const ValidatedToolResult: React.FC<ValidatedToolResultProps> = ({
  isValid,
  hasInteracted,
  errorMessage = 'Invalid input.',
  children
}) => (
  <div style={{ position: 'relative', minHeight: 80 }}>
    {hasInteracted && isValid === false && (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 2,
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent'
        }}
      >
        <Alert
          severity="error"
          style={{
            width: '80%',
            opacity: 0.85,
            textAlign: 'center',
            pointerEvents: 'none'
          }}
        >
          {errorMessage}
        </Alert>
      </div>
    )}
    <div
      style={{
        filter: hasInteracted && isValid === false ? 'blur(1px)' : 'none',
        transition: 'filter 0.2s'
      }}
    >
      {hasInteracted && isValid === false
        ? React.cloneElement(children as React.ReactElement, { value: '' })
        : children}
    </div>
  </div>
);

export default ValidatedToolResult;
