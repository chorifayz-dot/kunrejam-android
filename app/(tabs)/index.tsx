import { Feather, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { getTodayTasks, useKunRejam } from '@/context/KunRejamContext';
import { EmptyState, IconButton, Pill, SectionLabel } from '@/components/AppPrimitives';
import { PomodoroModal } from '@/components/PomodoroModal';
import { TaskEditorModal } from '@/components/TaskEditorModal';
import { Task, TaskCategory } from '@/types';

const categories: Array<{ key: TaskCategory | 'all'; label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }> = [
  { key: 'all', label: 'Barchasi', icon: 'apps-outline' },
  { key: 'work', label: 'Ish', icon: 'briefcase-outline' },
  { key: 'health', label: 'Sog‘liq', icon: 'heart-outline' },
  { key: 'study', label: 'O‘qish', icon: 'book-outline' },
  { key: 'sport', label: 'Sport', icon: 'walk-outline' },
];

const categoryMeta: Record<TaskCategory, { label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }> = {
  work: { label: 'Ish', icon: 'briefcase-outline' },
  study: { label: 'O‘qish', icon: 'book-outline' },
  health: { label: 'Sog‘liq', icon: 'heart-outline' },
  sport: { label: 'Sport', icon: 'walk-outline' },
  prayer: { label: 'Ibodat', icon: 'moon-outline' },
  personal: { label: 'Shaxsiy', icon: 'person-outline' },
  general: { label: 'Boshqa', icon: 'grid-outline' },
};

function TaskCard({ task, onToggle, onEdit }: { task: Task; onToggle: () => void; onEdit: () => void }) {
  const colors = useColors();
  const meta = categoryMeta[task.category];
  return (
    <Pressable onPress={onEdit} style={({ pressed }) => [styles.taskCard, { backgroundColor: colors.card, borderColor: colors.border }, pressed && styles.pressed]}>
      <Pressable onPress={onToggle} hitSlop={8} style={[styles.checkbox, { borderColor: task.completed ? colors.mintDeep : colors.border, backgroundColor: task.completed ? colors.mintDeep : 'transparent' }]}>
        {task.completed ? <Feather name="check" size={15} color={colors.primaryForeground} /> : null}
      </Pressable>
      <View style={styles.taskMain}>
        <Text numberOfLines={1} style={[styles.taskTitle, { color: task.completed ? colors.mutedForeground : colors.foreground }, task.completed && styles.completedText]}>{task.title}</Text>
        <View style={styles.taskMeta}>
          <Feather name="clock" size={12} color={colors.mutedForeground} />
          <Text style={[styles.taskTime, { color: colors.mutedForeground }]}>{task.time}</Text>
          <View style={[styles.metaDot, { backgroundColor: colors.border }]} />
          <Ionicons name={meta.icon} size={13} color={colors.mutedForeground} />
          <Text style={[styles.taskTime, { color: colors.mutedForeground }]}>{meta.label}</Text>
        </View>
      </View>
      <View style={styles.taskRight}>
        {task.reminder ? <Feather name="bell" size={14} color={colors.amber} /> : null}
        <Feather name="chevron-right" size={17} color={colors.mutedForeground} />
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { tasks, isLoading, toggleTask } = useKunRejam();
  const [filter, setFilter] = useState<TaskCategory | 'all'>('all');
  const [editorVisible, setEditorVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [pomodoroVisible, setPomodoroVisible] = useState(false);
  const today = getTodayTasks(tasks);
  const filteredTasks = useMemo(() => today.filter((task) => filter === 'all' || task.category === filter), [filter, today]);
  const completed = today.filter((task) => task.completed).length;
  const progress = today.length ? completed / today.length : 0;
  const dateLabel = new Date().toLocaleDateString('uz-UZ', { weekday: 'long', day: 'numeric', month: 'long' });
  const greeting = new Date().getHours() < 12 ? 'Xayrli tong' : new Date().getHours() < 18 ? 'Xayrli kun' : 'Xayrli kech';

  const openNew = () => {
    setEditingTask(null);
    setEditorVisible(true);
  };
  const openEdit = (task: Task) => {
    setEditingTask(task);
    setEditorVisible(true);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 110 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.mutedForeground }]}>{greeting}</Text>
            <Text style={[styles.date, { color: colors.foreground }]}>{dateLabel}</Text>
          </View>
          <View style={styles.headerActions}>
            <IconButton icon="play-circle" color={colors.mintDeep} accessibilityLabel="Pomodoro taymerini ochish" onPress={() => setPomodoroVisible(true)} />
            <IconButton icon="settings" color={colors.foreground} accessibilityLabel="Sozlamalarni ochish" onPress={() => router.push('/settings')} />
          </View>
        </View>
        <View style={[styles.hero, { backgroundColor: colors.primary }]}>
          <View style={styles.heroCopy}>
            <Text style={[styles.heroKicker, { color: colors.mint }]}>{completed === today.length && today.length > 0 ? 'AJOYIB NATIJA' : 'BUGUNGI MAQSAD'}</Text>
            <Text style={[styles.heroTitle, { color: colors.primaryForeground }]}>{completed === today.length && today.length > 0 ? 'Barcha rejalar bajarildi' : 'Kuningizni o‘zingiz boshqaring'}</Text>
            <Text style={[styles.heroText, { color: '#bdc6d4' }]}>{today.length ? `${completed} / ${today.length} ta reja bajarildi` : 'Bugungi birinchi rejangizni qo‘shing'}</Text>
          </View>
          <View style={[styles.progressRing, { borderColor: colors.mint }]}>
            <Text style={[styles.progressValue, { color: colors.primaryForeground }]}>{Math.round(progress * 100)}%</Text>
            <Text style={[styles.progressLabel, { color: colors.mint }]}>tayyor</Text>
          </View>
        </View>
        <View style={styles.quickRow}>
          <Pressable onPress={openNew} style={({ pressed }) => [styles.quickCard, { backgroundColor: colors.amber }, pressed && styles.pressed]}>
            <View style={styles.quickTop}><Feather name="plus" size={18} color={colors.navy} /><Text style={[styles.quickLabel, { color: colors.navy }]}>Yangi reja</Text></View>
            <Text style={[styles.quickCaption, { color: colors.navy }]}>Kuningizga vazifa qo‘shing</Text>
          </Pressable>
          <Pressable onPress={() => setPomodoroVisible(true)} style={({ pressed }) => [styles.quickCard, { backgroundColor: colors.mint }, pressed && styles.pressed]}>
            <View style={styles.quickTop}><Feather name="clock" size={18} color={colors.mintDeep} /><Text style={[styles.quickLabel, { color: colors.mintDeep }]}>Pomodoro</Text></View>
            <Text style={[styles.quickCaption, { color: colors.mintDeep }]}>Diqqat bilan ishlang</Text>
          </Pressable>
        </View>
        <SectionLabel action={today.length ? `${today.length} ta reja` : undefined}>Bugungi rejalar</SectionLabel>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {categories.map((category) => <Pill key={category.key} label={category.label} icon={category.icon} selected={filter === category.key} onPress={() => setFilter(category.key)} />)}
        </ScrollView>
        {isLoading ? <View style={[styles.loading, { backgroundColor: colors.card }]}><Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Rejalar yuklanmoqda...</Text></View> : filteredTasks.length ? (
          <FlatList
            data={filteredTasks}
            scrollEnabled={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <TaskCard task={item} onToggle={() => void toggleTask(item.id)} onEdit={() => openEdit(item)} />}
            ItemSeparatorComponent={() => <View style={{ height: 9 }} />}
          />
        ) : (
          <EmptyState onAdd={openNew} />
        )}
      </ScrollView>
      <TaskEditorModal visible={editorVisible} task={editingTask} onClose={() => setEditorVisible(false)} />
      <PomodoroModal visible={pomodoroVisible} onClose={() => setPomodoroVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 18, paddingTop: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 19 },
  greeting: { fontFamily: 'Inter_500Medium', fontSize: 13, marginBottom: 3 },
  date: { fontFamily: 'Inter_700Bold', fontSize: 22, textTransform: 'capitalize' },
  headerActions: { flexDirection: 'row', gap: 1 },
  hero: { minHeight: 159, borderRadius: 25, padding: 20, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
  heroCopy: { flex: 1, paddingRight: 12 },
  heroKicker: { fontFamily: 'Inter_700Bold', letterSpacing: 1.3, fontSize: 10, marginBottom: 10 },
  heroTitle: { fontFamily: 'Inter_700Bold', fontSize: 21, lineHeight: 27, marginBottom: 8 },
  heroText: { fontFamily: 'Inter_500Medium', fontSize: 12 },
  progressRing: { width: 84, height: 84, borderRadius: 42, borderWidth: 8, justifyContent: 'center', alignItems: 'center' },
  progressValue: { fontFamily: 'Inter_700Bold', fontSize: 20 },
  progressLabel: { fontFamily: 'Inter_500Medium', fontSize: 10, marginTop: 2 },
  quickRow: { flexDirection: 'row', gap: 9, marginTop: 12, marginBottom: 26 },
  quickCard: { flex: 1, minHeight: 84, borderRadius: 19, padding: 14, justifyContent: 'space-between' },
  quickTop: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  quickLabel: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  quickCaption: { fontFamily: 'Inter_500Medium', fontSize: 10, opacity: 0.8 },
  filters: { gap: 8, paddingBottom: 14 },
  taskCard: { minHeight: 76, borderWidth: 1, borderRadius: 18, paddingHorizontal: 13, paddingVertical: 12, flexDirection: 'row', alignItems: 'center' },
  checkbox: { width: 27, height: 27, borderRadius: 9, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  taskMain: { flex: 1 },
  taskTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14, marginBottom: 8 },
  completedText: { textDecorationLine: 'line-through' },
  taskMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  taskTime: { fontFamily: 'Inter_500Medium', fontSize: 11 },
  metaDot: { width: 3, height: 3, borderRadius: 2, marginHorizontal: 2 },
  taskRight: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 8 },
  loading: { minHeight: 100, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontFamily: 'Inter_500Medium', fontSize: 13 },
  pressed: { opacity: 0.7 },
});