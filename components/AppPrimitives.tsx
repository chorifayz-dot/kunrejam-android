import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { ReactNode } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useColors } from '@/hooks/useColors';

export function IconButton({
  icon,
  onPress,
  color,
  size = 21,
  style,
  accessibilityLabel,
}: {
  icon: React.ComponentProps<typeof Feather>['name'];
  onPress: () => void;
  color?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel: string;
}) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.iconButton, style, pressed && styles.pressed]}
      hitSlop={10}
    >
      <Feather name={icon} size={size} color={color ?? colors.foreground} />
    </Pressable>
  );
}

export function Pill({
  label,
  icon,
  selected,
  onPress,
}: {
  label: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  selected?: boolean;
  onPress?: () => void;
}) {
  const colors = useColors();
  const content = (
    <>
      {icon ? <Ionicons name={icon} size={15} color={selected ? colors.primaryForeground : colors.mutedForeground} /> : null}
      <Text style={[styles.pillText, { color: selected ? colors.primaryForeground : colors.mutedForeground }]}>{label}</Text>
    </>
  );
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        { backgroundColor: selected ? colors.primary : colors.card, borderColor: selected ? colors.primary : colors.border },
        pressed && styles.pressed,
      ]}
    >
      {content}
    </Pressable>
  );
}

export function SectionLabel({ children, action, onAction }: { children: ReactNode; action?: string; onAction?: () => void }) {
  const colors = useColors();
  return (
    <View style={styles.sectionRow}>
      <Text style={[styles.sectionLabel, { color: colors.foreground }]}>{children}</Text>
      {action ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={[styles.actionText, { color: colors.mintDeep }]}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function EmptyState({ onAdd }: { onAdd: () => void }) {
  const colors = useColors();
  return (
    <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.mint }]}>
        <MaterialCommunityIcons name="calendar-check-outline" size={28} color={colors.mintDeep} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Bugun uchun reja yo‘q</Text>
      <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Kichik bir vazifa qo‘shing va kuningizni aniqroq boshlang.</Text>
      <Pressable onPress={onAdd} style={({ pressed }) => [styles.emptyButton, { backgroundColor: colors.primary }, pressed && styles.pressed]}>
        <Feather name="plus" size={18} color={colors.primaryForeground} />
        <Text style={[styles.emptyButtonText, { color: colors.primaryForeground }]}>Birinchi rejani qo‘shish</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  iconButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.65 },
  pill: { height: 36, paddingHorizontal: 14, borderRadius: 18, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  pillText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionLabel: { fontFamily: 'Inter_700Bold', fontSize: 17 },
  actionText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  empty: { borderWidth: 1, borderRadius: 24, padding: 26, alignItems: 'center', marginTop: 8 },
  emptyIcon: { width: 58, height: 58, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  emptyTitle: { fontFamily: 'Inter_700Bold', fontSize: 17, marginBottom: 6 },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19, textAlign: 'center', maxWidth: 270, marginBottom: 18 },
  emptyButton: { borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  emptyButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
});