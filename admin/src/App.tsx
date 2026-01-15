import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RawFoodList from './pages/raw-food/RawFoodList';
import RawFoodForm from './pages/raw-food/RawFoodForm';
import RawFoodImport from './pages/raw-food/RawFoodImport';
import RawFoodDetail from './pages/raw-food/RawFoodDetail';
import AdminLayout from './layouts/AdminLayout';
import { authService } from './services/authService';
import './App.css';

// Protected Route Component
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
    return authService.isAuthenticated() ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Dashboard Routes */}
        <Route 
            path="/dashboard" 
            element={
                <PrivateRoute>
                    <AdminLayout>
                        <Dashboard />
                    </AdminLayout>
                </PrivateRoute>
            } 
        />

        {/* Raw Food Routes */}
        <Route 
            path="/raw-foods" 
            element={
                <PrivateRoute>
                    <AdminLayout>
                        <RawFoodList />
                    </AdminLayout>
                </PrivateRoute>
            } 
        />
        <Route 
            path="/raw-foods/new" 
            element={
                <PrivateRoute>
                    <AdminLayout>
                        <RawFoodForm />
                    </AdminLayout>
                </PrivateRoute>
            } 
        />
         <Route 
            path="/raw-foods/import" 
            element={
                <PrivateRoute>
                    <AdminLayout>
                        <RawFoodImport />
                    </AdminLayout>
                </PrivateRoute>
            } 
        />
        <Route 
            path="/raw-foods/:id" 
            element={
                <PrivateRoute>
                    <AdminLayout>
                        <RawFoodDetail />
                    </AdminLayout>
                </PrivateRoute>
            } 
        />
        <Route 
            path="/raw-foods/edit/:id" 
            element={
                <PrivateRoute>
                    <AdminLayout>
                        <RawFoodForm />
                    </AdminLayout>
                </PrivateRoute>
            } 
        />
        
        {/* Placeholder Routes for Sidebar Links */}
        <Route path="/foods" element={<PrivateRoute><AdminLayout><h1>Quản lý Món ăn (Coming Soon)</h1></AdminLayout></PrivateRoute>} />
        <Route path="/users" element={<PrivateRoute><AdminLayout><h1>Quản lý Account (Coming Soon)</h1></AdminLayout></PrivateRoute>} />
        <Route path="/statistics" element={<PrivateRoute><AdminLayout><h1>Thống kê Apps (Coming Soon)</h1></AdminLayout></PrivateRoute>} />

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
