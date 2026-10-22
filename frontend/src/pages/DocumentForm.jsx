import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const fieldClass = 'mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100';

export default function DocumentForm() {
    const { id } = useParams();
    const isEditing = Boolean(id);
    const { user } = useAuth();
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [form, setForm] = useState({
        title: '', document_number: '', category_id: '', department_id: '', remarks: '',
    });
    const [file, setFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        Promise.all([
            api.get('/categories'),
            api.get('/departments'),
            isEditing ? api.get(`/documents/${id}`) : Promise.resolve(null),
        ]).then(([categoryResponse, departmentResponse, documentResponse]) => {
            setCategories(categoryResponse.data);
            setDepartments(departmentResponse.data);
            if (documentResponse) {
                const document = documentResponse.data;
                if (user?.role !== 'admin' && user?.id !== document.user_id) {
                    navigate(`/documents/${id}`, { replace: true });
                    return;
                }
                setForm({
                    title: document.title ?? '',
                    document_number: document.document_number ?? '',
                    category_id: String(document.category_id ?? ''),
                    department_id: String(document.department_id ?? ''),
                    remarks: document.remarks ?? '',
                });
            }
        }).catch((requestError) => {
            setError(requestError.response?.data?.message || 'Could not load the form data.');
        }).finally(() => setLoading(false));
    }, [id, isEditing, navigate, user?.id, user?.role]);

    const onDrop = useCallback((acceptedFiles) => {
        const chosen = acceptedFiles?.[0] ?? null;
        setFile(chosen);
    }, []);

    const onDragOver = (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
        setDragActive(true);
    };

    const onDragLeave = (event) => {
        event.preventDefault();
        setDragActive(false);
    };

    const onDropZone = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setDragActive(false);
        const files = event.dataTransfer?.files;
        if (files && files.length > 0) onDrop(Array.from(files));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!file && !isEditing) {
            setError('Please select or drop a document file.');
            return;
        }
        setSaving(true);
        setError('');
        const data = new FormData();
        Object.entries(form).forEach(([key, value]) => data.append(key, value));
        if (file) data.append('file', file);
        if (isEditing) data.append('_method', 'PUT');
        try {
            const response = await api.post(isEditing ? `/documents/${id}` : '/documents', data);
            navigate(isEditing ? `/documents/${id}` : `/documents/${response.data.document.id}`, { replace: true });
        } catch (requestError) {
            const validation = requestError.response?.data?.errors;
            setError(validation
                ? Object.values(validation).flat().join(' ')
                : requestError.response?.data?.message || 'Could not save this document.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <p className="text-slate-600">Loading document...</p>;

    const fileName = file?.name ?? (isEditing ? 'No new file chosen' : 'No file chosen');

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            <div>
                <Link to={isEditing ? `/documents/${id}` : '/documents'} className="text-sm font-medium text-slate-600 hover:text-indigo-700">← Back to documents</Link>
                <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">{isEditing ? 'Edit document' : 'New document'}</h1>
                <p className="mt-1.5 text-sm text-slate-600">{isEditing ? 'Update the details below.' : 'Add a file and a few details to submit it for review.'}</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-slate-200 bg-white p-5 sm:p-7">
                {error && <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
                <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
                    <label className="text-sm font-medium text-slate-700 sm:col-span-2">
                        Title
                        <input required maxLength="255" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className={fieldClass} />
                    </label>
                    <label className="text-sm font-medium text-slate-700">
                        Document number
                        <input required disabled={isEditing} maxLength="255" value={form.document_number} onChange={(event) => setForm({ ...form, document_number: event.target.value })}
                            className={`${fieldClass} disabled:bg-slate-50 disabled:text-slate-500`} />
                    </label>
                    <label className="text-sm font-medium text-slate-700">
                        Category
                        <select required value={form.category_id} onChange={(event) => setForm({ ...form, category_id: event.target.value })} className={fieldClass}>
                            <option value="">Choose a category</option>
                            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                        </select>
                    </label>
                    <label className="text-sm font-medium text-slate-700 sm:col-span-2">
                        Department
                        <select required value={form.department_id} onChange={(event) => setForm({ ...form, department_id: event.target.value })} className={fieldClass}>
                            <option value="">Choose a department</option>
                            {departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
                        </select>
                    </label>
                    <label className="text-sm font-medium text-slate-700 sm:col-span-2">
                        {isEditing ? 'Replace file (optional)' : 'Document file'}
                        <div
                            role="presentation"
                            onDragOver={onDragOver}
                            onDragEnter={onDragOver}
                            onDragLeave={onDragLeave}
                            onDrop={onDropZone}
                            className={`mt-1.5 flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 transition-colors ${
                                dragActive
                                    ? 'border-indigo-500 bg-indigo-50'
                                    : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
                            }`}
                        >
                            <svg className="h-7 w-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16V8a4 4 0 018 0v8M7 16h10M7 16l3 3m-3-3l3-3m7-7v8a4 4 0 01-8 0V8" />
                            </svg>
                            <input
                                type="file"
                                accept=".pdf,.docx,.xlsx"
                                onChange={(event) => onDrop(event.target.files ? Array.from(event.target.files) : [])}
                                className="sr-only"
                                id="document-file-input"
                            />
                            <span className="text-sm font-medium text-indigo-600">
                                {file ? 'Change file' : 'Drag & drop or browse'}
                            </span>
                            <p className="mt-1 text-xs text-slate-500">PDF, DOCX, or XLSX; maximum size 10 MB.</p>
                        </div>
                        <p className={`mt-1.5 text-xs ${file ? 'text-slate-700' : 'text-slate-500'}`}>{fileName}</p>
                    </label>
                    <label className="text-sm font-medium text-slate-700 sm:col-span-2">
                        Remarks (optional)
                        <textarea rows="4" value={form.remarks} onChange={(event) => setForm({ ...form, remarks: event.target.value })} className={fieldClass} />
                    </label>
                </div>
                <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                    <Link to={isEditing ? `/documents/${id}` : '/documents'} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</Link>
                    <button disabled={saving} type="submit" className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">
                        {saving ? 'Saving...' : isEditing ? 'Save changes' : 'Submit document'}
                    </button>
                </div>
            </form>
        </div>
    );
}
