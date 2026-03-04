import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Utensils, Wheat, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { foodService } from '../services/foodService';
import type { Food } from '../services/foodService';
import { rawFoodService } from '../services/rawFoodService';
import type { RawFood } from '../services/rawFoodService';
// import { adminUserService } from '../services/adminUserService'; // Optional future

// Custom hook cho Debounce
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
        return () => { clearTimeout(handler); };
    }, [value, delay]);
    return debouncedValue;
}

export const GlobalSearch: React.FC = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 400); // 400ms delay

    const [isFocused, setIsFocused] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [foods, setFoods] = useState<Food[]>([]);
    const [rawFoods, setRawFoods] = useState<RawFood[]>([]);

    // Xử lý Click Outside để đóng Dropdown
    const containerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsFocused(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => { document.removeEventListener("mousedown", handleClickOutside); };
    }, []);

    useEffect(() => {
        const fetchResults = async () => {
            if (!debouncedSearch.trim()) {
                setFoods([]);
                setRawFoods([]);
                return;
            }

            setIsLoading(true);
            try {
                // Fetch song song (parallel) để tăng tốc độ
                const [foodRes, rawRes] = await Promise.all([
                    foodService.getAll(1, 5, debouncedSearch, 'created_at', 'DESC'),
                    rawFoodService.getAll(1, 4, debouncedSearch, 'createdAt', 'DESC')
                ]);

                setFoods(foodRes.data || []);
                setRawFoods(rawRes.data || []);
            } catch (error) {
                console.error("Lỗi Global Search:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchResults();
    }, [debouncedSearch]);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    const resolveImg = (path: string | null) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `${API_URL.replace(/\/api$/, '')}${path.startsWith('/') ? '' : '/'}${path}`;
    };

    const hasResults = foods.length > 0 || rawFoods.length > 0;
    const isTyping = searchTerm !== debouncedSearch;
    const showDropdown = isFocused && searchTerm.trim().length > 0;

    const handleNavigate = (path: string) => {
        setIsFocused(false);
        setSearchTerm(''); // Xóa thanh search sau khi click
        navigate(path);
    };

    return (
        <div ref={containerRef} className="relative flex-1 max-w-xl mx-6">
            {/* Thanh Search Input */}
            <div className={`
                flex items-center w-full bg-gray-50 rounded-full px-4 py-2 transition-all duration-300 border
                ${isFocused ? 'border-emerald-300 bg-white shadow-sm ring-2 ring-emerald-50' : 'border-transparent'}
            `}>
                {isLoading || isTyping ? (
                    <Loader2 size={18} className="mr-3 text-emerald-500 animate-spin" />
                ) : (
                    <Search size={20} className={`mr-3 ${isFocused ? 'text-emerald-500' : 'text-gray-400'}`} />
                )}
                <input
                    type="text"
                    placeholder="Tìm kiếm Món ăn, Nguyên liệu..."
                    className="bg-transparent border-none outline-none w-full text-sm text-gray-700 placeholder-gray-400 font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                />
                {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="text-gray-400 hover:text-gray-600 ml-2">
                        <span className="text-xs font-bold font-mono bg-gray-200 px-1.5 py-0.5 rounded text-gray-500">x</span>
                    </button>
                )}
            </div>

            {/* Dropdown Kết Quả */}
            {showDropdown && (
                <div className="absolute top-12 left-0 w-full bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 flex flex-col animate-in fade-in slide-in-from-top-2 duration-200 z-50 overflow-hidden">

                    {!hasResults && !isLoading && !isTyping ? (
                        <div className="p-8 text-center text-gray-500">
                            <Search size={32} className="mx-auto text-gray-300 mb-2" />
                            <p className="font-medium text-sm">Không tìm thấy "{searchTerm}"</p>
                        </div>
                    ) : (
                        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {/* Khu vực Món Ăn */}
                            {foods.length > 0 && (
                                <div className="p-2">
                                    <div className="px-3 py-2 flex items-center gap-2 text-emerald-600">
                                        <Utensils size={14} className="stroke-2" />
                                        <h3 className="text-xs font-bold uppercase tracking-wider">Món ăn</h3>
                                    </div>
                                    {foods.map(food => (
                                        <div
                                            key={`food-${food.id}`}
                                            onClick={() => handleNavigate(`/foods`)} // Tương lai: truyền state search or open modal
                                            className="flex items-center gap-3 p-2 hover:bg-emerald-50 rounded-xl cursor-pointer group transition-colors"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                                                {food.image ? (
                                                    <img src={resolveImg(food.image)!} className="w-full h-full object-cover" alt="" />
                                                ) : <div className="w-full h-full flex items-center justify-center text-gray-400"><Utensils size={16} /></div>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-emerald-700">{food.name}</p>
                                                <p className="text-xs text-gray-500 font-medium">{food.calories} kcal</p>
                                            </div>
                                            <ChevronRight size={16} className="text-gray-300 group-hover:text-emerald-500 mr-2" />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Divider nếu có cả 2 */}
                            {foods.length > 0 && rawFoods.length > 0 && <div className="h-px bg-gray-100 mx-4" />}

                            {/* Khu vực Nguyên Liệu */}
                            {rawFoods.length > 0 && (
                                <div className="p-2">
                                    <div className="px-3 py-2 flex items-center gap-2 text-amber-600">
                                        <Wheat size={14} className="stroke-2" />
                                        <h3 className="text-xs font-bold uppercase tracking-wider">Nguyên liệu thô</h3>
                                    </div>
                                    {rawFoods.map(raw => (
                                        <div
                                            key={`raw-${raw.id}`}
                                            onClick={() => handleNavigate(`/raw-foods`)} // TODO: Handle focus row or open edit modal
                                            className="flex items-center gap-3 p-2 hover:bg-amber-50 rounded-xl cursor-pointer group transition-colors"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                                                {raw.image ? (
                                                    <img src={resolveImg(raw.image)!} className="w-full h-full object-cover" alt="" />
                                                ) : <div className="w-full h-full flex items-center justify-center text-gray-400"><Wheat size={16} /></div>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-amber-700">
                                                    {raw.name} <span className="text-xs text-gray-400 font-normal">({raw.code})</span>
                                                </p>
                                                <p className="text-xs text-gray-500 font-medium">{raw.energy_kcal} kcal / {raw.unit}</p>
                                            </div>
                                            <ChevronRight size={16} className="text-gray-300 group-hover:text-amber-500 mr-2" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Footer Quick Action */}
                    <div className="bg-gray-50 px-4 py-3 border-t border-gray-100 text-center">
                        <p className="text-[11px] text-gray-500 font-medium">Sử dụng để tìm nhanh đối tượng qua các phân hệ</p>
                    </div>
                </div>
            )}
        </div>
    );
};
