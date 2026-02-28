import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { rawFoodService } from '../../services/rawFoodService';
import {
    ArrowLeft,
    UploadCloud,
    FileSpreadsheet,
    CheckCircle2,
    AlertTriangle,
    X,
    FileUp,
    Download,
    RefreshCw,
    List
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNotifications } from '../../context/NotificationContext';

const RawFoodImport: React.FC = () => {
    const navigate = useNavigate();
    const { addNotification } = useNotifications();
    const [file, setFile] = useState<File | null>(null);
    const [mode, setMode] = useState<'skip' | 'overwrite'>('skip');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            // Reset result when file changes
            setResult(null);
        }
    };

    const handleImport = async () => {
        if (!file) return;
        setLoading(true);
        setResult(null);

        try {
            const data = await rawFoodService.import(file, mode);
            setResult(data);
            toast.success("Import dữ liệu thành công!");
            addNotification({ message: 'Import dữ liệu nguyên liệu thành công', link: '/raw-foods' });
        } catch (error: any) {
            console.error('Import failed', error);
            const msg = error.response?.data?.message || error.message || "Lỗi import";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto animate-in fade-in duration-300">
            {/* Header */}
            <div className="mb-8 flex items-center gap-4">
                <Link
                    to="/raw-foods"
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 hover:text-emerald-600 transition-colors shadow-sm"
                >
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Import Nguyên liệu</h1>
                    <p className="text-sm text-gray-500 mt-1">Tải lên danh sách nguyên liệu từ file CSV</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                {!result ? (
                    <>
                        {/* 1. Upload Area */}
                        <div className="relative group mb-8">
                            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 flex flex-col items-center justify-center bg-gray-50 group-hover:bg-emerald-50/30 group-hover:border-emerald-400 transition-all cursor-pointer text-center">
                                <div className="p-4 bg-white rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform duration-300">
                                    <UploadCloud className="w-10 h-10 text-emerald-500" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800 mb-2">
                                    Kéo thả file CSV vào đây
                                </h3>
                                <p className="text-gray-500 text-sm mb-6 max-w-sm">
                                    Hoặc click để chọn file từ máy tính của bạn. Dung lượng tối đa 5MB.
                                </p>

                                {file && (
                                    <div className="animate-in fade-in zoom-in duration-200 flex items-center gap-3 bg-white px-4 py-3 rounded-xl border border-emerald-100 shadow-sm mb-4">
                                        <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                                            <FileSpreadsheet size={20} />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-bold text-gray-800">{file.name}</p>
                                            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                                        </div>
                                        <button
                                            onClick={(e) => { e.preventDefault(); setFile(null); }}
                                            className="ml-2 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                )}

                                <p className="text-xs text-gray-400">
                                    Chưa có file mẫu? <a href="/template_raw_food.csv" download className="text-emerald-600 font-bold hover:underline inline-flex items-center gap-1"><Download size={12} /> Tải xuống tại đây</a>
                                </p>
                            </div>
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                        </div>

                        {/* 2. Options */}
                        <div className="mb-8">
                            <h4 className="text-sm font-bold text-gray-700 mb-4 px-1">Tùy chọn xử lý trùng lặp (Mã số):</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${mode === 'skip' ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                                    <div className="relative flex items-center">
                                        <input
                                            type="radio"
                                            name="mode"
                                            value="skip"
                                            checked={mode === 'skip'}
                                            onChange={() => setMode('skip')}
                                            className="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-gray-300 checked:border-emerald-600 checked:bg-emerald-600 transition-all"
                                        />
                                        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                        </div>
                                    </div>
                                    <div>
                                        <span className={`block font-bold text-sm mb-1 ${mode === 'skip' ? 'text-emerald-800' : 'text-gray-800'}`}>Bỏ qua (Skip)</span>
                                        <p className="text-xs text-gray-500 leading-relaxed">Giữ nguyên dữ liệu cũ. Những dòng có mã số trùng sẽ KHÔNG được cập nhật.</p>
                                    </div>
                                </label>

                                <label className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${mode === 'overwrite' ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                                    <div className="relative flex items-center">
                                        <input
                                            type="radio"
                                            name="mode"
                                            value="overwrite"
                                            checked={mode === 'overwrite'}
                                            onChange={() => setMode('overwrite')}
                                            className="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-gray-300 checked:border-emerald-600 checked:bg-emerald-600 transition-all"
                                        />
                                        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                        </div>
                                    </div>
                                    <div>
                                        <span className={`block font-bold text-sm mb-1 ${mode === 'overwrite' ? 'text-emerald-800' : 'text-gray-800'}`}>Ghi đè (Overwrite)</span>
                                        <p className="text-xs text-gray-500 leading-relaxed">Cập nhật toàn bộ. Thông tin từ file mới sẽ đè lên dữ liệu cũ nếu trùng mã.</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* 3. Actions */}
                        <div className="flex justify-end pt-4 border-t border-gray-100">
                            <button
                                onClick={handleImport}
                                disabled={!file || loading}
                                className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-200 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <FileUp size={20} />}
                                {loading ? 'Đang xử lý...' : 'Tiến hành Import'}
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="animate-in zoom-in duration-300">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Import hoàn tất!</h2>
                            <p className="text-gray-500 mt-1">Dữ liệu đã được xử lý và lưu vào hệ thống.</p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                            <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-200">
                                <p className="text-3xl font-bold text-gray-800 mb-1">{result.stats.total}</p>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tổng số dòng</p>
                            </div>
                            <div className="bg-emerald-50 p-4 rounded-xl text-center border border-emerald-100">
                                <p className="text-3xl font-bold text-emerald-600 mb-1">{result.stats.added}</p>
                                <p className="text-xs font-bold text-emerald-800/60 uppercase tracking-wider">Thêm mới</p>
                            </div>
                            <div className="bg-amber-50 p-4 rounded-xl text-center border border-amber-100">
                                <p className="text-3xl font-bold text-amber-500 mb-1">{result.stats.updated}</p>
                                <p className="text-xs font-bold text-amber-800/60 uppercase tracking-wider">Cập nhật</p>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-xl text-center border border-blue-100">
                                <p className="text-3xl font-bold text-blue-500 mb-1">{result.stats.skipped}</p>
                                <p className="text-xs font-bold text-blue-800/60 uppercase tracking-wider">Bỏ qua</p>
                            </div>
                            <div className="bg-red-50 p-4 rounded-xl text-center border border-red-100">
                                <p className="text-3xl font-bold text-red-500 mb-1">{result.stats.errors}</p>
                                <p className="text-xs font-bold text-red-800/60 uppercase tracking-wider">Lỗi</p>
                            </div>
                        </div>

                        {result.errorDetails && result.errorDetails.length > 0 && (
                            <div className="bg-white border border-red-100 rounded-xl overflow-hidden mb-8 shadow-sm">
                                <div className="bg-red-50 px-6 py-3 border-b border-red-100 flex items-center gap-2">
                                    <AlertTriangle className="text-red-500" size={18} />
                                    <h4 className="font-bold text-red-800 text-sm">Chi tiết lỗi ({result.errorDetails.length})</h4>
                                </div>
                                <div className="max-h-60 overflow-y-auto p-4 custom-scrollbar">
                                    <ul className="space-y-2">
                                        {result.errorDetails.map((err: any, idx: number) => (
                                            <li key={idx} className="text-sm text-gray-600 flex gap-2 items-start">
                                                <span className="font-mono text-red-500 bg-red-50 px-1.5 rounded text-xs mt-0.5">Dòng {JSON.stringify(err.row)}</span>
                                                <span>{err.error}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => setResult(null)}
                                className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                <RefreshCw size={18} />
                                Import tiếp
                            </button>
                            <button
                                onClick={() => navigate('/raw-foods')}
                                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-md transition-all transform hover:-translate-y-0.5"
                            >
                                <List size={18} />
                                Về danh sách
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RawFoodImport;
