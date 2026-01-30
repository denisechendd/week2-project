import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

import "bootstrap/dist/css/bootstrap.min.css"; // 外觀
import "bootstrap/dist/js/bootstrap.bundle.min.js"; // 行為 / 互動

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
