import { Feather, Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getTodayTasks, getWeekSummary, useKunRejam } from '@/context/KunRejamContext';
import { useColors } from '@/hooks/useColors';

export default function StatsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { tasks } = useKunRejam();
  const today = getTodayTasks(tasks);
  const week = getWeekSummary(tasks);
  const completedToday = today.filter((task) => task.completed).length;
  const totalCompleted = tasks.reduce((total, task) => total + task.completionDates.length, 0);
  const bestDay = Math.max(...week.map((day) => day.count), 0);
  const maxBar = Math.max(bestDay, 1);
  const completionRate = today.length ? Math.round((completedToday / today.length) * 100) : 0;
  const streak = useMemo(() => {
    let count = 0;
    for (let index = week.length - 1; index >= 0; index -= 1) {
      if (week[index].count === 0) break;
      count += 1;
    }
    return count;
  }, [week]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 110 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.header}><View><Text style={[styles.kicker, { color: colors.mintDeep }]}>NATIJA VA KUNLIK ODAT</Text><Text style={[styles.title, { color: colors.foreground }]}>Statistika</Text></View><View style={[styles.headerIcon, { backgroundColor: colors.amber }]}><Ionicons name="trending-up" size={20} color={colors.navy} /></View></View>
        <View style={[styles.summaryCard, { backgroundColor: colors.primary }]}>
          <View><Text style={[styles.summaryKicker, { color: colors.mint }]}>BUGUNGI NATIJA</Text><Text style={[styles.summaryValue, { color: colors.primaryForeground }]}>{completionRate}%</Text><Text style={[styles.summaryText, { color: '#bdc6d4' }]}>{completedToday} ta reja bajarildi</Text></View>
          <View style={[styles.miniCircle, { borderColor: colors.mint }]}><Feather name="check" size={25} color={colors.mint} /></View>
        </View>
        <View style={styles.statRow}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={[styles.statIcon, { backgroundColor: colors.cream }]}><Ionicons name="flame-outline" size={18} color={colors.amber} /></View><Text style={[styles.statValue, { color: colors.foreground }]}>{streak}</Text><Text style={[styles.statLabel, { color: colors.mutedForeground }]}>kunlik streak</Text></View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={[styles.statIcon, { backgroundColor: colors.accent }]}><Feather name="check-circle" size={18} color={colors.mintDeep} /></View><Text style={[styles.statValue, { color: colors.foreground }]}>{totalCompleted}</Text><Text style={[styles.statLabel, { color: colors.mutedForeground }]}>jami bajarilgan</Text></View>
        </View>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Oxirgi 7 kun</Text>
        <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.chartArea}>
            {week.map((day) => <View key={day.key} style={styles.barColumn}><Text style={[styles.barCount, { color: colors.mutedForeground }]}>{day.count || ''}</Text><View style={[styles.barTrack, { backgroundColor: colors.muted }]}><View style={[styles.bar, { backgroundColor: day.count ? colors.mintDeep : colors.border, height: `${Math.max((day.count / maxBar) * 100, day.count ? 18 : 5)}%` }]} /></View><Text style={[styles.dayLabel, { color: colors.mutedForeground }]}>{day.label}</Text></View>)}
          </View>
        </View>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Kategoriyalar</Text>
        {(['work', 'health', 'study', 'sport', 'personal'] as const).map((category) => {
          const categoryTasks = tasks.filter((task) => task.category === category);
          const categoryDone = categoryTasks.reduce((total, task) => total + task.completionDates.length, 0);
          const labels = { work: 'Ish', health: 'Sog‘liq', study: 'O‘qish', sport: 'Sport', personal: 'Shaxsiy' };
          const icons = { work: 'briefcase-outline', health: 'heart-outline', study: 'book-outline', sport: 'walk-outline', personal: 'person-outline' } as const;
          return <View key={category} style={[styles.categoryRow, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={[styles.categoryIcon, { backgroundColor: colors.secondary }]}><Ionicons name={icons[category]} size={16} color={colors.mintDeep} /></View><Text style={[styles.categoryName, { color: colors.foreground }]}>{labels[category]}</Text><Text style={[styles.categoryCount, { color: colors.mutedForeground }]}>{categoryDone} bajarildi</Text></View>;
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 18, paddingTop: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  kicker: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.2, marginBottom: 4 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 28 },
  headerIcon: { width: 42, height: 42, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  summaryCard: { minHeight: 150, borderRadius: 24, padding: 21, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryKicker: { fontFamily: 'Inter_700Bold', letterSpacing: 1.1, fontSize: 10, marginBottom: 7 },
  summaryValue: { fontFamily: 'Inter_700Bold', fontSize: 40 },
  summaryText: { fontFamily: 'Inter_500Medium', fontSize: 12, marginTop: 3 },
  miniCircle: { width: 70, height: 70, borderWidth: 7, borderRadius: 35, alignItems: 'center', justifyContent: 'center' },
  statRow: { flexDirection: 'row', gap: 10, marginVertical: 12 },
  statCard: { flex: 1, minHeight: 124, borderWidth: 1, borderRadius: 19, padding: 14 },
  statIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  statValue: { fontFamily: 'Inter_700Bold', fontSize: 24 },
  statLabel: { fontFamily: 'Inter_500Medium', fontSize: 11, marginTop: 3 },
  sectionTitle: { fontFamily: 'Inter_700Bold', fontSize: 17, marginTop: 16, marginBottom: 12 },
  chartCard: { borderWidth: 1, borderRadius: 21, padding: 16 },
  chartArea: { height: 155, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  barColumn: { alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end' },
  barCount: { fontFamily: 'Inter_600SemiBold', fontSize: 10, height: 16 },
  barTrack: { width: 17, height: 96, borderRadius: 10, justifyContent: 'flex-end', overflow: 'hidden' },
  bar: { width: '100%', borderRadius: 10 },
  dayLabel: { fontFamily: 'Inter_500Medium', fontSize: 10, marginTop: 8, textTransform: 'uppercase' },
  categoryRow: { height: 57, borderWidth: 1, borderRadius: 16, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  categoryIcon: { width: 34, height: 34, borderRadius: 11, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  categoryName: { fontFamily: 'Inter_600SemiBold', fontSize: 13, flex: 1 },
  categoryCount: { fontFamily: 'Inter_500Medium', fontSize: 11 },
});