import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navClass = ({ isActive }) =>
    `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
        isActive
            ? 'bg-slate-100 text-slate-950'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
    }`;

export default function Layout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login', { replace: true });
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    <div className="flex min-h-16 flex-wrap items-center justify-between gap-x-6 gap-y-3 py-3">
                        <NavLink to="/dashboard" className="flex items-center gap-2.5 text-lg font-semibold tracking-tight text-slate-950">
                            <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">D</span>
                            DocuManager
                        </NavLink>
                        <nav aria-label="Main navigation" className="order-3 flex w-full items-center gap-1 border-t border-slate-100 pt-2 sm:order-none sm:w-auto sm:border-0 sm:pt-0">
                            <NavLink to="/dashboard" className={navClass}>Overview</NavLink>
                            <NavLink to="/departments" className={navClass}>Departments</NavLink>
                            <NavLink to="/documents" end className={navClass}>Documents</NavLink>
                            <NavLink
                                to="/documents/new"
                                className="ml-1 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
                            >
                                New document
                            </NavLink>
                        </nav>
                        <div className="flex items-center gap-3">
                            <div className="hidden text-right sm:block">
                                <p className="text-sm font-medium text-slate-800">{user?.name}</p>
                                <p className="text-xs capitalize text-slate-500">{user?.role}</p>
                            </div>
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950"
                            >
                                Log out
                            </button>
                        </div>
                    </div>
                </div>
            </header>
            <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-9">
                <Outlet />
            </main>
        </div>
    );
}
