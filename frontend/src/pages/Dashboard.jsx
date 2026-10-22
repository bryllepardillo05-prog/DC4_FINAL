import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const statCards = [
    { key: 'total_documents', label: 'Total documents', color: 'text-slate-950' },
    { key: 'pending_approvals', label: 'Pending review', color: 'text-amber-700' },
    { key: 'approved_papers', label: 'Approved', color: 'text-emerald-700' },
    { key: 'archived_items', label: 'Archived', color: 'text-slate-600' },
];

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/dashboard')
            .then((response) => setStats(response.data))
            .catch(() => setError('Could not load dashboard data. Please try again.'));
    }, []);

    if (error) {
        return <div role="alert" className="rounded-lg bg-red-50 p-4 text-red-700">{error}</div>;
    }
    if (!stats) return <p className="text-slate-600">Loading dashboard...</p>;

    return (
        <div className="space-y-7">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Overview</h1>
                    <p className="mt-1.5 text-sm text-slate-600">A quick look at your documents and review progress.</p>
                </div>
                <Link to="/documents/new" className="rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700">
                    + New document
                </Link>
            </div>

            <section aria-label="Document statistics" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map(({ key, label, color }) => (
                    <div key={key} className="rounded-lg border border-slate-200 bg-white p-5">
                        <p className="text-sm font-medium text-slate-500">{label}</p>
                        <p className={`mt-2 text-3xl font-semibold tracking-tight ${color}`}>{stats[key] ?? 0}</p>
                    </div>
                ))}
            </section>

            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
                    <div>
                        <h2 className="font-semibold text-slate-900">Recent documents</h2>
                        <p className="mt-1 text-sm text-slate-500">Recently added to the system.</p>
                    </div>
                    <Link to="/documents" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                        View all documents
                    </Link>
                </div>
                {stats.recent_uploads?.length ? (
                    <div className="divide-y divide-slate-100">
                        {stats.recent_uploads.map((document) => (
                            <Link
                                key={document.id}
                                to={`/documents/${document.id}`}
                                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-slate-50"
                            >
                                <div>
                                    <p className="font-medium text-slate-900">{document.title}</p>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {document.document_number} · {document.category?.name ?? 'Uncategorized'}
                                    </p>
                                </div>
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                                    {document.status}
                                </span>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="px-5 py-10 text-center">
                        <p className="font-medium text-slate-700">No documents yet</p>
                        <p className="mt-1 text-sm text-slate-500">Create the first document to get started.</p>
                    </div>
                )}
            </section>
        </div>
    );
}
