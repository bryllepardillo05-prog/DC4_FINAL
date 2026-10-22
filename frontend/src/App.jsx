import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import DocumentForm from './pages/DocumentForm';
import DocumentDetail from './pages/DocumentDetail';
import Departments from './pages/Departments';
import Layout from './components/Layout';

const ProtectedRoute = () => {
    const { user, loading } = useAuth();
    if (loading) return <div className="p-8 text-center text-slate-600">Loading your account...</div>;
    return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route element={<ProtectedRoute />}>
                    <Route element={<Layout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/departments" element={<Departments />} />
                        <Route path="/documents" element={<Documents />} />
                        <Route path="/documents/new" element={<DocumentForm />} />
                        <Route path="/documents/:id" element={<DocumentDetail />} />
                        <Route path="/documents/:id/edit" element={<DocumentForm />} />
                    </Route>
                    </Route>
                    <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}