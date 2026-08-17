import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// NOTA: niente BrowserRouter qui. App.jsx usa già HashRouter al suo
// interno (necessario per il deploy statico su GitHub Pages, dove non
// esiste un vero fallback lato server per le route). Avere due Router
// annidati (uno qui e uno in App.jsx) crea conflitti tra URL reale e
// hash, ed è la causa più probabile di link rotti dopo il deploy.

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
