import React from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans">
            <Sidebar isOpen={isSidebarOpen} />
            <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
                <main className="flex-1 p-6 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
