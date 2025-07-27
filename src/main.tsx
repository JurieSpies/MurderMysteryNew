import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

console.log('🚀 Main.tsx loading...');

const rootElement = document.getElementById('root');
console.log('📍 Root element:', rootElement);

if (rootElement) {
  console.log('✅ Creating React root...');
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  console.log('✅ React app rendered');
} else {
  console.error('❌ Root element not found!');
}
