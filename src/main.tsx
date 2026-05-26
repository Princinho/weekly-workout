import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './WikilyApp'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
