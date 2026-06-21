import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Register from './pages/Register'
import RegisterEmployee from './pages/RegisterEmployee'
import RegisterEmployer from './pages/RegisterEmployer'
import Login from './pages/Login'
import ResetPassword from './pages/ResetPassword'
import EmployeeProfile from './pages/EmployeeProfile'
import EmployerProfile from './pages/EmployerProfile'
import MyJobOffers from './pages/MyJobOffers'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path='/register' element={<Register />} />
          <Route path='/register/employee' element={<RegisterEmployee />} />
          <Route path='/register/employer' element={<RegisterEmployer />} />
          <Route path='/login' element={<Login />} />
          <Route path='/reset-password' element={<ResetPassword />} />
          <Route path='/employee-profile' element={<EmployeeProfile />} />
          <Route path='/employer-profile' element={<EmployerProfile />} />
          <Route path='/job-offers' element={<MyJobOffers />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
