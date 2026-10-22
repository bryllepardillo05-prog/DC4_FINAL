import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Departments() {
    const { user } = useAuth();
    const [departments, setDepartments] = useState([]);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ name: '', code: '', description: '' });

    const isAdmin = user?.role === 'admin';

    const loadDepartments = async () => {
        try {
            const response = await api.get('/departments');
            setDepartments(response.data);
        } catch {
            setError('Could not load departments.');
        }
    };

    useEffect(() => {
        api.get('/departments')
            .then((response) => setDepartments(response.data))
            .catch(() => setError('Could not load departments.'));
    }, []);

    const addDepartment = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError('');
        try {
            await api.post('/departments', form);
            setForm({ name: '', code: '', description: '' });
            loadDepartments();
        } catch (requestError) {
            const validation = requestError.response?.data?.errors;
            setError(validation
                ? Object.values(validation).flat().join(' ')
                : requestError.response?.data?.message || 'Could not create department.');
        } finally {
            setSaving(false);
        }
    };

    const deleteDepartment = async (department) => {
        if (!window.confirm(`Delete "${department.name}"? This cannot be undone.`)) return;
        setError('');
        try {
            await api.delete(`/departments/${department.id}`);
            loadDepartments();
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Could not delete this department.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Departments</h1>
                    <p className="mt-1.5 text-sm text-slate-600">Manage the departments that own documents.</p>
                </div>
                <Link to="/dashboard" className="rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    ← Back to overview
                </Link>
            </div>

            {error && <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

            {isAdmin && (
                <section className="rounded-lg border border-slate-200 bg-white p-5 sm:p-7">
                    <h2 className="text-lg font-semibold text-slate-900">Add department</h2>
                    <form onSubmit={addDepartment} className="mt-4 grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="text-sm font-medium text-slate-700">Name</label>
                            <input
                                required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700">Code</label>
                            <input
                                required maxLength="50" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })}
                                className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="text-sm font-medium text-slate-700">Description (optional)</label>
                            <textarea rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                                className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
                        </div>
                        <div className="sm:col-span-2 flex justify-end">
                            <button disabled={saving} type="submit" className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">
                                {saving ? 'Saving...' : 'Save department'}
                            </button>
                        </div>
                    </form>
                </section>
            )}

            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                {departments.length ? (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                            <tr>
                                <th className="px-5 py-3 font-semibold">Department</th>
                                <th className="px-5 py-3 font-semibold">Code</th>
                                <th className="px-5 py-3 font-semibold">Description</th>
                                {isAdmin && <th className="px-5 py-3 text-right font-semibold">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {departments.map((department) => (
                                <tr key={department.id} className="hover:bg-slate-50">
                                    <td className="px-5 py-4 font-medium text-slate-900">{department.name}</td>
                                    <td className="px-5 py-4 text-slate-600">{department.code}</td>
                                    <td className="px-5 py-4 text-slate-600">{department.description || '—'}</td>
                                    {isAdmin && (
                                        <td className="px-5 py-4 text-right">
                                            <button
                                                type="button"
                                                onClick={() => deleteDepartment(department)}
                                                className="font-medium text-red-600 hover:text-red-800"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="px-5 py-12 text-center">
                        <p className="font-medium text-slate-800">No departments yet</p>
                    </div>
                )}
            </section>
        </div>
    );
}
