import { Route, Routes } from "react-router-dom";
import Header from "../components/header";
import HomeBody from "../components/homeBody";
import Footer from "../components/footer";

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

                {/* <Route path="product" element={<ProductPage />} /> 
                <Route path="about" element={<AboutUs/>} />
                <Route path="contact" element={<ContactUs/>} />
                <Route path="overview/:id" element={<ProductOverview/>}/>
                <Route path="cart" element={<CartPage/>}/>
                <Route path="checkout" element={<CheckoutPage/>}/>
                <Route path="feedback" element={<SubmitFeedback />} />
                <Route path="profile" element={<UserProfile />} />
                <Route path="orders/id/:orderID" element={<ViewOrder />} /> */}

                <Route path="*" element={<h1>404 not found</h1>} />
            </Routes>
            
            <Footer/>
        </div>
    )
}

