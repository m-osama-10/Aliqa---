/* ================================================================== */
/*  NotificationsScreen                                                */
/* ================================================================== */

import React, { useEffect } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAuth } from "../../hooks/useAuth";
import { useLang } from "../../utils/i18n";
import { COLORS } from "../../utils/constants";
import { AdBanner320, AdSmartlink } from "../../components/Ads/AdNetwork";
import { useNotifications } from "../../hooks/useNotifications";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { EmptyState } from "../../components/EmptyState";
import { fmtRelative } from "../../utils/helpers";
import type { NotificationType } from "../../types/db";
import type { RootStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Notifications">;

const TYPE_EMOJI: Record<NotificationType, string> = {
  info: "ℹ️",
  warning: "⚠️",
  success: "✅",
  error: "❌",
  ad: "📢",
  system: "🔔",
};

const TYPE_COLOR: Record<NotificationType, string> = {
  info: COLORS.brand,
  warning: COLORS.accent,
  success: COLORS.brand,
  error: COLORS.danger,
  ad: "#4a73b5",
  system: COLORS.textSecondary,
};

export function NotificationsScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { t, lang } = useLang();
  const { notifications, loading, unread, markRead, markAllRead, refresh } =
    useNotifications(user?.id);

  useEffect(() => {
    const unsub = navigation.addListener("focus", () => void refresh());
    return unsub;
  }, [navigation, refresh]);

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.scroll}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t("notifications.title")}</Text>
          {unread > 0 ? (
            <Text style={styles.subtitle}>
              {t("notifications.unread_count", { n: unread })}
            </Text>
          ) : null}
        </View>
        {unread > 0 ? (
          <Pressable style={styles.markAllBtn} onPress={() => void markAllRead()}>
            <Text style={styles.markAllBtnText}>{t("notifications.mark_all_read")}</Text>
          </Pressable>
        ) : null}
      </View>

      {loading && notifications.length === 0 ? (
        <LoadingSpinner fullScreen />
      ) : notifications.length === 0 ? (
        <EmptyState emoji="🔔" title={t("notifications.empty")} />
      ) : (
        <View style={styles.list}>
          {notifications.map((n) => (
            <Pressable
              key={n.id}
              style={[styles.card, !n.is_read && styles.cardUnread]}
              onPress={() => markRead(n.id)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.emoji}>{TYPE_EMOJI[n.type]}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.title2}>{n.title}</Text>
                  <Text style={styles.time}>
                    {fmtRelative(n.created_at, lang === "ar" ? "ar-EG" : "en-GB")}
                  </Text>
                </View>
                {!n.is_read ? <View style={styles.unreadDot} /> : null}
              </View>
              <Text style={styles.body}>{n.body}</Text>
            </Pressable>
          ))}
        </View>
      )}
      {/* Ad network banner */}
      <View style={{marginTop: 12}}>
        <AdBanner320 />
      </View>
      <View style={{marginTop: 8, alignItems: "center"}}>
        <AdSmartlink variant="banner" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: 16, paddingBottom: 32 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  title: { fontSize: 22, fontWeight: "800", color: COLORS.textPrimary },
  subtitle: { fontSize: 13, color: COLORS.brand, marginTop: 2 },
  markAllBtn: {
    backgroundColor: COLORS.brandSoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.brand,
  },
  markAllBtnText: { color: COLORS.brand, fontSize: 12, fontWeight: "700" },

  list: { gap: 8 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardUnread: {
    backgroundColor: COLORS.brandSoft,
    borderColor: COLORS.brandBorder,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  emoji: { fontSize: 20 },
  title2: { fontSize: 14, fontWeight: "700", color: COLORS.textPrimary, flex: 1 },
  time: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.brand,
  },
  body: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
});
