import React, { useEffect } from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    Easing,
} from 'react-native-reanimated';

interface Props {
    progress: number; // 0 to 100
    color?: string;
    backgroundColor?: string;
    height?: number;
    delay?: number;
    duration?: number;
    containerClassName?: string;
    barClassName?: string;
    style?: StyleProp<ViewStyle>;
    showThumb?: boolean;
}

export const AnimatedProgressBar = ({
    progress,
    color = '#10B981',
    backgroundColor = '#F1F5F9', // slate-100
    height = 6,
    delay = 0,
    duration = 800,
    containerClassName = '',
    barClassName = '',
    style,
    showThumb = false,
}: Props) => {
    const widthShared = useSharedValue(0);

    // Bắt kẹp giá trị progress từ 0 - 100
    const safeProgress = Math.min(Math.max(progress, 0), 100);

    useEffect(() => {
        widthShared.value = withDelay(
            delay,
            withTiming(safeProgress, {
                duration,
                easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            })
        );
    }, [safeProgress, delay, duration]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            width: `${widthShared.value}%`,
        };
    });

    return (
        <View
            className={`overflow-hidden rounded-full ${containerClassName}`}
            style={[{ height, backgroundColor }, style]}
        >
            <Animated.View
                style={[animatedStyle, { height: '100%', backgroundColor: color }]}
                className={`rounded-full relative ${barClassName}`}
            >
                {showThumb && (
                    <View className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-white rounded-full shadow-sm border-2" style={{ borderColor: color }} />
                )}
            </Animated.View>
        </View>
    );
};
