import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { foodService } from '../../services/foodService';
import { rawFoodService, type RawFood } from '../../services/rawFoodService';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import BasicInfoSection from './components/BasicInfoSection';
import IngredientSection, { type Ingredient } from './components/IngredientSection';
import NutritionSection from './components/NutritionSection';

// Helper: Calculate diet tags (PB_53) - Pure function, moved outside component
const calculateDietTags = (totalCalories: number, totalProtein: number, totalCarb: number, totalFat: number): string[] => {
    if (totalCalories === 0) return [];

    const tags: string[] = [];
    const carbPercent = (totalCarb * 4 / totalCalories) * 100;
    const proteinPercent = (totalProtein * 4 / totalCalories) * 100;
    const fatPercent = (totalFat * 9 / totalCalories) * 100;

    // Keto: Fat > 70%, Carb < 10%
    if (fatPercent > 70 && carbPercent < 10) {
        tags.push('keto');
    }

    // Low Carb: Carb < 25%
    if (carbPercent < 25) {
        tags.push('low_carb');
    }

    // High Protein: Protein > 30%
    if (proteinPercent > 30) {
        tags.push('high_protein');
    }

    // Low Fat: Fat < 20%
    if (fatPercent < 20) {
        tags.push('low_fat');
    }

    // Balanced: 40-50% Carb, 25-30% Protein, 20-30% Fat
    if (carbPercent >= 40 && carbPercent <= 50 &&
        proteinPercent >= 25 && proteinPercent <= 30 &&
        fatPercent >= 20 && fatPercent <= 30) {
        tags.push('balanced');
    }

    return tags;
};

const FoodForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        serving_unit: '',
        description: ''
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [status, setStatus] = useState<'active' | 'inactive'>('active');
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

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

    // Micronutrients: Store calculated micronutrients from ingredients
    const [micronutrients, setMicronutrients] = useState<Record<string, number>>({});

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

    // PB_53: Auto-calculate nutrition when ingredients change
    useEffect(() => {
        const calculateNutrition = async () => {
            if (ingredients.length === 0) {
                setNutrition({ total_calories: 0, total_protein: 0, total_carb: 0, total_fat: 0 });
                setDietTags([]);
                setMicronutrients({});
                return;
            }

            let totalCal = 0, totalProtein = 0, totalCarb = 0, totalFat = 0;
            const totalMicronutrients: Record<string, number> = {};

            for (const ing of ingredients) {
                let rawFood = rawFoodCache.get(ing.ingredient_id);
                if (!rawFood) {
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

                // Calculate micronutrients: Sum all micronutrients from each ingredient
                if (rawFood.micronutrients && typeof rawFood.micronutrients === 'object') {
                    for (const [key, value] of Object.entries(rawFood.micronutrients)) {
                        const numValue = typeof value === 'string' ? parseFloat(value) : (typeof value === 'number' ? value : 0);
                        if (!isNaN(numValue)) {
                            totalMicronutrients[key] = (totalMicronutrients[key] || 0) + (numValue * multiplier);
                        }
                    }
                }
            }

            // Round micronutrient values to 2 decimal places
            const roundedMicronutrients: Record<string, number> = {};
            for (const [key, value] of Object.entries(totalMicronutrients)) {
                roundedMicronutrients[key] = Math.round(value * 100) / 100;
            }

            // Update nutrition (only if not manually overridden)
            setNutrition(prev => ({
                total_calories: !manualOverrides.calories ? Math.round(totalCal * 100) / 100 : prev.total_calories,
                total_protein: !manualOverrides.protein ? Math.round(totalProtein * 100) / 100 : prev.total_protein,
                total_carb: !manualOverrides.carb ? Math.round(totalCarb * 100) / 100 : prev.total_carb,
                total_fat: !manualOverrides.fat ? Math.round(totalFat * 100) / 100 : prev.total_fat
            }));

            // Update micronutrients
            setMicronutrients(roundedMicronutrients);

            // Auto-detect diet tags
            const tags = calculateDietTags(totalCal, totalProtein, totalCarb, totalFat);
            setDietTags(tags);
        };

        calculateNutrition();
    }, [ingredients, manualOverrides]);

    const fetchDetail = async (foodId: string) => {
        try {
            setLoading(true);
            const data = await foodService.getById(foodId);
            setFormData({
                name: data.name,
                serving_unit: data.serving_unit || '',
                description: data.cooking || data.description || '' // Map cooking -> description
            });
            if (data.image) {
                setPreviewImage(`http://localhost:3000${data.image}`);
            }
            setMealCategories(data.meal_categories || []);
            setStatus(data.status || 'active');

            // PB_52: Load ingredients
            if (data.ingredients && Array.isArray(data.ingredients)) {
                const loadedIngredients: Ingredient[] = data.ingredients.map((ing: any) => ({
                    ingredient_id: ing.id,
                    raw_food_name: ing.name,
                    amount_in_grams: ing.FoodIngredient?.amount_in_grams || 0
                }));
                setIngredients(loadedIngredients);

                // Cache raw foods
                const cache = new Map<number, RawFood>();
                for (const ing of data.ingredients) {
                    cache.set(ing.id, ing);
                }
                setRawFoodCache(cache);
            }

            // PB_53: Load nutrition from backend fields
            setNutrition({
                total_calories: data.calories || data.total_calories || 0,
                total_protein: data.protein || 0,
                total_carb: data.carb || 0,
                total_fat: data.fat || 0
            });

            // PB_53: Load diet tags
            if (data.diet_tags) {
                setDietTags(data.diet_tags);
            }

            // Load micronutrients
            if (data.micronutrients && typeof data.micronutrients === 'object') {
                setMicronutrients(data.micronutrients as Record<string, number>);
            } else {
                setMicronutrients({});
            }
        } catch (error) {
            console.error('Failed to fetch detail', error);
            alert('Lỗi tải dữ liệu.');
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

    // PB_52: Add ingredient
    const handleAddIngredient = (rawFood: RawFood) => {
        if (ingredients.some(ing => ing.ingredient_id === rawFood.id)) {
            alert('Nguyên liệu này đã được thêm vào danh sách.');
            return;
        }

        setIngredients(prev => [...prev, {
            ingredient_id: rawFood.id,
            raw_food_name: rawFood.name,
            amount_in_grams: 100 // Default 100g
        }]);

        setRawFoodCache(prev => new Map(prev).set(rawFood.id, rawFood));
        setSearchQuery('');
        setShowSearchDropdown(false);
    };

    // PB_52: Remove ingredient
    const handleRemoveIngredient = (index: number) => {
        setIngredients(prev => prev.filter((_, i) => i !== index));
    };

    // PB_52: Update ingredient quantity
    const handleUpdateQuantity = (index: number, quantity: number) => {
        setIngredients(prev => prev.map((ing, i) =>
            i === index ? { ...ing, amount_in_grams: quantity || 0 } : ing
        ));
    };

    // PB_53: Handle nutrition manual override
    const handleNutritionChange = (field: 'total_calories' | 'total_protein' | 'total_carb' | 'total_fat', value: number) => {
        setNutrition(prev => ({ ...prev, [field]: value }));
        setManualOverrides(prev => ({ ...prev, [field]: true }));
    };

    // PB_53: Reset calculation
    const handleResetCalculation = () => {
        setManualOverrides({
            calories: false,
            protein: false,
            carb: false,
            fat: false
        });
        // useEffect will recalculate automatically
    };

    // PB_53: Handle diet tag toggle
    const handleDietTagToggle = (tag: string) => {
        setDietTags(prev => {
            if (prev.includes(tag)) {
                return prev.filter(t => t !== tag);
            } else {
                return [...prev, tag];
            }
        });
    };

    // PB_54: Handle submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const submitData = new FormData();

            // PB_51: Basic info
            submitData.append('name', formData.name);
            submitData.append('serving_unit', formData.serving_unit);
            submitData.append('description', formData.description || '');
            submitData.append('meal_categories', JSON.stringify(mealCategories));
            submitData.append('status', status);

            if (imageFile) {
                submitData.append('image', imageFile);
            }

            // PB_53: Nutrition & Diet Tags
            submitData.append('total_calories', nutrition.total_calories.toString());
            submitData.append('total_protein', nutrition.total_protein.toString());
            submitData.append('total_carb', nutrition.total_carb.toString());
            submitData.append('total_fat', nutrition.total_fat.toString());
            submitData.append('diet_tags', JSON.stringify(dietTags));

            // Micronutrients: Send calculated micronutrients
            submitData.append('micronutrients', JSON.stringify(micronutrients));

            // PB_52: Ingredients
            submitData.append('ingredients', JSON.stringify(
                ingredients.map(ing => ({
                    ingredient_id: ing.ingredient_id,
                    amount_in_grams: ing.amount_in_grams
                }))
            ));

            if (isEditMode && id) {
                await foodService.update(id, submitData);
                alert('Cập nhật thành công!');
            } else {
                await foodService.create(submitData);
                alert('Thêm mới thành công!');
            }
            navigate('/foods');
        } catch (error: any) {
            console.error('Submit error', error);
            alert(error.response?.data?.message || 'Có lỗi xảy ra.');
        } finally {
            setLoading(false);
        }
    };

    // AI Generation Handler
    const handleGenerateAI = async () => {
        if (!formData.name) return;

        try {
            setLoading(true); // Reuse loading or create separate state if needed
            const result = await foodService.generateRecipeByAI(formData.name);

            if (result.success) {
                // 1. Update Description & Basic Info
                setFormData(prev => ({
                    ...prev,
                    description: result.description || prev.description,
                    serving_unit: result.serving_unit || prev.serving_unit || 'Suất'
                }));

                // Update Categories & Tags
                if (result.meal_categories) setMealCategories(result.meal_categories);
                if (result.diet_tags) setDietTags(result.diet_tags);

                // 2. Update Ingredients
                if (result.ingredients && result.ingredients.length > 0) {
                    const newIngredients: Ingredient[] = result.ingredients.map((ing: any) => ({
                        ingredient_id: ing.raw_food_id,
                        raw_food_name: ing.name,
                        amount_in_grams: ing.amount || 100
                    }));

                    // Merge avoiding duplicates
                    setIngredients(prev => {
                        const existingIds = new Set(prev.map(p => p.ingredient_id));
                        const uniqueNew = newIngredients.filter(n => !existingIds.has(n.ingredient_id));
                        return [...prev, ...uniqueNew];
                    });

                    // Cache new raw foods for calculation
                    const newCache = new Map(rawFoodCache);
                    // Minimal RawFood object sufficient for cache/calculation
                    result.ingredients.forEach((ing: any) => {
                        newCache.set(ing.raw_food_id, {
                            id: ing.raw_food_id,
                            name: ing.name,
                            energy_kcal: ing.calories,
                            protein_g: ing.protein,
                            fat_g: ing.fat,
                            carb_g: ing.carb,
                            code: 'AI_Generated', // Dummy code
                            unit: 'g' // Default unit
                        } as RawFood);
                    });
                    setRawFoodCache(newCache);
                }

                // 3. Notify User
                alert(`🎉 Đã tạo thành công! ${result.newIngredientsCount > 0 ? `Thêm ${result.newIngredientsCount} nguyên liệu mới vào kho.` : ''}`);
            }
        } catch (error: any) {
            console.error("AI Gen Error", error);
            const serverMessage = error.response?.data?.message;
            const serverDetails = error.response?.data?.details || error.response?.data?.error;
            alert(`${serverMessage || "Lỗi khi tạo công thức bằng AI."}\n${serverDetails || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Link to="/foods" className="flex items-center justify-center w-9 h-9 rounded-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors">
                    <FaArrowLeft />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 m-0">{isEditMode ? 'Chỉnh sửa Món ăn' : 'Thêm mới Món ăn'}</h1>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm">
                <form onSubmit={handleSubmit}>
                    <BasicInfoSection
                        formData={formData}
                        previewImage={previewImage}
                        status={status}
                        statusDropdownOpen={statusDropdownOpen}
                        mealCategories={mealCategories}
                        onFormDataChange={handleChange}
                        onFileChange={handleFileChange}
                        onStatusToggle={() => setStatusDropdownOpen(!statusDropdownOpen)}
                        onStatusSelect={(newStatus) => {
                            setStatus(newStatus);
                            setStatusDropdownOpen(false);
                        }}
                        onCategoryChange={handleCategoryChange}
                        onGenerateAI={handleGenerateAI}
                        aiLoading={loading}
                    />

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

                    <NutritionSection
                        nutrition={nutrition}
                        dietTags={dietTags}
                        onNutritionChange={handleNutritionChange}
                        onResetCalculation={handleResetCalculation}
                        onDietTagToggle={handleDietTagToggle}
                    />

                    {/* PB_54: Submit Button */}
                    <div className="mt-8 flex justify-end border-t border-gray-200 pt-5">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center bg-indigo-600 text-white px-6 py-3 rounded-lg border-none cursor-pointer font-semibold text-base hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <FaSave className="mr-2" />
                            {loading ? 'Đang lưu...' : 'Lưu Món Ăn'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FoodForm;
