import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedProps,
    withTiming,
    withRepeat,
    withSequence,
    Easing
} from 'react-native-reanimated';
import Svg, { Defs, RadialGradient as SvgRadialGradient, Rect, Stop } from 'react-native-svg';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

interface AnimatedBackgroundProps {
    color1?: string;
    color2?: string;
    color3?: string;
}

export default function AnimatedBackground({
    color1 = '#10B981', // Emerald 500
    color2 = '#34D399', // Emerald 400
    color3 = '#059669', // Emerald 600
}: AnimatedBackgroundProps) {

    // Animate positions for floating effect
    const cx1 = useSharedValue(0);
    const cy1 = useSharedValue(0);

    const cx2 = useSharedValue(100);
    const cy2 = useSharedValue(30);

    const cx3 = useSharedValue(0);
    const cy3 = useSharedValue(80);

    useEffect(() => {
        // Floating animations
        cx1.value = withRepeat(withSequence(withTiming(20, { duration: 5000, easing: Easing.inOut(Easing.ease) }), withTiming(0, { duration: 5000, easing: Easing.inOut(Easing.ease) })), -1, true);
        cy1.value = withRepeat(withSequence(withTiming(20, { duration: 4000, easing: Easing.inOut(Easing.ease) }), withTiming(0, { duration: 6000, easing: Easing.inOut(Easing.ease) })), -1, true);

        cx2.value = withRepeat(withSequence(withTiming(80, { duration: 6000, easing: Easing.inOut(Easing.ease) }), withTiming(100, { duration: 4000, easing: Easing.inOut(Easing.ease) })), -1, true);
        cy2.value = withRepeat(withSequence(withTiming(50, { duration: 5000, easing: Easing.inOut(Easing.ease) }), withTiming(30, { duration: 5000, easing: Easing.inOut(Easing.ease) })), -1, true);

        cx3.value = withRepeat(withSequence(withTiming(20, { duration: 5500, easing: Easing.inOut(Easing.ease) }), withTiming(0, { duration: 4500, easing: Easing.inOut(Easing.ease) })), -1, true);
        cy3.value = withRepeat(withSequence(withTiming(100, { duration: 4500, easing: Easing.inOut(Easing.ease) }), withTiming(80, { duration: 5500, easing: Easing.inOut(Easing.ease) })), -1, true);
    }, []);

    const animatedProps1 = useAnimatedProps(() => {
        return {
            fill: `url(#grad1)`,
            x: `${cx1.value}%`,
            y: `${cy1.value}%`
        } as any;
    });

    return (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }} pointerEvents="none">
            <Svg height="120%" width="120%" style={{ position: 'absolute', top: '-10%', left: '-10%' }}>
                <Defs>
                    <SvgRadialGradient id="grad1" cx="0%" cy="0%" rx="60%" ry="60%" fx="0%" fy="0%">
                        <Stop offset="0%" stopColor={color1} stopOpacity="0.2" />
                        <Stop offset="100%" stopColor={color1} stopOpacity="0" />
                    </SvgRadialGradient>
                    <SvgRadialGradient id="grad2" cx="100%" cy="30%" rx="50%" ry="50%" fx="100%" fy="30%">
                        <Stop offset="0%" stopColor={color2} stopOpacity="0.15" />
                        <Stop offset="100%" stopColor={color2} stopOpacity="0" />
                    </SvgRadialGradient>
                    <SvgRadialGradient id="grad3" cx="0%" cy="80%" rx="55%" ry="55%" fx="0%" fy="80%">
                        <Stop offset="0%" stopColor={color3} stopOpacity="0.15" />
                        <Stop offset="100%" stopColor={color3} stopOpacity="0" />
                    </SvgRadialGradient>
                </Defs>
                <AnimatedRect width="100%" height="100%" fill="url(#grad1)" />
                <AnimatedRect width="100%" height="100%" fill="url(#grad2)" />
                <AnimatedRect width="100%" height="100%" fill="url(#grad3)" />
            </Svg>
        </View>
    );
}
