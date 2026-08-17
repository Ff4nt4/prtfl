import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // AGGIUNGI QUESTO
import App from './App.jsx'
import './index.css' // O il tuo file CSS principale

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* AVVOLGI App CON BrowserRouter */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
