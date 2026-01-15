import React from 'react';
import Sidebar from '../components/Sidebar';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 ml-[260px] p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;
