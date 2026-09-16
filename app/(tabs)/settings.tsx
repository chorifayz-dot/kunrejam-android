import { Feather, Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Linking, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useKunRejam } from '@/context/KunRejamContext';
import { useColors } from '@/hooks/useColors';

function SettingSwitch({ icon, title, subtitle, value, onChange, tint }: { icon: React.ComponentProps<typeof Feather>['name']; title: string; subtitle: string; value: boolean; onChange: (value: boolean) => void; tint: string }) {
  const colors = useColors();
  return <View style={[styles.settingRow, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={[styles.settingIcon, { backgroundColor: tint }]}><Feather name={icon} size={17} color={colors.mintDeep} /></View><View style={styles.settingCopy}><Text style={[styles.settingTitle, { color: colors.foreground }]}>{title}</Text><Text style={[styles.settingSubtitle, { color: colors.mutedForeground }]}>{subtitle}</Text></View><Switch value={value} onValueChange={onChange} trackColor={{ false: colors.border, true: colors.mint }} thumbColor={value ? colors.mintDeep : colors.mutedForeground} /></View>;
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { settings, setSettings, resetData, requestNotificationPermission } = useKunRejam();

  const handleNotifications = async (value: boolean) => {
    if (value) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        Alert.alert('Ruxsat kerak', 'Eslatmalar ishlashi uchun bildirishnomaga ruxsat bering.', [{ text: 'Bekor qilish', style: 'cancel' }, ...(Platform.OS !== 'web' ? [{ text: 'Sozlamalarni ochish', onPress: () => void Linking.openSettings() }] : [])]);
      }
    } else {
      await setSettings({ notificationsEnabled: false });
    }
  };

  const confirmReset = () => Alert.alert('Ma’lumotlarni tiklash', 'Barcha bajarilgan holatlar tozalanib, boshlang‘ich rejalar qaytariladi.', [{ text: 'Bekor qilish', style: 'cancel' }, { text: 'Tiklash', style: 'destructive', onPress: () => void resetData() }]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 110 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.header}><View><Text style={[styles.kicker, { color: colors.mintDeep }]}>ILOVA SOZLAMALARI</Text><Text style={[styles.title, { color: colors.foreground }]}>Sozlamalar</Text></View><View style={[styles.headerIcon, { backgroundColor: colors.lavender }]}><Feather name="sliders" size={19} color={colors.mintDeep} /></View></View>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Eslatmalar</Text>
        <SettingSwitch icon="bell" title="Bildirishnomalar" subtitle="Vazifa vaqti kelganda xabar bering" value={settings.notificationsEnabled} onChange={handleNotifications} tint={colors.accent} />
        <SettingSwitch icon="volume-2" title="Ovoz" subtitle="Eslatmalar ovoz bilan yangrasin" value={settings.soundEnabled} onChange={(value) => void setSettings({ soundEnabled: value })} tint={colors.cream} />
        <SettingSwitch icon="smartphone" title="Vibratsiya" subtitle="Bildirishnomada telefonga signal bering" value={settings.vibrationEnabled} onChange={(value) => void setSettings({ vibrationEnabled: value })} tint={colors.lavender} />
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Kun tartibi</Text>
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={[styles.infoIcon, { backgroundColor: colors.mint }]}><Ionicons name="phone-portrait-outline" size={19} color={colors.mintDeep} /></View><View style={styles.infoCopy}><Text style={[styles.infoTitle, { color: colors.foreground }]}>Offline ishlaydi</Text><Text style={[styles.infoText, { color: colors.mutedForeground }]}>Rejalaringiz shu qurilmada saqlanadi. Internet bo‘lmasa ham asosiy funksiyalar ishlaydi.</Text></View></View>
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={[styles.infoIcon, { backgroundColor: colors.cream }]}><Ionicons name="sparkles-outline" size={19} color={colors.amber} /></View><View style={styles.infoCopy}><Text style={[styles.infoTitle, { color: colors.foreground }]}>Gemini maslahatlari</Text><Text style={[styles.infoText, { color: colors.mutedForeground }]}>AI maslahatlari hozircha o‘chirilgan. Keyingi versiyada xavfsiz ulanish orqali qo‘shiladi.</Text></View></View>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Ma’lumotlar</Text>
        <Pressable onPress={confirmReset} style={({ pressed }) => [styles.resetButton, { borderColor: colors.destructive }, pressed && styles.pressed]}><Feather name="refresh-ccw" size={16} color={colors.destructive} /><Text style={[styles.resetText, { color: colors.destructive }]}>Boshlang‘ich ma’lumotlarni tiklash</Text></Pressable>
        <Text style={[styles.version, { color: colors.mutedForeground }]}>KunRejam · offline planner · 1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 18, paddingTop: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  kicker: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.2, marginBottom: 4 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 28 },
  headerIcon: { width: 42, height: 42, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontFamily: 'Inter_700Bold', fontSize: 17, marginTop: 15, marginBottom: 11 },
  settingRow: { minHeight: 72, borderWidth: 1, borderRadius: 17, paddingHorizontal: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  settingIcon: { width: 37, height: 37, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  settingCopy: { flex: 1 },
  settingTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13, marginBottom: 3 },
  settingSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 11 },
  infoCard: { borderWidth: 1, borderRadius: 17, padding: 13, flexDirection: 'row', marginBottom: 8 },
  infoIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  infoCopy: { flex: 1 },
  infoTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13, marginBottom: 4 },
  infoText: { fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 17 },
  resetButton: { height: 49, borderWidth: 1, borderRadius: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 2 },
  resetText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  version: { fontFamily: 'Inter_400Regular', fontSize: 11, textAlign: 'center', marginTop: 24 },
  pressed: { opacity: 0.65 },
});