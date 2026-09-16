import { Feather, Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Keyboard, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { NewTask, Task, TaskCategory, TaskPriority, RepeatRule } from '@/types';
import { useKunRejam } from '@/context/KunRejamContext';

const categoryOptions: Array<{ key: TaskCategory; label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }> = [
  { key: 'work', label: 'Ish', icon: 'briefcase-outline' },
  { key: 'study', label: 'O‘qish', icon: 'book-outline' },
  { key: 'health', label: 'Sog‘liq', icon: 'heart-outline' },
  { key: 'sport', label: 'Sport', icon: 'walk-outline' },
  { key: 'prayer', label: 'Ibodat', icon: 'moon-outline' },
  { key: 'personal', label: 'Shaxsiy', icon: 'person-outline' },
  { key: 'general', label: 'Boshqa', icon: 'grid-outline' },
];
const repeatOptions: Array<{ key: RepeatRule; label: string }> = [
  { key: 'once', label: 'Bir marta' },
  { key: 'daily', label: 'Har kuni' },
  { key: 'weekdays', label: 'Ish kunlari' },
  { key: 'weekly', label: 'Har hafta' },
];

export function TaskEditorModal({ visible, task, onClose }: { visible: boolean; task?: Task | null; onClose: () => void }) {
  const colors = useColors();
  const { addTask, updateTask, deleteTask } = useKunRejam();
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('09:00');
  const [category, setCategory] = useState<TaskCategory>('general');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [repeat, setRepeat] = useState<RepeatRule>('once');
  const [reminder, setReminder] = useState(true);
  const [sound, setSound] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!visible) return;
    setTitle(task?.title ?? '');
    setTime(task?.time ?? '09:00');
    setCategory(task?.category ?? 'general');
    setPriority(task?.priority ?? 'medium');
    setRepeat(task?.repeat ?? 'once');
    setReminder(task?.reminder ?? true);
    setSound(task?.sound ?? true);
    setError('');
  }, [task, visible]);

  const save = async () => {
    const trimmed = title.trim();
    if (!trimmed) {
      setError('Vazifa nomini kiriting.');
      return;
    }
    if (!/^\d{2}:\d{2}$/.test(time) || Number(time.slice(0, 2)) > 23 || Number(time.slice(3)) > 59) {
      setError('Vaqtni HH:MM ko‘rinishida kiriting.');
      return;
    }
    Keyboard.dismiss();
    const input: NewTask = { title: trimmed, time, category, priority, repeat, reminder, sound };
    if (task) await updateTask(task.id, input);
    else await addTask(input);
    onClose();
  };

  const remove = async () => {
    if (!task) return;
    await deleteTask(task.id);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: 'rgba(9, 15, 25, 0.42)' }]}>
        <View style={[styles.sheet, { backgroundColor: colors.background }]}>
          <View style={styles.sheetHeader}>
            <View>
              <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>{task ? 'REJANI TAHRIRLASH' : 'YANGI REJA'}</Text>
              <Text style={[styles.title, { color: colors.foreground }]}>{task ? 'Vazifani yangilang' : 'Bugun nima muhim?'}</Text>
            </View>
            <Pressable onPress={onClose} style={({ pressed }) => [styles.close, { backgroundColor: colors.card }, pressed && styles.pressed]}>
              <Feather name="x" size={20} color={colors.foreground} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <Text style={[styles.label, { color: colors.foreground }]}>Vazifa nomi</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Masalan: Kitob o‘qish"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { backgroundColor: colors.card, borderColor: error ? colors.destructive : colors.border, color: colors.foreground }]}
              autoFocus={!task}
            />
            <View style={styles.twoColumns}>
              <View style={styles.column}>
                <Text style={[styles.label, { color: colors.foreground }]}>Vaqt</Text>
                <View style={[styles.timeInput, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Feather name="clock" size={17} color={colors.mintDeep} />
                  <TextInput value={time} onChangeText={setTime} keyboardType="numbers-and-punctuation" maxLength={5} style={[styles.timeText, { color: colors.foreground }]} />
                </View>
              </View>
              <View style={styles.column}>
                <Text style={[styles.label, { color: colors.foreground }]}>Muhimlik</Text>
                <View style={styles.priorityRow}>
                  {(['low', 'medium', 'high'] as TaskPriority[]).map((value) => (
                    <Pressable key={value} onPress={() => setPriority(value)} style={[styles.priority, { backgroundColor: priority === value ? colors.amber : colors.card, borderColor: priority === value ? colors.amber : colors.border }]}>
                      <Text style={[styles.priorityText, { color: priority === value ? colors.navy : colors.mutedForeground }]}>{value === 'low' ? 'Past' : value === 'medium' ? 'O‘rta' : 'Yuqori'}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
            <Text style={[styles.label, { color: colors.foreground }]}>Kategoriya</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalOptions}>
              {categoryOptions.map((option) => (
                <Pressable key={option.key} onPress={() => setCategory(option.key)} style={[styles.categoryOption, { backgroundColor: category === option.key ? colors.primary : colors.card, borderColor: category === option.key ? colors.primary : colors.border }]}>
                  <Ionicons name={option.icon} size={16} color={category === option.key ? colors.primaryForeground : colors.mutedForeground} />
                  <Text style={[styles.optionText, { color: category === option.key ? colors.primaryForeground : colors.mutedForeground }]}>{option.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Text style={[styles.label, { color: colors.foreground }]}>Takrorlanish</Text>
            <View style={styles.repeatGrid}>
              {repeatOptions.map((option) => (
                <Pressable key={option.key} onPress={() => setRepeat(option.key)} style={[styles.repeatOption, { backgroundColor: repeat === option.key ? colors.accent : colors.card, borderColor: repeat === option.key ? colors.mintDeep : colors.border }]}>
                  <Text style={[styles.optionText, { color: repeat === option.key ? colors.accentForeground : colors.mutedForeground }]}>{option.label}</Text>
                </Pressable>
              ))}
            </View>
            <View style={[styles.settingRow, { borderTopColor: colors.border }]}>
              <View style={styles.settingCopy}><View style={[styles.settingIcon, { backgroundColor: colors.lavender }]}><Feather name="bell" size={16} color={colors.mintDeep} /></View><View><Text style={[styles.settingTitle, { color: colors.foreground }]}>Eslatma</Text><Text style={[styles.settingSub, { color: colors.mutedForeground }]}>Belgilangan vaqtda xabar yuborish</Text></View></View>
              <Switch value={reminder} onValueChange={setReminder} trackColor={{ false: colors.border, true: colors.mint }} thumbColor={reminder ? colors.mintDeep : colors.mutedForeground} />
            </View>
            <View style={styles.settingRow}>
              <View style={styles.settingCopy}><View style={[styles.settingIcon, { backgroundColor: colors.cream }]}><Feather name="volume-2" size={16} color={colors.amber} /></View><View><Text style={[styles.settingTitle, { color: colors.foreground }]}>Ovoz</Text><Text style={[styles.settingSub, { color: colors.mutedForeground }]}>Eslatma ovoz bilan kelsin</Text></View></View>
              <Switch value={sound} onValueChange={setSound} trackColor={{ false: colors.border, true: colors.mint }} thumbColor={sound ? colors.mintDeep : colors.mutedForeground} />
            </View>
            {error ? <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text> : null}
            <Pressable onPress={save} style={({ pressed }) => [styles.saveButton, { backgroundColor: colors.primary }, pressed && styles.pressed]}>
              <Feather name={task ? 'check' : 'plus'} size={18} color={colors.primaryForeground} />
              <Text style={[styles.saveText, { color: colors.primaryForeground }]}>{task ? 'O‘zgarishlarni saqlash' : 'Rejani qo‘shish'}</Text>
            </Pressable>
            {task ? <Pressable onPress={remove} style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}><Feather name="trash-2" size={16} color={colors.destructive} /><Text style={[styles.deleteText, { color: colors.destructive }]}>Bu rejani o‘chirish</Text></Pressable> : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 30, borderTopRightRadius: 30, maxHeight: '93%', paddingTop: 20 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 22, paddingBottom: 8 },
  eyebrow: { fontFamily: 'Inter_700Bold', letterSpacing: 1.2, fontSize: 10, marginBottom: 5 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 24 },
  close: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 22, paddingBottom: 36 },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: 13, marginTop: 12, marginBottom: 8 },
  input: { height: 52, borderWidth: 1, borderRadius: 15, paddingHorizontal: 15, fontFamily: 'Inter_500Medium', fontSize: 15 },
  twoColumns: { flexDirection: 'row', gap: 12 },
  column: { flex: 1 },
  timeInput: { height: 48, borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 7 },
  timeText: { flex: 1, fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  priorityRow: { flexDirection: 'row', gap: 4 },
  priority: { flex: 1, height: 48, borderWidth: 1, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  priorityText: { fontFamily: 'Inter_600SemiBold', fontSize: 10 },
  horizontalOptions: { gap: 8, paddingBottom: 2 },
  categoryOption: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 37, paddingHorizontal: 11, borderRadius: 14, borderWidth: 1 },
  optionText: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  repeatGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  repeatOption: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 13, paddingVertical: 10 },
  settingRow: { minHeight: 64, borderTopWidth: 1, marginTop: 12, paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  settingCopy: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  settingIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  settingTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13, marginBottom: 2 },
  settingSub: { fontFamily: 'Inter_400Regular', fontSize: 11 },
  error: { fontFamily: 'Inter_500Medium', fontSize: 12, marginTop: 10 },
  saveButton: { height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginTop: 20 },
  saveText: { fontFamily: 'Inter_700Bold', fontSize: 14 },
  deleteButton: { height: 42, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 7, marginTop: 4 },
  deleteText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  pressed: { opacity: 0.7 },
});