import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './style.css'
import { initClickParticles } from './fx/clickParticles.js';
initClickParticles();


// INITIALIZE ONCE
initClickParticles();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
