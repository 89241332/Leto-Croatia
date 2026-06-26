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
import CreateEditJobOffer from './pages/CreateEditJobOffer'
import JobOfferDetail from './pages/JobOfferDetail'
import JobOffers from './pages/JobOffers'
import SearchResults from './pages/SearchResults'
import JobOfferDetailEmployee from './pages/JobOfferDetailEmployee'

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
          <Route path='/job-offers/create' element={<CreateEditJobOffer />} />
          <Route path='/job-offers/:id/edit' element={<CreateEditJobOffer />} />
          <Route path='/job-offers/:id' element={<JobOfferDetail />} />
          <Route path="/job-offers" element={<JobOffers />} />
          <Route path="/job-offers/search" element={<SearchResults />} />
          <Route path="/job-offers/:id" element={<JobOfferDetailEmployee />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
