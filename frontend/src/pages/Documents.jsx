import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const statuses = ['Pending Review', 'Under Review', 'Approved', 'Needs Revision', 'Archived'];

export default function Documents() {
    const { user } = useAuth();
    const [page, setPage] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchInput, setSearchInput] = useState('');

    const loadDocuments = async (requestedPage = currentPage) => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/documents', {
                params: {
                    page: requestedPage,
                    search: search || undefined,
                    status: status || undefined,
                    category_id: categoryId || undefined,
                },
            });
            setPage(response.data);
        } catch {
            setError('Could not load documents. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        api.get('/categories')
            .then((response) => setCategories(response.data))
            .catch(() => setError('Could not load document categories.'));
    }, []);

    useEffect(() => {
        let cancelled = false;
        api.get('/documents', {
            params: {
                page: currentPage,
                search: search || undefined,
                status: status || undefined,
                category_id: categoryId || undefined,
            },
        }).then((response) => {
            if (!cancelled) setPage(response.data);
        }).catch(() => {
            if (!cancelled) setError('Could not load documents. Please try again.');
        }).finally(() => {
            if (!cancelled) setLoading(false);
        });
        return () => { cancelled = true; };
    }, [categoryId, currentPage, search, status]);

    const deleteDocument = async (document) => {
        if (!window.confirm(`Delete "${document.title}"? This cannot be undone.`)) return;
        setError('');
        try {
            await api.delete(`/documents/${document.id}`);
            await loadDocuments();
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Could not delete this document.');
        }
    };

    const canManage = (document) => user?.role === 'admin' || user?.id === document.user_id;

    const applySearch = (event) => {
        event.preventDefault();
        setCurrentPage(1);
        setSearch(searchInput.trim());
    };

    const changePage = (nextPage) => {
        setLoading(true);
        setCurrentPage(nextPage);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Documents</h1>
                    <p className="mt-1.5 text-sm text-slate-600">Find and manage submitted files.</p>
                </div>
                <Link to="/documents/new" className="rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700">
                    + New document
                </Link>
            </div>

            {error && <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

            <section className="rounded-lg border border-slate-200 bg-white p-4">
                <form onSubmit={applySearch} className="grid gap-3 sm:grid-cols-[minmax(220px,1fr)_190px_190px_auto]">
                    <label className="sr-only" htmlFor="document-search">Search documents</label>
                    <input
                        id="document-search"
                        value={searchInput}
                        onChange={(event) => setSearchInput(event.target.value)}
                        placeholder="Search title or document number"
                        className="rounded-md border border-slate-300 px-3 py-2.5 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    />
                    <label className="sr-only" htmlFor="document-status">Filter by status</label>
                    <select id="document-status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(null); setCurrentPage(1); }} className="rounded-md border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100">
                        <option value="">All statuses</option>
                        {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                    <label className="sr-only" htmlFor="document-category">Filter by category</label>
                    <select id="document-category" value={categoryId} onChange={(event) => { setCategoryId(event.target.value); setPage(null); setCurrentPage(1); }} className="rounded-md border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100">
                        <option value="">All categories</option>
                        {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                    </select>
                    <button type="submit" className="rounded-md bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-700">Search</button>
                </form>
            </section>

            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                {loading ? (
                    <p className="p-8 text-center text-slate-500">Loading documents...</p>
                ) : page?.data?.length ? (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[760px] text-left text-sm">
                                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                    <tr>
                                        <th className="px-5 py-3 font-semibold">Document</th>
                                        <th className="px-5 py-3 font-semibold">Category / department</th>
                                        <th className="px-5 py-3 font-semibold">Submitted by</th>
                                        <th className="px-5 py-3 font-semibold">Status</th>
                                        <th className="px-5 py-3 text-right font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {page.data.map((document) => (
                                        <tr key={document.id} className="hover:bg-slate-50">
                                            <td className="px-5 py-4">
                                                <Link to={`/documents/${document.id}`} className="font-semibold text-indigo-700 hover:text-indigo-900">{document.title}</Link>
                                                <p className="mt-1 text-xs text-slate-500">{document.document_number}</p>
                                            </td>
                                            <td className="px-5 py-4 text-slate-600">
                                                <p>{document.category?.name ?? '—'}</p>
                                                <p className="mt-1 text-xs text-slate-500">{document.department?.name ?? '—'}</p>
                                            </td>
                                            <td className="px-5 py-4 text-slate-600">{document.user?.name ?? '—'}</td>
                                            <td className="px-5 py-4">
                                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{document.status}</span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex justify-end gap-3">
                                                    <Link to={`/documents/${document.id}`} className="font-medium text-indigo-600 hover:text-indigo-800">View</Link>
                                                    {canManage(document) && <>
                                                        <Link to={`/documents/${document.id}/edit`} className="font-medium text-slate-600 hover:text-slate-900">Edit</Link>
                                                        <button type="button" onClick={() => deleteDocument(document)} className="font-medium text-red-600 hover:text-red-800">Delete</button>
                                                    </>}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-4 text-sm text-slate-600">
                            <span>Showing {page.from ?? 0}–{page.to ?? 0} of {page.total} documents</span>
                            <div className="flex gap-2">
                                <button type="button" disabled={!page.prev_page_url} onClick={() => changePage(page.current_page - 1)} className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
                                <button type="button" disabled={!page.next_page_url} onClick={() => changePage(page.current_page + 1)} className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-40">Next</button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="px-5 py-12 text-center">
                        <p className="font-medium text-slate-800">No documents found</p>
                        <p className="mt-1 text-sm text-slate-500">Try changing your filters, or create a new document.</p>
                    </div>
                )}
            </section>
        </div>
    );
}
