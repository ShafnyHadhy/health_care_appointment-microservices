import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import AdminPage from './pages/adminPage'
import HomePage from './pages/homePage'
import DoctorPage from './pages/doctorPage'
import LoginPage from './pages/loginPage'
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
          <Route path="/doctor/*" element={<DoctorPage />} />
          
        </Routes>
      </div>

    </BrowserRouter>
  )
}

export default App
