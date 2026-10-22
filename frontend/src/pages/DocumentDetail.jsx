import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const statuses = ['Pending Review', 'Under Review', 'Approved', 'Needs Revision', 'Archived'];

export default function DocumentDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const [document, setDocument] = useState(null);
    const [status, setStatus] = useState('');
    const [remarks, setRemarks] = useState('');
    const [error, setError] = useState('');
    const [savingStatus, setSavingStatus] = useState(false);

    useEffect(() => {
        api.get(`/documents/${id}`)
            .then((response) => setDocument(response.data))
            .catch(() => setError('Could not load this document.'));
    }, [id]);

    const canManage = user?.role === 'admin' || user?.id === document?.user_id;

    const updateStatus = async (event) => {
        event.preventDefault();
        setSavingStatus(true);
        setError('');
        try {
            await api.patch(`/documents/${id}/status`, { status, remarks });
            const response = await api.get(`/documents/${id}`);
            setDocument(response.data);
            setRemarks('');
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Could not update document status.');
        } finally {
            setSavingStatus(false);
        }
    };

    if (error && !document) return <div role="alert" className="rounded-lg bg-red-50 p-4 text-red-700">{error}</div>;
    if (!document) return <p className="text-slate-600">Loading document...</p>;

    const fileUrl = `${api.defaults.baseURL.replace(/\/api\/?$/, '')}/storage/${document.file_path}`;

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <Link to="/documents" className="text-sm font-medium text-slate-600 hover:text-indigo-700">← Back to documents</Link>
            {error && <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            <section className="rounded-lg border border-slate-200 bg-white p-5 sm:p-7">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <p className="text-sm font-medium text-slate-500">{document.document_number}</p>
                        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">{document.title}</h1>
                        <p className="mt-2 text-sm text-slate-500">Submitted by {document.user?.name ?? 'Unknown'} · {document.date_submitted ? new Date(document.date_submitted).toLocaleDateString() : 'Date unavailable'}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">{document.status}</span>
                </div>
                <dl className="mt-7 grid gap-5 border-t border-slate-100 pt-6 sm:grid-cols-2">
                    <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Category</dt><dd className="mt-1 text-slate-900">{document.category?.name ?? '—'}</dd></div>
                    <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Department</dt><dd className="mt-1 text-slate-900">{document.department?.name ?? '—'}</dd></div>
                    <div className="sm:col-span-2"><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Remarks</dt><dd className="mt-1 whitespace-pre-wrap text-slate-900">{document.remarks || 'No remarks provided.'}</dd></div>
                    <div className="sm:col-span-2">
                        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Attached file</dt>
                        <dd className="mt-1"><a href={fileUrl} target="_blank" rel="noreferrer" className="font-medium text-indigo-600 hover:text-indigo-800">Open document file</a></dd>
                    </div>
                </dl>
                {canManage && (
                    <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-100 pt-5">
                        <Link to={`/documents/${id}/edit`} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Edit document</Link>
                        {user?.role === 'admin' && (
                            <form onSubmit={updateStatus} className="flex flex-wrap items-center gap-2">
                                <label htmlFor="new-status" className="sr-only">Update status</label>
                                <select id="new-status" required value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100">
                                    <option value="">Change status...</option>
                                    {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
                                </select>
                                <label htmlFor="status-remarks" className="sr-only">Status remarks</label>
                                <input id="status-remarks" value={remarks} onChange={(event) => setRemarks(event.target.value)} placeholder="Optional status remarks" className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
                                <button disabled={savingStatus || !status} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">{savingStatus ? 'Updating...' : 'Update status'}</button>
                            </form>
                        )}
                    </div>
                )}
            </section>
            <section className="rounded-lg border border-slate-200 bg-white p-5 sm:p-7">
                <h2 className="font-semibold text-slate-900">Activity history</h2>
                {document.logs?.length ? (
                    <ol className="mt-4 space-y-4">
                        {document.logs.map((log) => (
                            <li key={log.id} className="border-l-2 border-indigo-200 pl-4">
                                <p className="font-medium text-slate-800">{log.status_action}</p>
                                <p className="mt-1 text-sm text-slate-500">{log.actor?.name ?? 'System'} · {new Date(log.created_at).toLocaleString()}</p>
                                {log.remarks && <p className="mt-1 text-sm text-slate-600">{log.remarks}</p>}
                            </li>
                        ))}
                    </ol>
                ) : <p className="mt-3 text-sm text-slate-500">No activity has been recorded yet.</p>}
            </section>
        </div>
    );
}
