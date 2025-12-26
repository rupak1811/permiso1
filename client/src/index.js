import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Apply theme immediately before React renders to prevent flash
(function() {
  try {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const root = document.documentElement;
    const body = document.body;

    if (savedTheme === 'light') {
      root.classList.remove('dark');
      body.classList.add('light');
    } else {
      root.classList.add('dark');
      body.classList.remove('light');
    }
  } catch (e) {
    // Ignore errors
  }
})();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
