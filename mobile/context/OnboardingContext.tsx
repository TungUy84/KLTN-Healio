import React, { createContext, useState, useContext, Children } from 'react';

type OnboardingData = {
  // Step 1: Info
  full_name?: string;
  gender: 'male' | 'female';
  dob: Date;
  
  // Step 2: Body
  height: string; // string để dễ nhập liệu, convert sau
  weight: string;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  
  // Step 3: Goal
  goalType: 'lose_weight' | 'maintain' | 'gain_weight';
  goalWeight: string;

  // Step 4: Diet
  dietPreset: any; // Object DietPreset từ API
  dietPresetCode?: string; // For saving to DB
  
  // Result
  tdee?: number;
  targetCalories?: number;
  bmi?: number;
};

const defaultData: OnboardingData = {
  gender: 'male',
  dob: new Date(2000, 0, 1),
  height: '',
  weight: '',
  activityLevel: 'sedentary',
  goalType: 'maintain',
  goalWeight: '',
  dietPreset: null,
};

const OnboardingContext = createContext<{
  data: OnboardingData;
  updateData: (newData: Partial<OnboardingData>) => void;
  resetData: () => void;
}>({
  data: defaultData,
  updateData: () => {},
  resetData: () => {},
});

export const OnboardingProvider = ({ children }: { children: React.ReactNode }) => {
  const [data, setData] = useState<OnboardingData>(defaultData);

  const updateData = (newData: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...newData }));
  };

  const resetData = () => setData(defaultData);

  return (
    <OnboardingContext.Provider value={{ data, updateData, resetData }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => useContext(OnboardingContext);
