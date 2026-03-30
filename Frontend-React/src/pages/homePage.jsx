import { Route, Routes } from "react-router-dom";
import Header from "../components/header";

export default function HomePage() {
    return (
        <div className="w-full h-full">

            <Header/>

            <Routes path="/">
                <Route path="/" element={<h1 className="text-3xl font-bold text-primary">Welcome to the Home Page</h1>} />
                <Route path="/products" element={<h1 className="text-3xl font-bold text-primary">Products Page</h1>} />
                <Route path="/about" element={<h1 className="text-3xl font-bold text-primary">About Page</h1>} />
                <Route path="/contact" element={<h1 className="text-3xl font-bold text-primary">Contact Page</h1>} />
                <Route path="/*" element={<h1 className="text-3xl font-bold text-primary">404 Not Found</h1>} />
            </Routes>

        </div>
    )
}