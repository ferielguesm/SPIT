import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster
      position="bottom-center"
      toastOptions={{
        style: {
          background: '#212E53',
          color: '#fff',
          borderRadius: '12px',
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
          fontWeight: 600,
          padding: '12px 20px',
        },
        success: { iconTheme: { primary: '#4A919E', secondary: '#fff' } },
        error:   { iconTheme: { primary: '#ba1a1a', secondary: '#fff' } },
      }}
    />
  );
}
