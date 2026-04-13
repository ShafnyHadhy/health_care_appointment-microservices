import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AdminPage from './pages/adminPage'
import HomePage from './pages/homePage'
import LoginPage from './pages/loginPage'
import PaymentPage from './pages/payment/PaymentPage'
import PaymentStatusPage from './pages/payment/PaymentStatusPage'
import PaymentHistory from './pages/payment/PaymentHistory'
import SuccessPage from './pages/payment/SuccessPage'
import CancelPage from './pages/payment/CancelPage'
import { Toaster } from 'react-hot-toast'
import ProviderPage from './pages/providerPage'
import RoleSelection from './components/roleSelection'
import PatientRegister from './components/patientRegister'
import DoctorRegister from './components/doctorRegister'

function App() {

  return (
    <BrowserRouter>

      <div className="w-full ">

        <Toaster position="top-right" />

        <Routes path="/">

          <Route path="/*" element={<HomePage />} />
          <Route path="/patient-register" element={<PatientRegister />} />
          <Route path="/doctor-register" element={<DoctorRegister />} />
          <Route path="/role-selection" element={<RoleSelection />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin/*" element={<AdminPage />} />
          <Route path="/provider/*" element={<ProviderPage />} />
          <Route path="/payment/:appointmentId" element={<PaymentPage />} />
          <Route path="/payment-status/:appointmentId" element={<PaymentStatusPage />} />
          <Route path="/payment-history" element={<PaymentHistory />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/cancel" element={<CancelPage />} />
        </Routes>
      </div>

    </BrowserRouter>
  )
}

export default App
