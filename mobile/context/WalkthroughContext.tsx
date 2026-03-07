import React, { createContext, useContext, useState, useRef, useCallback, ReactNode } from 'react';
import { View, LayoutRectangle } from 'react-native';

export interface WalkthroughStep {
    name: string;
    title: string;
    content: string;
}

interface WalkthroughContextType {
    isActive: boolean;
    currentStepIndex: number;
    steps: WalkthroughStep[];
    startWalkthrough: (steps: WalkthroughStep[], epicKey?: string) => void;
    nextStep: () => void;
    prevStep: () => void;
    skipWalkthrough: () => void;
    registerStep: (stepName: string, ref: any, onMeasure: (measurement: LayoutRectangle) => void) => void;
    unregisterStep: (stepName: string) => void;
    epicKey?: string;
    onMeasureUpdate?: (layout: LayoutRectangle | null) => void;
    setOnMeasureUpdate: (fn: (layout: LayoutRectangle | null) => void) => void;
}

const WalkthroughContext = createContext<WalkthroughContextType | undefined>(undefined);

export const WalkthroughProvider = ({ children }: { children: ReactNode }) => {
    const [isActive, setIsActive] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [steps, setSteps] = useState<WalkthroughStep[]>([]);
    const [epicKey, setEpicKey] = useState<string | undefined>(undefined);
    const onMeasureUpdateRef = useRef<((layout: LayoutRectangle | null) => void) | undefined>(undefined);

    const setOnMeasureUpdate = useCallback((fn: (layout: LayoutRectangle | null) => void) => {
        onMeasureUpdateRef.current = fn;
    }, []);

    // Lưu trữ các hàm measure của từng step
    const stepMeasurements = useRef<Record<string, () => void>>({});

    const measureActiveStep = useCallback((index: number, currentSteps: WalkthroughStep[]) => {
        if (index >= 0 && index < currentSteps.length) {
            const stepName = currentSteps[index].name;
            const measureFn = stepMeasurements.current[stepName];
            if (measureFn) {
                measureFn();
            } else {
                console.warn(`Walkthrough: Không tìm thấy khai báo cho step: ${stepName}`);
                if (onMeasureUpdateRef.current) onMeasureUpdateRef.current(null); // Fallback không highlight
            }
        } else {
            if (onMeasureUpdateRef.current) onMeasureUpdateRef.current(null);
        }
    }, []);

    const startWalkthrough = useCallback((newSteps: WalkthroughStep[], key?: string) => {
        setSteps(newSteps);
        setCurrentStepIndex(0);
        setIsActive(true);
        setEpicKey(key || 'home');
        measureActiveStep(0, newSteps);
    }, [measureActiveStep]);

    const nextStep = useCallback(() => {
        if (currentStepIndex < steps.length - 1) {
            const newIndex = currentStepIndex + 1;
            setCurrentStepIndex(newIndex);
            measureActiveStep(newIndex, steps);
        } else {
            skipWalkthrough(); // Xong rồi thì đóng
        }
    }, [currentStepIndex, steps, measureActiveStep]);

    const prevStep = useCallback(() => {
        if (currentStepIndex > 0) {
            const newIndex = currentStepIndex - 1;
            setCurrentStepIndex(newIndex);
            measureActiveStep(newIndex, steps);
        }
    }, [currentStepIndex, steps, measureActiveStep]);

    const skipWalkthrough = useCallback(() => {
        setIsActive(false);
        setCurrentStepIndex(0);
        setSteps([]);
        if (onMeasureUpdateRef.current) onMeasureUpdateRef.current(null);
        setEpicKey(undefined);
    }, []);

    // Các Component con gọi hàm này để đăng ký bản thân vào hệ thống Walkthrough
    const registerStep = useCallback((stepName: string, ref: React.RefObject<View>, onMeasure: (measurement: LayoutRectangle) => void) => {
        stepMeasurements.current[stepName] = () => {
            ref.current?.measureInWindow((x, y, width, height) => {
                const layout: LayoutRectangle = { x, y, width, height };
                if (onMeasureUpdateRef.current) {
                    onMeasureUpdateRef.current(layout);
                }
                onMeasure(layout);
            });
        };
    }, []);

    const unregisterStep = useCallback((stepName: string) => {
        delete stepMeasurements.current[stepName];
    }, []);

    return (
        <WalkthroughContext.Provider
            value={{
                isActive,
                currentStepIndex,
                steps,
                startWalkthrough,
                nextStep,
                prevStep,
                skipWalkthrough,
                registerStep,
                unregisterStep,
                epicKey,
                setOnMeasureUpdate
            }}
        >
            {children}
        </WalkthroughContext.Provider>
    );
};

export const useWalkthrough = () => {
    const context = useContext(WalkthroughContext);
    if (!context) {
        throw new Error('useWalkthrough must be used within a WalkthroughProvider');
    }
    return context;
};
