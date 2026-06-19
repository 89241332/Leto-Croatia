import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Register from './pages/Register'
import RegisterEmployee from './pages/RegisterEmployee'
import RegisterEmployer from './pages/RegisterEmployer'
import Login from './pages/Login'
import ResetPassword from './pages/ResetPassword'
import EmployeeProfile from './pages/EmployeeProfile'

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
          <Route path='/profile' element={<EmployeeProfile />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
