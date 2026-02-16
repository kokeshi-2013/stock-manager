import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Landing from './pages/Landing'
import TopPage from './pages/TopPage'
import NewItemPage from './pages/NewItemPage'
import EditItemPage from './pages/EditItemPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<TopPage />} />
        <Route path="/app/new" element={<NewItemPage />} />
        <Route path="/app/edit/:id" element={<EditItemPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
