/* ================================================================== */
/*  HomeScreen                                                         */
/* ================================================================== */

import React, { useEffect, useMemo } from "react";
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
import { useNotifications } from "../../hooks/useNotifications";
import { useAds } from "../../hooks/useAds";
import { useHistory } from "../../hooks/useHistory";
import { COLORS } from "../../utils/constants";
import { ANIMAL_ORDER, ANIMALS, type AnimalKey } from "../../api/feedData";
import { fmt, fmtRelative } from "../../utils/helpers";
import { AdCard } from "../../components/AdCard";
import { EmptyState } from "../../components/EmptyState";
import { AdBanner320, AdNativeBanner, AdSmartlink, AdSection } from "../../components/Ads/AdNetwork";
import type { RootStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export function HomeScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { t, lang } = useLang();
  const { unread } = useNotifications(user?.id);
  const { ads } = useAds("home");
  const { history, refresh } = useHistory(user?.id);

  useEffect(() => {
    const unsub = navigation.addListener("focus", () => void refresh());
    return unsub;
  }, [navigation, refresh]);

  const greeting = useMemo(() => {
    const name = user?.full_name?.split(" ")[0] ?? (user?.is_guest ? t("common.guest") : "");
    return `${t("home.greeting")}${name ? " · " + name : ""}`;
  }, [user, t]);

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.scroll}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.subtitle}>{t("home.subtitle")}</Text>
        </View>
        <Pressable
          style={styles.bellBtn}
          onPress={() => navigation.navigate("Notifications" as any)}
        >
          <Text style={styles.bellEmoji}>🔔</Text>
          {unread > 0 ? <View style={styles.badge} /> : null}
        </Pressable>
      </View>

      {/* Quick calculator entry */}
      <Pressable
        style={styles.quickCard}
        onPress={() => navigation.navigate("Calculator" as any)}
      >
        <Text style={styles.quickEmoji}>🧮</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.quickTitle}>{t("home.quick_calc")}</Text>
          <Text style={styles.quickDesc}>{t("calc.compute_btn")}</Text>
        </View>
        <Text style={styles.quickArrow}>‹</Text>
      </Pressable>

      {/* Header banner ad (320x50) */}
      <View style={{ marginVertical: 8 }}>
        <AdBanner320 />
      </View>

      {/* Animal grid */}
      <Text style={styles.sectionTitle}>{t("calc.s1.title")}</Text>
      <View style={styles.grid}>
        {ANIMAL_ORDER.map((k: AnimalKey) => {
          const a = ANIMALS[k];
          return (
            <Pressable
              key={k}
              style={styles.animalCard}
              onPress={() =>
                navigation.navigate("Calculator" as any, { animalKey: k })
              }
            >
              <Text style={styles.animalEmoji}>{a.emoji}</Text>
              <Text style={styles.animalName} numberOfLines={2}>
                {lang === "ar" ? a.name : a.nameEn}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Tips */}
      <View style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>💡 {t("home.tips_title")}</Text>
        <Text style={styles.tipLine}>• {t("home.tip1")}</Text>
        <Text style={styles.tipLine}>• {t("home.tip2")}</Text>
        <Text style={styles.tipLine}>• {t("home.tip3")}</Text>
      </View>

      {/* Recent calculations */}
      <Text style={styles.sectionTitle}>{t("home.recent")}</Text>
      {history.length === 0 ? (
        <View style={styles.emptyInline}>
          <Text style={styles.emptyInlineText}>{t("home.no_recent")}</Text>
          <Pressable
            style={styles.emptyInlineBtn}
            onPress={() => navigation.navigate("Calculator" as any)}
          >
            <Text style={styles.emptyInlineBtnText}>{t("common.start_calc")}</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.recentList}>
          {history.slice(0, 5).map((h) => {
            const payload = h.payload as Record<string, any>;
            return (
              <Pressable
                key={h.id}
                style={styles.recentItem}
                onPress={() => navigation.navigate("Calculator" as any)}
              >
                <Text style={styles.recentEmoji}>
                  {ANIMALS[h.animal_key as AnimalKey]?.emoji ?? "📋"}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.recentName}>{h.name ?? h.animal_key}</Text>
                  <Text style={styles.recentMeta}>
                    {payload?.weight ? `${fmt(payload.weight, 0)} كجم · ` : ""}
                    {fmtRelative(h.created_at, lang === "ar" ? "ar-EG" : "en-GB")}
                  </Text>
                </View>
                <Text style={styles.recentArrow}>‹</Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* Ads */}
      {ads.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>{t("home.ads_title")}</Text>
          {ads.slice(0, 3).map((ad) => (
            <AdCard key={ad.id} ad={ad} lang={lang} />
          ))}
        </>
      ) : null}

      {/* Favorites shortcut */}
      <Pressable
        style={styles.favShortcut}
        onPress={() => navigation.navigate("Favorites" as any)}
      >
        <Text style={styles.favEmoji}>⭐</Text>
        <Text style={styles.favText}>{t("home.favorites_shortcut")}</Text>
        <Text style={styles.favArrow}>‹</Text>
      </Pressable>

      {/* EmptyState spacer when nothing to show */}
      {history.length === 0 && ads.length === 0 ? (
        <EmptyState
          emoji="🌾"
          title={t("common.app_name")}
          description={t("common.free_offline")}
        />
      ) : null}

      {/* In-feed native ad + smartlink CTA at bottom */}
      <View style={{ marginTop: 12 }}>
        <AdNativeBanner />
        <View style={{ marginTop: 12, alignItems: "center" }}>
          <AdSmartlink variant="banner" />
        </View>
        <View style={{ marginTop: 12 }}>
          <AdBanner320 />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: 16, paddingBottom: 32 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  greeting: { fontSize: 22, fontWeight: "800", color: COLORS.textPrimary },
  subtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  bellBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bellEmoji: { fontSize: 18 },
  badge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.danger,
  },

  quickCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.brand,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  quickEmoji: { fontSize: 32 },
  quickTitle: { color: "#fff", fontSize: 16, fontWeight: "800" },
  quickDesc: { color: "#fff", fontSize: 12, opacity: 0.9, marginTop: 2 },
  quickArrow: { color: "#fff", fontSize: 24, fontWeight: "700" },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginVertical: 12,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  animalCard: {
    width: "31%",
    flexGrow: 1,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
  },
  animalEmoji: { fontSize: 32 },
  animalName: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textPrimary,
    textAlign: "center",
  },

  tipsCard: {
    backgroundColor: COLORS.accentSoft,
    borderRadius: 12,
    padding: 14,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: COLORS.accentBorder,
  },
  tipsTitle: { fontSize: 13, fontWeight: "700", color: "#7a5a1a", marginBottom: 6 },
  tipLine: { fontSize: 12, color: "#7a5a1a", lineHeight: 18 },

  emptyInline: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: "dashed",
  },
  emptyInlineText: { color: COLORS.textSecondary, fontSize: 13, marginBottom: 10 },
  emptyInlineBtn: {
    backgroundColor: COLORS.brand,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
  },
  emptyInlineBtnText: { color: "#fff", fontWeight: "700" },

  recentList: { gap: 6 },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 10,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  recentEmoji: { fontSize: 24 },
  recentName: { fontSize: 14, fontWeight: "700", color: COLORS.textPrimary },
  recentMeta: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  recentArrow: { color: COLORS.textMuted, fontSize: 18 },

  favShortcut: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.brandSoft,
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.brandBorder,
  },
  favEmoji: { fontSize: 22 },
  favText: { flex: 1, fontSize: 14, fontWeight: "700", color: COLORS.brand },
  favArrow: { color: COLORS.brand, fontSize: 22, fontWeight: "700" },
});
