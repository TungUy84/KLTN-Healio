import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Platform, StyleSheet, LayoutRectangle } from 'react-native';
import { useWalkthrough } from '../../context/WalkthroughContext';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authService } from '../../services/authService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function WalkthroughOverlay() {
    const {
        isActive,
        currentStepIndex,
        steps,
        nextStep,
        prevStep,
        skipWalkthrough,
        epicKey,
        setOnMeasureUpdate
    } = useWalkthrough();

    const [activeMeasurement, setActiveMeasurement] = useState<LayoutRectangle | null>(null);

    useEffect(() => {
        setOnMeasureUpdate((layout) => {
            setActiveMeasurement(layout);
        });
    }, [setOnMeasureUpdate]);

    const insets = useSafeAreaInsets();

    if (!isActive || steps.length === 0) return null;

    const currentStep = steps[currentStepIndex];

    const markAsSeen = async () => {
        try {
            if (epicKey === 'home') {
                await authService.markTutorialSeen();
            } else if (epicKey) {
                await authService.markEpicTutorialSeen(epicKey);
            }
        } catch (error) {
            console.error('Failed to mark tutorial as seen', error);
        }
    };

    const handleSkip = () => {
        markAsSeen();
        skipWalkthrough();
    };

    const handleNext = () => {
        if (currentStepIndex === steps.length - 1) {
            handleSkip(); // Done
        } else {
            nextStep();
        }
    };

    // Tooltip Placement Logic
    let tooltipTop = SCREEN_HEIGHT / 2;
    let isArrowUp = true;
    let arrowLeft = SCREEN_WIDTH / 2;

    if (activeMeasurement) {
        const { y, height, x, width } = activeMeasurement;
        // Xét xem target nằm nửa trên hay nửa dưới màn hình để tooltip đặt ở phía ngược lại
        if (y > SCREEN_HEIGHT / 2) {
            // Đặt Tooltip ở BÊN TRÊN target
            tooltipTop = y - 10;
            isArrowUp = false;
        } else {
            // Đặt Tooltip ở BÊN DƯỚI target
            tooltipTop = y + height + 10;
            isArrowUp = true;
        }
        // Căn giữa arrow theo target
        arrowLeft = Math.min(Math.max(x + width / 2, 40), SCREEN_WIDTH - 40); // clamp arrow
    }

    const bWidth = Math.max(SCREEN_HEIGHT, SCREEN_WIDTH) * 2;
    const overlayStyle = activeMeasurement ? {
        left: activeMeasurement.x + activeMeasurement.width / 2 - bWidth,
        top: activeMeasurement.y + activeMeasurement.height / 2 - bWidth,
        width: bWidth * 2,
        height: bWidth * 2,
        borderWidth: bWidth,
        borderColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: activeMeasurement.width > activeMeasurement.height ? activeMeasurement.width : bWidth, // Hình tròn/Vuông bo góc theo mục tiêu
        position: 'absolute' as const,
    } : {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    };

    return (
        <View style={[StyleSheet.absoluteFill, { zIndex: 9999, elevation: 999 }]} pointerEvents="box-none">

            {/* 1. Backdrop Highlight (Hole) */}
            <View
                key="walkthrough-backdrop"
                style={overlayStyle as any}
            />

            {/* 2. Tooltip Box */}
            {activeMeasurement && (
                <View
                    key="walkthrough-tooltip"
                    style={{
                        position: 'absolute',
                        width: SCREEN_WIDTH - 48,
                        left: 24,
                        top: isArrowUp ? tooltipTop : undefined,
                        bottom: !isArrowUp ? (SCREEN_HEIGHT - tooltipTop) : undefined,
                        zIndex: 10000,
                    }}
                >
                    {/* Mũi tên (Arrow) chỉ vào Item */}
                    <View style={{
                        width: 0, height: 0,
                        borderLeftWidth: 10, borderRightWidth: 10,
                        borderBottomWidth: isArrowUp ? 10 : 0,
                        borderTopWidth: !isArrowUp ? 10 : 0,
                        borderLeftColor: 'transparent', borderRightColor: 'transparent',
                        borderBottomColor: isArrowUp ? 'white' : 'transparent',
                        borderTopColor: !isArrowUp ? 'white' : 'transparent',
                        position: 'absolute',
                        top: isArrowUp ? -10 : undefined,
                        bottom: !isArrowUp ? -10 : undefined,
                        left: arrowLeft - 34 // Offset left 24 của container + nửa width
                    }} />

                    {/* Hộp nội dung */}
                    <View className="bg-white rounded-2xl p-5 shadow-xl shadow-black/20">
                        <Text className="text-emerald-600 font-black text-xs uppercase tracking-widest mb-1.5">
                            Bước {currentStepIndex + 1} / {steps.length}
                        </Text>
                        <Text className="text-slate-900 font-bold text-lg mb-2">{currentStep.title}</Text>
                        <Text className="text-slate-600 font-medium leading-5 mb-5">{currentStep.content}</Text>

                        {/* Điều hướng */}
                        <View className="flex-row items-center justify-between">
                            <TouchableOpacity onPress={handleSkip} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                <Text className="text-slate-400 font-semibold text-sm">Bỏ qua</Text>
                            </TouchableOpacity>

                            <View className="flex-row items-center gap-2">
                                {currentStepIndex > 0 && (
                                    <TouchableOpacity onPress={prevStep} className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center">
                                        <Ionicons name="chevron-back" size={20} color="#64748B" />
                                    </TouchableOpacity>
                                )}

                                <TouchableOpacity onPress={handleNext} className="px-5 h-10 rounded-full bg-emerald-500 items-center justify-center flex-row gap-1 shadow-sm shadow-emerald-200">
                                    <Text className="text-white font-bold text-sm">
                                        {currentStepIndex === steps.length - 1 ? 'Hoàn tất' : 'Tiếp theo'}
                                    </Text>
                                    {currentStepIndex !== steps.length - 1 && <Ionicons name="chevron-forward" size={16} color="white" />}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            )}

        </View>
    );
}
