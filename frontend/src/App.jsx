import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Register from './pages/Register'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path='/register' element={<Register />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
