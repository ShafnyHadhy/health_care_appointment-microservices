import { Link } from "react-router-dom";

export default function DocterPage() {
    return (
        <div className="w-full h-screen flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold">Doctor Dashboard</h1>
            <p className="mt-4 text-lg text-gray-700">Welcome to the doctor dashboard! Here you can manage your patients, view appointments, and update your profile.</p>
            <Link to="/doctor-appointments" className="mt-6 px-4 py-2 bg-primary text-white rounded hover:bg-primary/80 transition">View Appointments</Link>
        </div>
    );
}