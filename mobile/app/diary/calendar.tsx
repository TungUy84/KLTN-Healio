import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { CalendarList, LocaleConfig } from 'react-native-calendars';
import { BlurView } from 'expo-blur';
import Svg, { Defs, RadialGradient as SvgRadialGradient, Rect, Stop } from 'react-native-svg';

// Setup Vietnamese locale
LocaleConfig.locales['vi'] = {
    monthNames: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
    monthNamesShort: ['Th.1', 'Th.2', 'Th.3', 'Th.4', 'Th.5', 'Th.6', 'Th.7', 'Th.8', 'Th.9', 'Th.10', 'Th.11', 'Th.12'],
    dayNames: ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'],
    dayNamesShort: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
    today: 'Hôm nay'
};
LocaleConfig.defaultLocale = 'vi';

const AmbientGlowBackground = () => (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} pointerEvents="none">
        <Svg height="100%" width="100%">
            <Defs>
                <SvgRadialGradient id="grad1" cx="0%" cy="0%" rx="60%" ry="60%" fx="0%" fy="0%">
                    <Stop offset="0%" stopColor="#10B981" stopOpacity="0.1" />
                    <Stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                </SvgRadialGradient>
                <SvgRadialGradient id="grad2" cx="100%" cy="100%" rx="50%" ry="50%" fx="100%" fy="100%">
                    <Stop offset="0%" stopColor="#059669" stopOpacity="0.08" />
                    <Stop offset="100%" stopColor="#059669" stopOpacity="0" />
                </SvgRadialGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad1)" />
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad2)" />
        </Svg>
    </View>
);

export default function FullCalendarScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState(new Date());

    return (
        <View className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
            <AmbientGlowBackground />

            {/* Header Blur */}
            <BlurView tint="light" intensity={90} style={{ paddingTop: insets.top + 12, paddingBottom: 16 }} className="px-6 flex-row items-center z-50 border-b border-white/40">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-11 h-11 bg-white/60 rounded-full flex items-center justify-center mr-4 border border-white/60 shadow-sm shadow-slate-100"
                >
                    <Feather name="arrow-left" size={20} color="#334155" />
                </TouchableOpacity>
                <View>
                    <Text className="text-2xl font-[900] text-slate-800 tracking-tighter">Lịch toàn cảnh</Text>
                    <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Xem lại nhật ký dinh dưỡng</Text>
                </View>
            </BlurView>

            {/* Vertical Calendar List */}
            <CalendarList
                current={selectedDate.toISOString().split('T')[0]}
                pastScrollRange={24}
                futureScrollRange={1}
                scrollEnabled={true}
                showScrollIndicator={false}
                calendarHeight={380}
                onDayPress={(day: any) => {
                    router.navigate({
                        pathname: '/(tabs)/diary',
                        params: { selectedDate: day.dateString }
                    });
                }}
                theme={{
                    backgroundColor: 'transparent',
                    calendarBackground: 'transparent',
                    textSectionTitleColor: '#94A3B8',
                    selectedDayBackgroundColor: '#10B981',
                    selectedDayTextColor: '#ffffff',
                    todayTextColor: '#10B981',
                    dayTextColor: '#334155',
                    textDisabledColor: '#E2E8F0',
                    dotColor: '#10B981',
                    selectedDotColor: '#ffffff',
                    monthTextColor: '#1E293B',
                    textDayFontWeight: '800',
                    textMonthFontWeight: '900',
                    textDayHeaderFontWeight: '700',
                    textDayFontSize: 16,
                    textMonthFontSize: 20,
                    textDayHeaderFontSize: 12,
                    // @ts-ignore
                    'stylesheet.calendar.header': {
                        header: {
                            flexDirection: 'row',
                            justifyContent: 'center',
                            paddingLeft: 10,
                            paddingRight: 10,
                            marginTop: 15,
                            alignItems: 'center'
                        },
                        monthText: {
                            fontSize: 20,
                            fontWeight: '900',
                            color: '#1E293B',
                            margin: 10,
                            letterSpacing: -0.5
                        }
                    }
                }}
                markedDates={{
                    [selectedDate.toISOString().split('T')[0]]: { selected: true, selectedColor: '#10B981' },
                    '2026-03-01': { marked: true, dotColor: '#10B981' },
                }}
            />
        </View>
    );
}
