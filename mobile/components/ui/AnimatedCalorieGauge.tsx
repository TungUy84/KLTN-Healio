import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing, withDelay } from 'react-native-reanimated';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface AnimatedCalorieGaugeProps {
    value: number;
    target: number;
    delay?: number;
    duration?: number;
}

export const AnimatedCalorieGauge: React.FC<AnimatedCalorieGaugeProps> = ({
    value,
    target,
    delay = 200,
    duration = 1500
}) => {
    const SIZE = 122;
    const STROKE = 13;
    const r = (SIZE - STROKE) / 2; // bán kính
    const cx = SIZE / 2; // tâm x
    const cy = SIZE / 2; // tâm y
    const pctObj = Math.min(Math.max((value / (target || 1)) * 100, 0), 100);
    const pct = isNaN(pctObj) ? 0 : pctObj;

    const TOTAL = 235; // tổng cung 235°
    const START = 360 - TOTAL / 2; // tự động cân đối quanh 12 o'clock

    // Chuyển độ sang toạ độ SVG
    const pt = (deg: number) => {
        const rad = ((deg - 90) * Math.PI) / 180;
        return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
    };

    // Tạo SVG path cho cung tròn
    const arc = (from: number, to: number) => {
        if (to - from <= 0) return '';
        const s = pt(from);
        const e = pt(to);
        const large = to - from > 180 ? 1 : 0;
        return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`;
    };

    const bgArc = arc(START, START + TOTAL);
    const fgColor = pct >= 90 ? '#10B981' : pct >= 60 ? '#fb923c' : '#fb7185';

    const arcLength = r * (TOTAL * Math.PI / 180);
    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = 0; // reset
        progress.value = withDelay(delay, withTiming(pct / 100, {
            duration,
            easing: Easing.out(Easing.cubic)
        }));
    }, [pct, delay, duration]);

    const animatedProps = useAnimatedProps(() => {
        // Để có hiệu ứng bắt đầu từ số 0 mượt mà, dashoffset sẽ đi từ arcLength (ẩn hoàn toàn) về arcLength * (1 - pct)
        const strokeDashoffset = arcLength - (arcLength * progress.value);
        return {
            strokeDashoffset,
        };
    });

    return (
        <View style={{ width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={SIZE} height={SIZE} style={{ position: 'absolute' }}>
                {/* Vòng nền xám */}
                <Path
                    d={bgArc}
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth={STROKE}
                    strokeLinecap="round"
                />
                {/* Vòng tiến độ */}
                <AnimatedPath
                    d={bgArc}
                    fill="none"
                    stroke={fgColor}
                    strokeWidth={STROKE}
                    strokeLinecap="round"
                    strokeDasharray={arcLength}
                    animatedProps={animatedProps}
                />
            </Svg>
            {/* Text trung tâm */}
            <View style={{ alignItems: 'center', marginTop: -8 }}>
                <Text style={{ fontSize: 26, fontWeight: '900', color: '#1e293b', lineHeight: 30 }}>
                    {Math.round(value)}
                </Text>
                <Text style={{ fontSize: 11, fontWeight: '700', color: fgColor, lineHeight: 15 }}>
                    {Math.round(pct)}%
                </Text>
            </View>
        </View>
    );
};
