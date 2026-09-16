import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

export function PomodoroModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const colors = useColors();
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setSeconds((current) => (current > 0 ? current - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [running]);

  useEffect(() => {
    if (seconds === 0) setRunning(false);
  }, [seconds]);

  const reset = () => {
    setRunning(false);
    setSeconds(25 * 60);
  };
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const remainder = (seconds % 60).toString().padStart(2, '0');
  const progress = 1 - seconds / (25 * 60);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: 'rgba(9, 15, 25, 0.48)' }]}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.header}><View><Text style={[styles.kicker, { color: colors.mintDeep }]}>DIQQAT REJIMI</Text><Text style={[styles.title, { color: colors.foreground }]}>Pomodoro</Text></View><Pressable onPress={onClose} hitSlop={10}><Feather name="x" size={21} color={colors.mutedForeground} /></Pressable></View>
          <View style={[styles.timerCircle, { borderColor: colors.mint }]}>
            <View style={[styles.progressDot, { backgroundColor: progress > 0 ? colors.amber : colors.mint }]} />
            <Text style={[styles.timer, { color: colors.foreground }]}>{minutes}:{remainder}</Text>
            <Text style={[styles.timerCaption, { color: colors.mutedForeground }]}>{seconds === 0 ? 'Tayyor!' : running ? 'Diqqatni saqlang' : 'Boshlashga tayyor'}</Text>
          </View>
          <View style={styles.controls}>
            <Pressable onPress={reset} style={[styles.secondaryButton, { borderColor: colors.border }]}><Feather name="rotate-ccw" size={17} color={colors.mutedForeground} /><Text style={[styles.secondaryText, { color: colors.foreground }]}>Qayta</Text></Pressable>
            <Pressable onPress={() => setRunning((value) => !value)} style={[styles.primaryButton, { backgroundColor: colors.primary }]}><Feather name={running ? 'pause' : 'play'} size={18} color={colors.primaryForeground} /><Text style={[styles.primaryText, { color: colors.primaryForeground }]}>{running ? 'Pauza' : 'Boshlash'}</Text></Pressable>
          </View>
          <View style={[styles.tip, { backgroundColor: colors.accent }]}><Feather name="info" size={15} color={colors.mintDeep} /><Text style={[styles.tipText, { color: colors.accentForeground }]}>25 daqiqa ish, so‘ng 5 daqiqa dam olish.</Text></View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 22 },
  card: { width: '100%', borderRadius: 28, padding: 22 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  kicker: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.3, marginBottom: 4 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 24 },
  timerCircle: { width: 214, height: 214, borderRadius: 107, borderWidth: 11, alignSelf: 'center', marginVertical: 24, justifyContent: 'center', alignItems: 'center' },
  progressDot: { width: 9, height: 9, borderRadius: 5, position: 'absolute', top: 12 },
  timer: { fontFamily: 'Inter_700Bold', fontSize: 42, letterSpacing: -1 },
  timerCaption: { fontFamily: 'Inter_500Medium', fontSize: 12, marginTop: 4 },
  controls: { flexDirection: 'row', gap: 10 },
  secondaryButton: { flex: 1, height: 50, borderWidth: 1, borderRadius: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  primaryButton: { flex: 1.4, height: 50, borderRadius: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  secondaryText: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  primaryText: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  tip: { marginTop: 18, minHeight: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 7 },
  tipText: { fontFamily: 'Inter_500Medium', fontSize: 11 },
});