import React, { useRef, useMemo, useEffect, useState } from 'react';
import { View, Text, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import Animated, {
    useAnimatedScrollHandler,
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    runOnJS
} from 'react-native-reanimated';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';

interface RulerPickerProps {
    min: number;
    max: number;
    step?: number;
    initialValue: number;
    unit: string;
    onValueChange: (val: number) => void;
}

const ITEM_WIDTH = 12; // Width between each small line
const INDICATOR_WIDTH = 4; // Width of the center indicator

export default function RulerPicker({
    min,
    max,
    step = 1,
    initialValue,
    unit,
    onValueChange
}: RulerPickerProps) {
    const range = (max - min) / step;
    const scrollViewRef = useRef<Animated.ScrollView>(null);
    const scrollX = useSharedValue(0);
    const windowWidth = wp('100%');
    const paddingHorizontal = windowWidth / 2 - ITEM_WIDTH / 2;

    const [currentValue, setCurrentValue] = useState(initialValue);

    // Initial offset calculation
    useEffect(() => {
        const initialOffset = ((initialValue - min) / step) * ITEM_WIDTH;
        setTimeout(() => {
            if (scrollViewRef.current) {
                scrollViewRef.current.scrollTo({ x: initialOffset, y: 0, animated: false });
            }
        }, 100);
    }, []);

    const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const boundedOffset = Math.max(0, Math.min(offsetX, range * ITEM_WIDTH));

        let index = Math.round(boundedOffset / ITEM_WIDTH);
        let newValue = min + index * step;

        // Ensure within bounds
        if (newValue < min) newValue = min;
        if (newValue > max) newValue = max;

        setCurrentValue(newValue);
        onValueChange(newValue);
    };

    const lastReportedValue = useSharedValue(initialValue);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollX.value = event.contentOffset.x;
            const boundedOffset = Math.max(0, Math.min(event.contentOffset.x, range * ITEM_WIDTH));
            const index = Math.round(boundedOffset / ITEM_WIDTH);
            let newValue = min + index * step;
            if (newValue < min) newValue = min;
            if (newValue > max) newValue = max;

            if (lastReportedValue.value !== newValue) {
                lastReportedValue.value = newValue;
                runOnJS(setCurrentValue)(newValue);
            }
        },
    });

    const renderRulerUnits = useMemo(() => {
        const segments = [];
        for (let i = 0; i <= range; i++) {
            const val = min + i * step;
            const isTenth = (val % 10) === 0;
            const isFifth = (val % 5) === 0 && !isTenth;

            let height = 16;
            let bgColor = 'bg-slate-300';
            let marginTop = 16;

            if (isTenth) {
                height = 32;
                bgColor = 'bg-emerald-500';
                marginTop = 0;
            } else if (isFifth) {
                height = 24;
                bgColor = 'bg-slate-400';
                marginTop = 8;
            }

            segments.push(
                <View key={i} style={{ width: ITEM_WIDTH, alignItems: 'center' }}>
                    <View className={`${bgColor} rounded-full`} style={{ width: 2, height, marginTop }} />
                    {isTenth && (
                        <Text style={{ width: 50, textAlign: 'center' }} className="text-slate-400 font-bold text-[11px] mt-1 absolute top-8 pt-1">{val}</Text>
                    )}
                </View>
            );
        }
        return segments;
    }, [min, max, step, range]);

    return (
        <View className="items-center w-full">
            {/* Center Display Value */}
            <View className="flex-row items-baseline mb-4">
                <Text className="text-[48px] font-black text-slate-800 tracking-tighter" style={{ includeFontPadding: false }}>
                    {currentValue}
                </Text>
                <Text className="text-[18px] font-bold text-slate-400 ml-2">{unit}</Text>
            </View>

            {/* Ruler container */}
            <View className="h-20 w-full justify-center relative">
                <Animated.ScrollView
                    ref={scrollViewRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    bounces={false}
                    onScroll={scrollHandler}
                    scrollEventThrottle={16}
                    onMomentumScrollEnd={handleScrollEnd}
                    onScrollEndDrag={handleScrollEnd}
                    contentContainerStyle={{
                        paddingHorizontal: paddingHorizontal,
                        alignItems: 'flex-start',
                    }}
                    snapToInterval={ITEM_WIDTH}
                    decelerationRate="fast"
                >
                    {renderRulerUnits}
                </Animated.ScrollView>

                {/* Center Indicator */}
                <View
                    style={{
                        position: 'absolute',
                        left: windowWidth / 2 - INDICATOR_WIDTH / 2,
                        top: 0,
                        width: INDICATOR_WIDTH,
                        height: 40,
                        backgroundColor: '#10b981', // Emerald 500
                        borderRadius: 4,
                        shadowColor: '#10b981',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.5,
                        shadowRadius: 8,
                        elevation: 5,
                    }}
                />
            </View>
        </View>
    );
}
