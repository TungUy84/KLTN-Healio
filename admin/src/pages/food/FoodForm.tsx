import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import { foodService } from '../../services/foodService';
import { rawFoodService, type RawFood } from '../../services/rawFoodService';
import { ArrowLeft, Save } from 'lucide-react';
import BasicInfoSection from '../../components/food-form/BasicInfoSection';
import IngredientSection, { type Ingredient } from '../../components/food-form/IngredientSection';
import NutritionSection from '../../components/food-form/NutritionSection';
import toast from 'react-hot-toast';
import { useNotifications } from '../../context/NotificationContext';

// Helper: Calculate diet tags (PB_53) - Pure function, moved outside component
// Helper: Calculate diet tags (PB_53) - Dynamic version
const calculateDietTags = (
    totalCalories: number,
    totalProtein: number,
    totalCarb: number,
    totalFat: number,
    presets: { code: string; carb_ratio: number; protein_ratio: number; fat_ratio: number }[]
): string[] => {
    if (totalCalories === 0) return [];

    const tags: string[] = [];
    const carbPercent = (totalCarb * 4 / totalCalories) * 100;
    const proteinPercent = (totalProtein * 4 / totalCalories) * 100;
    const fatPercent = (totalFat * 9 / totalCalories) * 100;

    // Tolerance for matching (e.g., +/- 5% or 10%)
    // But simplistic rules for now:
    // Keto: Fat > 65%, Carb < 10% (Flexible than strict 70/5/25)

    // We need to map DB logic to checks.
    // For now, let's keep it simple relative to standard definitions or use the preset values as "targets"

    // Actually, user wants dynamic adding. If I add "Mediterranean", how do I calculate?
    // The DB has ratios. We can check if the food matches those ratios within a variance.
    // Let's use a variance of +/- 10% for Balanced, etc.
    // For Keto/Low Carb, usually it's about thresholds.

    // Let's implement a verify function based on rules derived from preset name or generally just check closeness.
    // However, specifically for the request "thêm chế độ ăn khác thì ... vẫn hiển thị", 
    // it implies we should use the `carb_ratio`, `protein_ratio` from DB to check.

    presets.forEach(preset => {
        if (preset.code === 'vegetarian') return; // Cannot auto-tag vegetarian by macros

        const cDiff = Math.abs(carbPercent - preset.carb_ratio);
        const pDiff = Math.abs(proteinPercent - preset.protein_ratio);
        const fDiff = Math.abs(fatPercent - preset.fat_ratio);

        // Special hardcoded overrides for standard types to ensure accuracy match legacy logic
        if (preset.code === 'keto') {
            if (fatPercent > 65 && carbPercent < 10) tags.push(preset.code);
            return;
        }
        if (preset.code === 'low_carb') {
            if (carbPercent < 25) tags.push(preset.code);
            return;
        }
        if (preset.code === 'high_protein') {
            if (proteinPercent > 30) tags.push(preset.code);
            return;
        }
        if (preset.code === 'low_fat') {
            if (fatPercent < 20) tags.push(preset.code);
            return;
        }

        // For others (balanced, mediterranean, etc), use ratio matching
        if (cDiff < 15 && pDiff < 15 && fDiff < 15) {
            tags.push(preset.code);
        }
    });

    return tags;
};

const FoodForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;
    const navigate = useNavigate();
    const { addNotification } = useNotifications();
    const location = useLocation();

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        serving_unit: '',
        description: ''
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [status, setStatus] = useState<'active' | 'inactive'>('active');

    // PB_51: Meal Categories
    const [mealCategories, setMealCategories] = useState<string[]>([]);

    // PB_52: Ingredients
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<RawFood[]>([]);
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
    const [rawFoodCache, setRawFoodCache] = useState<Map<number, RawFood>>(new Map());
    const searchTimeoutRef = useRef<number | null>(null);

    // PB_53: Nutrition (editable)
    const [nutrition, setNutrition] = useState({
        total_calories: 0,
        total_protein: 0,
        total_carb: 0,
        total_fat: 0
    });
    const [manualOverrides, setManualOverrides] = useState({
        calories: false,
        protein: false,
        carb: false,
        fat: false
    });

    // PB_53: Diet Tags
    const [dietTags, setDietTags] = useState<string[]>([]);
    const [availablePresets, setAvailablePresets] = useState<any[]>([]);

    useEffect(() => {
        const loadPresets = async () => {
            try {
                const data = await foodService.getDietPresets();
                setAvailablePresets(data);
            } catch (e) {
                console.error('Failed to load diet presets', e);
            }
        };
        loadPresets();
    }, []);

    // Micronutrients: Store calculated micronutrients from ingredients
    const [micronutrients, setMicronutrients] = useState<Record<string, number>>({});

    // Handle AI Data from location state (e.g. from FoodList modal)
    useEffect(() => {
        if (location.state?.aiData && !isEditMode) {
            const aiData = location.state.aiData;
            console.log("🔥 AI Data Received in Form:", aiData);
            console.log("🔥 AI Micronutrients:", aiData.micronutrients);

            // Populate basic info
            setFormData(prev => ({
                ...prev,
                name: aiData.name || '',
                description: aiData.description || '',
                serving_unit: aiData.serving_unit || 'Suất'
            }));

            // Populate categories & tags
            if (aiData.meal_categories) setMealCategories(aiData.meal_categories);
            if (aiData.diet_tags) setDietTags(aiData.diet_tags);

            // Populate ingredients
            if (aiData.ingredients && aiData.ingredients.length > 0) {
                const newIngredients: Ingredient[] = aiData.ingredients.map((ing: any) => ({
                    ingredient_id: ing.raw_food_id,
                    raw_food_name: ing.name,
                    amount_in_grams: ing.amount || 100
                }));
                setIngredients(newIngredients);

                // Cache raw foods to support calculation
                const newCache = new Map(rawFoodCache);
                aiData.ingredients.forEach((ing: any) => {
                    newCache.set(ing.raw_food_id, {
                        id: ing.raw_food_id,
                        name: ing.name,
                        energy_kcal: ing.calories || 0,
                        protein_g: ing.protein || 0,
                        fat_g: ing.fat || 0,
                        carb_g: ing.carb || 0,
                        code: 'AI_Generated',
                        unit: 'g',
                        micronutrients: ing.micronutrients || {}
                    } as RawFood);
                });
                setRawFoodCache(newCache);
            }

            if (aiData.micronutrients) {
                setMicronutrients(aiData.micronutrients);
            }

            // Block auto-calculation effect from overwriting our loaded data
            ignoreNextCalculation.current = true;

            // Clear state so it doesn't re-apply on refresh if state persists
            window.history.replaceState({}, document.title)
            toast.success('Đã điền dữ liệu từ AI! Vui lòng kiểm tra và lưu lại.');
        }
    }, [location.state, isEditMode]);

    useEffect(() => {
        if (isEditMode && id) {
            fetchDetail(id);
        }
    }, [id]);

    // PB_52: Search RawFood with debounce
    useEffect(() => {
        if (searchQuery.trim().length >= 2) {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
            searchTimeoutRef.current = setTimeout(async () => {
                try {
                    const response = await rawFoodService.getAll(1, 10, searchQuery);
                    setSearchResults(response.data);
                    setShowSearchDropdown(true);
                } catch (error) {
                    console.error('Search error', error);
                }
            }, 300);
        } else {
            setSearchResults([]);
            setShowSearchDropdown(false);
        }
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchQuery]);

    // Ref to block auto-calculation when loading data from API
    // This prevents overwriting stored diet tags/nutrition with auto-calculated values on load
    const ignoreNextCalculation = useRef(false);

    // PB_53: Auto-calculate nutrition when ingredients change
    useEffect(() => {
        const calculateNutrition = async () => {
            if (ingredients.length === 0) {
                // Only reset if it's not the very first render cycle check
                // But wait, if ingredients empty, maybe user deleted them.
                // We should proceed usually.

                // If this update was triggered by loading data (Edit Mode), skip calculation
                if (ignoreNextCalculation.current) {
                    ignoreNextCalculation.current = false;
                    return;
                }

                setNutrition({ total_calories: 0, total_protein: 0, total_carb: 0, total_fat: 0 });
                setDietTags([]);
                setMicronutrients({});
                return;
            }

            // If this update was triggered by loading data (Edit Mode), skip calculation
            if (ignoreNextCalculation.current) {
                ignoreNextCalculation.current = false;
                return;
            }

            let totalCal = 0, totalProtein = 0, totalCarb = 0, totalFat = 0;
            const totalMicronutrients: Record<string, number> = {};

            for (const ing of ingredients) {
                let rawFood = rawFoodCache.get(ing.ingredient_id);
                if (!rawFood) {
                    // Try to fetch synchronously or check if we can get it
                    // This async fetch inside loop is suboptimal but works for small lists
                    try {
                        const fetchedRawFood = await rawFoodService.getById(ing.ingredient_id);
                        if (!fetchedRawFood) continue;
                        rawFood = fetchedRawFood;
                        setRawFoodCache(prev => new Map(prev).set(ing.ingredient_id, rawFood as RawFood));
                    } catch (error) {
                        console.error('Failed to fetch raw food', error);
                        continue;
                    }
                }

                const multiplier = ing.amount_in_grams / 100; // RawFood values are per 100g
                totalCal += rawFood.energy_kcal * multiplier;
                totalProtein += rawFood.protein_g * multiplier;
                totalCarb += rawFood.carb_g * multiplier;
                totalFat += rawFood.fat_g * multiplier;

                // Calculate micronutrients
                if (rawFood.micronutrients && typeof rawFood.micronutrients === 'object') {
                    for (const [key, value] of Object.entries(rawFood.micronutrients)) {
                        const numValue = typeof value === 'string' ? parseFloat(value) : (typeof value === 'number' ? value : 0);
                        if (!isNaN(numValue)) {
                            totalMicronutrients[key] = (totalMicronutrients[key] || 0) + (numValue * multiplier);
                        }
                    }
                }
            }

            // Round micronutrient values
            const roundedMicronutrients: Record<string, number> = {};
            for (const [key, value] of Object.entries(totalMicronutrients)) {
                roundedMicronutrients[key] = Math.round(value * 100) / 100;
            }

            // Update nutrition
            setNutrition(prev => ({
                total_calories: !manualOverrides.calories ? Math.round(totalCal * 100) / 100 : prev.total_calories,
                total_protein: !manualOverrides.protein ? Math.round(totalProtein * 100) / 100 : prev.total_protein,
                total_carb: !manualOverrides.carb ? Math.round(totalCarb * 100) / 100 : prev.total_carb,
                total_fat: !manualOverrides.fat ? Math.round(totalFat * 100) / 100 : prev.total_fat
            }));

            setMicronutrients(roundedMicronutrients);

            // AUTO TAG LOGIC:
            // AUTO TAG LOGIC:
            const tags = calculateDietTags(totalCal, totalProtein, totalCarb, totalFat, availablePresets);
            setDietTags(tags);
        };

        calculateNutrition();
    }, [ingredients, manualOverrides]);

    const fetchDetail = async (foodId: string) => {
        try {
            setLoading(true);
            const data = await foodService.getById(foodId);

            // Block auto-calculation effect from overwriting our loaded data
            ignoreNextCalculation.current = true;

            setFormData({
                name: data.name,
                serving_unit: data.serving_unit || '',
                description: data.cooking || data.description || ''
            });
            if (data.image) {
                setPreviewImage(`http://localhost:3000${data.image}`);
            }
            setMealCategories(data.meal_categories || []);
            setStatus(data.status || 'active');

            if (data.ingredients && Array.isArray(data.ingredients)) {
                const loadedIngredients: Ingredient[] = data.ingredients.map((ing: any) => ({
                    ingredient_id: ing.id,
                    raw_food_name: ing.name,
                    amount_in_grams: ing.FoodIngredient?.amount_in_grams || 0
                }));
                setIngredients(loadedIngredients);

                const cache = new Map<number, RawFood>();
                for (const ing of data.ingredients) {
                    cache.set(ing.id, ing);
                }
                setRawFoodCache(cache);
            }

            setNutrition({
                total_calories: data.calories || data.total_calories || 0,
                total_protein: data.protein || 0,
                total_carb: data.carb || 0,
                total_fat: data.fat || 0
            });

            if (data.dietPresets && Array.isArray(data.dietPresets)) {
                setDietTags(data.dietPresets.map(p => p.code));
            } else {
                setDietTags([]);
            }

            if (data.micronutrients && typeof data.micronutrients === 'object') {
                setMicronutrients(data.micronutrients as Record<string, number>);
            } else {
                setMicronutrients({});
            }
        } catch (error) {
            console.error('Failed to fetch detail', error);
            toast.error('Không thể tải thông tin món ăn');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleCategoryChange = (categoryValue: string) => {
        setMealCategories(prev => {
            if (prev.includes(categoryValue)) {
                return prev.filter(cat => cat !== categoryValue);
            } else {
                return [...prev, categoryValue];
            }
        });
    };

    const handleAddIngredient = (rawFood: RawFood) => {
        if (ingredients.some(ing => ing.ingredient_id === rawFood.id)) {
            toast.error('Nguyên liệu này đã có trong danh sách!');
            return;
        }

        setIngredients(prev => [...prev, {
            ingredient_id: rawFood.id,
            raw_food_name: rawFood.name,
            amount_in_grams: 100
        }]);

        setRawFoodCache(prev => new Map(prev).set(rawFood.id, rawFood));
        setSearchQuery('');
        setShowSearchDropdown(false);
    };

    const handleRemoveIngredient = (index: number) => {
        setIngredients(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpdateQuantity = (index: number, quantity: number) => {
        setIngredients(prev => prev.map((ing, i) =>
            i === index ? { ...ing, amount_in_grams: quantity || 0 } : ing
        ));
    };

    const handleResetCalculation = () => {
        setManualOverrides({ calories: false, protein: false, carb: false, fat: false });
    };

    const handleDietTagToggle = (tag: string) => {
        setDietTags(prev => {
            if (prev.includes(tag)) {
                return prev.filter(t => t !== tag);
            } else {
                return [...prev, tag];
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const submitData = new FormData();
            submitData.append('name', formData.name);
            submitData.append('serving_unit', formData.serving_unit);
            submitData.append('description', formData.description || '');
            submitData.append('meal_categories', JSON.stringify(mealCategories));
            submitData.append('status', status);

            if (imageFile) {
                submitData.append('image', imageFile);
            }

            submitData.append('total_calories', nutrition.total_calories.toString());
            submitData.append('total_protein', nutrition.total_protein.toString());
            submitData.append('total_carb', nutrition.total_carb.toString());
            submitData.append('total_fat', nutrition.total_fat.toString());
            submitData.append('diet_tags', JSON.stringify(dietTags));
            submitData.append('micronutrients', JSON.stringify(micronutrients));
            submitData.append('ingredients', JSON.stringify(
                ingredients.map(ing => ({
                    ingredient_id: ing.ingredient_id,
                    amount_in_grams: ing.amount_in_grams
                }))
            ));

            if (isEditMode && id) {
                await foodService.update(id, submitData);
                toast.success('Cập nhật món ăn thành công!');
                addNotification({ message: `Cập nhật món ăn "${formData.name}" thành công`, link: `/foods/${id}` });
            } else {
                const created = await foodService.create(submitData);
                toast.success('Thêm món ăn thành công!');
                addNotification({ message: `Thêm món ăn "${formData.name}" thành công`, link: `/foods/${created.id}` });
            }
            navigate('/foods');
        } catch (error: any) {
            console.error('Submit error', error);
            toast.error(error.response?.data?.message || 'Có lỗi khi lưu món ăn.');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateAI = async () => {
        if (!formData.name) return;
        try {
            setLoading(true);
            const result = await foodService.generateRecipeByAI(formData.name);

            if (result.success) {
                setFormData(prev => ({
                    ...prev,
                    description: result.description || prev.description,
                    serving_unit: result.serving_unit || prev.serving_unit || 'Suất'
                }));

                if (result.meal_categories) setMealCategories(result.meal_categories);
                if (result.diet_tags) setDietTags(result.diet_tags);

                if (result.ingredients && result.ingredients.length > 0) {
                    const newIngredients: Ingredient[] = result.ingredients.map((ing: any) => ({
                        ingredient_id: ing.raw_food_id,
                        raw_food_name: ing.name,
                        amount_in_grams: ing.amount || 100
                    }));

                    setIngredients(prev => {
                        const existingIds = new Set(prev.map(p => p.ingredient_id));
                        const uniqueNew = newIngredients.filter(n => !existingIds.has(n.ingredient_id));
                        return [...prev, ...uniqueNew];
                    });

                    const newCache = new Map(rawFoodCache);
                    result.ingredients.forEach((ing: any) => {
                        newCache.set(ing.raw_food_id, {
                            id: ing.raw_food_id,
                            name: ing.name,
                            energy_kcal: ing.calories,
                            protein_g: ing.protein,
                            fat_g: ing.fat,
                            carb_g: ing.carb,
                            code: 'AI_Generated',
                            unit: 'g'
                        } as RawFood);
                    });
                    setRawFoodCache(newCache);
                }

                if (result.micronutrients) {
                    setMicronutrients(result.micronutrients);
                    // Block auto-calculation to preserve AI's top-level data
                    ignoreNextCalculation.current = true;
                }

                toast.success(`AI đã tạo công thức cho "${formData.name}"!`);
            }
        } catch (error: any) {
            console.error("AI Gen Error", error);
            toast.error(error.response?.data?.message || "Lỗi khi tạo công thức AI");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    to="/foods"
                    className="flex items-center justify-center w-10 h-10 rounded-xl bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 transition-all shadow-sm group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Chỉnh sửa Món ăn' : 'Thêm mới Món ăn'}</h1>
                    <p className="text-gray-500 text-sm mt-0.5">Thiết lập thông tin chi tiết và công thức</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Divide form into sections with consistent padding */}
                <div className="p-8 space-y-8">
                    <BasicInfoSection
                        formData={formData}
                        previewImage={previewImage}
                        status={status}
                        statusDropdownOpen={false} // Managed internally by Select in BasicInfo if needed, or we refactor BasicInfo to not need this prop
                        mealCategories={mealCategories}
                        onFormDataChange={handleChange}
                        onFileChange={handleFileChange}
                        onStatusToggle={() => { }} // Deprecated if using native Select in BasicInfo
                        onStatusSelect={(s) => setStatus(s)}
                        onCategoryChange={handleCategoryChange}
                        onGenerateAI={handleGenerateAI}
                        aiLoading={loading}
                    />

                    <div className="border-t border-gray-100 pt-8">
                        <IngredientSection
                            ingredients={ingredients}
                            searchQuery={searchQuery}
                            searchResults={searchResults}
                            showSearchDropdown={showSearchDropdown}
                            onSearchChange={setSearchQuery}
                            onSearchFocus={() => searchResults.length > 0 && setShowSearchDropdown(true)}
                            onAddIngredient={handleAddIngredient}
                            onRemoveIngredient={handleRemoveIngredient}
                            onUpdateQuantity={handleUpdateQuantity}
                        />
                    </div>

                    <div className="border-t border-gray-100 pt-8">
                        <NutritionSection
                            nutrition={nutrition}
                            dietTags={dietTags}
                            availableDietTags={availablePresets.map(p => ({ value: p.code, label: p.name }))}
                            onResetCalculation={handleResetCalculation}
                            onDietTagToggle={handleDietTagToggle}
                        />
                    </div>
                </div>

                <div className="bg-gray-50 px-8 py-5 border-t border-gray-100 flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        <Save size={20} />
                        {loading ? 'Đang lưu...' : isEditMode ? 'Cập nhật Món ăn' : 'Tạo Món ăn mới'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FoodForm;
