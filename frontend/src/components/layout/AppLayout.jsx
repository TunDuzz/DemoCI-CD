import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function AppLayout() {
    return (
        <div className="min-h-screen bg-dark-bg text-white relative font-sans">
            <Navbar />

            <main className="w-full flex flex-col min-h-screen">
                {/* Render child routes here */}
                <Outlet />
            </main>

            <Footer />
        </div>
    );
}
