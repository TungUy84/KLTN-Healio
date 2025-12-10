import React from 'react';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main style={{
        marginLeft: '260px',
        flex: 1,
        minHeight: '100vh',
        backgroundColor: '#F8F9FA',
        padding: '32px',
      }}>
        {children}
      </main>
    </div>
  );
};

