import toast from 'react-hot-toast';

/**
 * Styled Toast Notification Helpers matching the InternHub Design System.
 */
export const notify = {
  success: (message, options = {}) => {
    return toast.success(message, {
      ...options,
      style: {
        background: '#0f172a',
        color: '#f8fafc',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: '12px',
        padding: '12px 16px',
        fontSize: '13px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
        ...options.style,
      },
      iconTheme: {
        primary: '#10b981',
        secondary: '#0f172a',
      },
    });
  },

  error: (message, options = {}) => {
    return toast.error(message, {
      ...options,
      style: {
        background: '#0f172a',
        color: '#f8fafc',
        border: '1px solid rgba(244, 63, 94, 0.3)',
        borderRadius: '12px',
        padding: '12px 16px',
        fontSize: '13px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
        ...options.style,
      },
      iconTheme: {
        primary: '#f43f5e',
        secondary: '#0f172a',
      },
    });
  },

  info: (message, options = {}) => {
    return toast(message, {
      ...options,
      icon: 'ℹ️',
      style: {
        background: '#0f172a',
        color: '#f8fafc',
        border: '1px solid rgba(14, 165, 233, 0.3)',
        borderRadius: '12px',
        padding: '12px 16px',
        fontSize: '13px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
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
          background: '#0f172a',
          color: '#f8fafc',
          border: '1px solid #334155',
          borderRadius: '12px',
          padding: '12px 16px',
          fontSize: '13px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
          ...options.style,
        },
        ...options,
      }
    );
  },

  dismiss: (toastId) => toast.dismiss(toastId),
};

export default notify;
