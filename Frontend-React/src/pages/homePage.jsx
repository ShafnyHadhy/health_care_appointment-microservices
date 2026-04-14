import { Route, Routes } from "react-router-dom";
import Header from "../components/header";
import HomeBody from "../components/homeBody";
import Footer from "../components/footer";
import FindDoctor from "./findDoctor";
import PatientDashboard from "./patient/patientDashboard";
import ConfirmBooking from "./patient/confirmAppointment";

export default function HomePage() {
    return (
        <div>
            <Header/>
            <Routes>
                <Route index element={
                    <>
                        <HomeBody/>
                    </>
                } />

                <Route path="find-doctor" element={<FindDoctor />} /> 
                <Route path="patient-dashboard" element={<PatientDashboard/>} />
                <Route path="confirm-booking" element={<ConfirmBooking />} />

                <Route path="*" element={<h1>404 not found</h1>} />
            </Routes>
            
            <Footer/>
        </div>
    )
}

