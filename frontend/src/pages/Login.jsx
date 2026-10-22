import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(
                err.response?.data?.errors?.email?.[0] ||
                err.response?.data?.message ||
                (err.request
                    ? 'Hindi makakonekta sa server. Tiyaking tumatakbo ang Laravel backend.'
                    : 'May mali sa iyong pag-login.')
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
            <main className="w-full max-w-sm">
                <div className="mb-8 text-center">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white">D</div>
                    <h1 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">Welcome back</h1>
                    <p className="mt-2 text-sm text-slate-600">Sign in to manage your documents.</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                    {error && <div role="alert" className="mb-5 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email address</label>
                            <input id="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required
                                className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
                            <input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required
                                className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
                        </div>
                        <button type="submit" disabled={isSubmitting} className="w-full rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">
                            {isSubmitting ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>
                </div>
                <p className="mt-6 text-center text-xs text-slate-500">Secure document management</p>
            </main>
        </div>
    );
}