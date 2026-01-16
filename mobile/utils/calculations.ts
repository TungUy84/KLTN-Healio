// Hàm tính TDEE & BMR (Mifflin-St Jeor)
// 10 * weight (kg) + 6.25 * height (cm) - 5 * age (y) + s (male +5, female -161)

export const calculateMetrics = (
  age: number,
  gender: 'male' | 'female',
  weight: number,
  height: number,
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active',
  goal: 'lose_weight' | 'maintain' | 'gain_weight',
  dietPreset?: any
) => {
  // 1. Calculate BMR
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  if (gender === 'male') {
    bmr += 5;
  } else {
    bmr -= 161;
  }

  // 2. Determine Activity Multiplier
  const multipliers = {
    sedentary: 1.2,      // Ít vận động
    light: 1.375,        // Nhẹ (1-3 ngày/tuần)
    moderate: 1.55,      // Vừa (3-5 ngày/tuần)
    active: 1.725,       // Năng động (6-7 ngày/tuần)
    very_active: 1.9     // Rất năng động (2 lần/ngày)
  };

  const multiplier = multipliers[activityLevel] || 1.2;
  const tdee = Math.round(bmr * multiplier);

  // 3. Calculate Target Calories based on Goal
  let targetCalories = tdee;
  if (goal === 'lose_weight') {
    targetCalories -= 500; // Giảm cân: Thâm hụt 500
  } else if (goal === 'gain_weight') {
    targetCalories += 500; // Tăng cân: Dư 500
  }

  // Đảm bảo không dưới mức tối thiểu an toàn (1200 cho nữ, 1500 cho nam)
  const minCal = gender === 'male' ? 1500 : 1200;
  if (targetCalories < minCal) targetCalories = minCal;

  // 4. Calculate BMI
  // BMI = weight / (height/100)^2
  const heightM = height / 100;
  const bmi = parseFloat((weight / (heightM * heightM)).toFixed(1));

  // 5. Calculate Macros (if preset provided)
  let macros = { carb: 0, protein: 0, fat: 0 };
  if (dietPreset) {
      // Allow lowercase keys just in case, but assume step5 structure
      const c = dietPreset.carb_ratio || 50;
      const p = dietPreset.protein_ratio || 30;
      const f = dietPreset.fat_ratio || 20;

      macros.carb = Math.round((targetCalories * c / 100) / 4);
      macros.protein = Math.round((targetCalories * p / 100) / 4);
      macros.fat = Math.round((targetCalories * f / 100) / 9);
  }

  return { 
    bmr, 
    tdee, 
    daily_calories: Math.round(targetCalories), // Sync naming with Result screen (daily_calories)
    targetCalories: Math.round(targetCalories),
    bmi, 
    ...macros 
  };
};
