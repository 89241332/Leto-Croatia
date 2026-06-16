import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Register from './pages/Register'
import RegisterEmployee from './pages/RegisterEmployee'
import RegisterEmployer from './pages/RegisterEmployer'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path='/register' element={<Register />} />
          <Route path='/register/employee' element={<RegisterEmployee />} />
          <Route path='/register/employer' element={<RegisterEmployer />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
