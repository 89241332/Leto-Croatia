import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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
import ApplyPage from './pages/ApplyPage'
import MyApplications from './pages/MyApplications'
import JobApplications from './pages/JobApplications'
import EmployeeProfileView from './pages/EmployeeProfileView'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path='/' element={<Navigate to="/browse" replace />} />
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
          <Route path="/browse" element={<JobOffers />} />
          <Route path="/browse/search" element={<SearchResults />} />
          <Route path="/browse/:id" element={<JobOfferDetailEmployee />} />
          <Route path="/browse/:id/apply" element={<ApplyPage />} />
          <Route path="/my-applications" element={<MyApplications />} />
          <Route path="/job-offers/:id/applications" element={<JobApplications />} />
          <Route path="/profile" element={<EmployeeProfileView />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
