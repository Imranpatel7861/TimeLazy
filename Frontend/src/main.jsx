import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '@fortawesome/fontawesome-free/css/all.min.css';
import App from './App';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from './Component/Theme/ThemeContext' // Adjust path if ThemeContext.js is elsewhere


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);