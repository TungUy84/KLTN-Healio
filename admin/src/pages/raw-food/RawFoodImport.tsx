import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { rawFoodService } from '../../services/rawFoodService';
import { FaArrowLeft, FaCloudUploadAlt, FaFileExcel, FaCheckCircle } from 'react-icons/fa';

const RawFoodImport: React.FC = () => {
    const navigate = useNavigate();
    const [file, setFile] = useState<File | null>(null);
    const [mode, setMode] = useState<'skip' | 'overwrite'>('skip');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleImport = async () => {
        if (!file) return;
        setLoading(true);
        setResult(null);

        try {
            const data = await rawFoodService.import(file, mode);
            setResult(data);
        } catch (error: any) {
            console.error('Import failed', error);
            alert('Lỗi import: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="mb-6">
                <div className="flex items-center gap-4">
                    <Link to="/raw-foods" className="flex items-center justify-center w-9 h-9 rounded-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors">
                        <FaArrowLeft />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 m-0">Import Nguyên liệu từ CSV</h1>
                </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                {!result ? (
                    <>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center justify-center relative mb-8 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group">
                            <FaCloudUploadAlt className="text-5xl text-gray-400 mb-4 group-hover:text-indigo-500 transition-colors" />
                            <p className="text-gray-600 mb-4 font-medium">Kéo thả file .csv vào đây hoặc click để chọn</p>
                            <p className="text-xs text-gray-500 mt-1">
                                (Vui lòng sử dụng <a href="/template_raw_food.csv" download className="text-blue-600 hover:text-blue-800 hover:underline font-medium">file mẫu chuẩn</a> để tránh lỗi)
                            </p>
                            <input 
                                type="file" 
                                accept=".csv" 
                                onChange={handleFileChange}
                                className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            {file && (
                                <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm mt-4 font-medium text-gray-700 border border-gray-200">
                                    <FaFileExcel className="text-emerald-500 mr-2" />
                                    <span>{file.name} ({(file.size / 1024).toFixed(2)} KB)</span>
                                </div>
                            )}
                        </div>

                        <div className="mb-8">
                            <h4 className="text-base font-semibold mb-4 text-gray-700">Tùy chọn xử lý trùng lặp (dựa trên Mã số):</h4>
                            <div className="flex flex-col gap-3">
                                <label className="flex items-start gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg transition-colors hover:bg-gray-50">
                                    <input 
                                        type="radio" 
                                        name="mode" 
                                        value="skip" 
                                        checked={mode === 'skip'} 
                                        onChange={() => setMode('skip')}
                                        className="mt-1 accent-indigo-600" 
                                    />
                                    <div>
                                        <span className="font-semibold text-gray-900 block mb-0.5">Bỏ qua (Skip)</span>
                                        <p className="text-xs text-gray-500 m-0">Giữ nguyên dữ liệu cũ, không cập nhật.</p>
                                    </div>
                                </label>
                                <label className="flex items-start gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg transition-colors hover:bg-gray-50">
                                    <input 
                                        type="radio" 
                                        name="mode" 
                                        value="overwrite" 
                                        checked={mode === 'overwrite'} 
                                        onChange={() => setMode('overwrite')}
                                        className="mt-1 accent-indigo-600" 
                                    />
                                    <div>
                                        <span className="font-semibold text-gray-900 block mb-0.5">Ghi đè (Overwrite)</span>
                                        <p className="text-xs text-gray-500 m-0">Cập nhật thông tin mới từ file đè lên dữ liệu cũ.</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button 
                                onClick={handleImport} 
                                disabled={!file || loading}
                                className={`bg-indigo-600 text-white px-8 py-3 rounded-lg border-none font-semibold text-base transition-all
                                    ${(!file || loading) ? 'opacity-60 cursor-not-allowed' : 'hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer'}
                                `}
                            >
                                {loading ? 'Đang xử lý...' : 'Tiến hành Import'}
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="text-center">
                        <div className="text-6xl text-emerald-500 mb-4 inline-block">
                            <FaCheckCircle />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-8">Import hoàn tất!</h2>
                        <div className="grid grid-cols-5 gap-4 mb-8">
                            <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-center">
                                <strong className="text-2xl mb-1 text-gray-900">{result.stats.total}</strong>
                                <span className="text-xs text-gray-500">Tổng số dòng</span>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-center text-emerald-600">
                                <strong className="text-2xl mb-1">{result.stats.added}</strong>
                                <span className="text-xs text-gray-500">Thêm mới</span>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-center text-amber-500">
                                <strong className="text-2xl mb-1">{result.stats.updated}</strong>
                                <span className="text-xs text-gray-500">Cập nhật</span>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-center text-gray-500">
                                <strong className="text-2xl mb-1">{result.stats.skipped}</strong>
                                <span className="text-xs text-gray-500">Bỏ qua</span>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-center text-red-500">
                                <strong className="text-2xl mb-1">{result.stats.errors}</strong>
                                <span className="text-xs text-gray-500">Lỗi</span>
                            </div>
                        </div>
                        
                        {result.errorDetails && result.errorDetails.length > 0 && (
                            <div className="text-left bg-red-50 p-4 rounded-lg mb-8 max-h-48 overflow-y-auto border border-red-100">
                                <h4 className="font-semibold text-red-800 mb-2">Chi tiết lỗi:</h4>
                                <ul className="list-disc pl-5 text-sm text-red-700 space-y-1">
                                    {result.errorDetails.slice(0, 10).map((err: any, idx: number) => (
                                        <li key={idx}>Dòng {JSON.stringify(err.row)}: {err.error}</li>
                                    ))}
                                    {result.errorDetails.length > 10 && <li>...và {result.errorDetails.length - 10} lỗi khác.</li>}
                                </ul>
                            </div>
                        )}

                        <div className="flex justify-center gap-4">
                            <button onClick={() => setResult(null)} className="bg-white text-gray-700 border border-gray-300 px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-50 cursor-pointer">Import tiếp</button>
                            <button onClick={() => navigate('/raw-foods')} className="bg-indigo-600 text-white border-none px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 cursor-pointer">Về danh sách</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RawFoodImport;
