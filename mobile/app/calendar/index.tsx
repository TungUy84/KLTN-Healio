import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { CalendarList, LocaleConfig } from 'react-native-calendars';

// Setup Vietnamese locale
LocaleConfig.locales['vi'] = {
    monthNames: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
    monthNamesShort: ['Th.1', 'Th.2', 'Th.3', 'Th.4', 'Th.5', 'Th.6', 'Th.7', 'Th.8', 'Th.9', 'Th.10', 'Th.11', 'Th.12'],
    dayNames: ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'],
    dayNamesShort: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
    today: 'Hôm nay'
};
LocaleConfig.defaultLocale = 'vi';

export default function FullCalendarScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState(new Date());

    return (
        <View className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" backgroundColor="white" translucent />

            {/* Header */}
            <View style={{ paddingTop: insets.top + 10 }} className="px-5 pb-3 border-b border-slate-100 flex-row items-center bg-white z-10 shadow-sm shadow-slate-100">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center mr-3"
                >
                    <Feather name="arrow-left" size={20} color="#334155" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-slate-800 flex-1">Lịch Toàn Cảnh</Text>
            </View>

            {/* Vertical Calendar List */}
            <CalendarList
                current={selectedDate.toISOString().split('T')[0]}
                pastScrollRange={24}
                futureScrollRange={1}
                scrollEnabled={true}
                showScrollIndicator={false}
                onDayPress={(day: any) => {
                    // Navigate back to the main calendar tab and pass the selected date
                    router.navigate({
                        pathname: '/(tabs)/calendar',
                        params: { selectedDate: day.dateString }
                    });
                }}
                theme={{
                    backgroundColor: '#ffffff',
                    calendarBackground: '#ffffff',
                    textSectionTitleColor: '#64748B',
                    selectedDayBackgroundColor: '#10B981',
                    selectedDayTextColor: '#ffffff',
                    todayTextColor: '#10B981',
                    dayTextColor: '#334155',
                    textDisabledColor: '#CBD5E1',
                    dotColor: '#10B981',
                    selectedDotColor: '#ffffff',
                    monthTextColor: '#0F172A',
                    textDayFontWeight: '500',
                    textMonthFontWeight: 'bold',
                    textDayHeaderFontWeight: '600',
                    textDayFontSize: 16,
                    textMonthFontSize: 18,
                    textDayHeaderFontSize: 13
                }}
                // Mock marked dates for heatmapping (Pro Feature 3)
                markedDates={{
                    [selectedDate.toISOString().split('T')[0]]: { selected: true, selectedColor: '#10B981' },
                    // Mocking some logged days for demonstration
                    '2026-02-20': { marked: true, dotColor: '#10B981' },
                    '2026-02-19': { marked: true, dotColor: '#F97316' }, // Cheat day warning
                    '2026-02-18': { marked: true, dotColor: '#10B981' },
                    '2026-02-17': { marked: true, dotColor: '#EAB308' }, // Not enough calories
                }}
            />
        </View>
    );
}
