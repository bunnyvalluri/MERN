import toast from 'react-hot-toast';

/**
 * Styled Toast Notification Helpers matching the InternHub Design System.
 */
export const notify = {
  success: (message, options = {}) => {
    return toast.success(message, {
      ...options,
      style: {
        background: '#ffffff',
        color: '#0f172a',
        border: '1px solid #a7f3d0',
        borderRadius: '12px',
        padding: '12px 16px',
        fontSize: '13px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
        ...options.style,
      },
      iconTheme: {
        primary: '#10b981',
        secondary: '#ffffff',
      },
    });
  },

  error: (message, options = {}) => {
    return toast.error(message, {
      ...options,
      style: {
        background: '#ffffff',
        color: '#0f172a',
        border: '1px solid #fecaca',
        borderRadius: '12px',
        padding: '12px 16px',
        fontSize: '13px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
        ...options.style,
      },
      iconTheme: {
        primary: '#ef4444',
        secondary: '#ffffff',
      },
    });
  },

  info: (message, options = {}) => {
    return toast(message, {
      ...options,
      icon: 'ℹ️',
      style: {
        background: '#ffffff',
        color: '#0f172a',
        border: '1px solid #bae6fd',
        borderRadius: '12px',
        padding: '12px 16px',
        fontSize: '13px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
        ...options.style,
      },
    });
  },

  promise: (promise, messages, options = {}) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading || 'Processing...',
        success: messages.success || 'Success!',
        error: messages.error || 'Something went wrong.',
      },
      {
        style: {
          background: '#ffffff',
          color: '#0f172a',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '12px 16px',
          fontSize: '13px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
          ...options.style,
        },
        ...options,
      }
    );
  },

  dismiss: (toastId) => toast.dismiss(toastId),
};

export default notify;
