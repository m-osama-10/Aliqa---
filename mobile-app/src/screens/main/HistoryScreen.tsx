/* ================================================================== */
/*  HistoryScreen                                                      */
/* ================================================================== */

import React, { useEffect } from "react";
import {
  Alert,
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
import { useHistory } from "../../hooks/useHistory";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { EmptyState } from "../../components/EmptyState";
import { ANIMALS, type AnimalKey } from "../../api/feedData";
import { fmt, fmtEGP, fmtRelative } from "../../utils/helpers";
import type { RootStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "History">;

export function HistoryScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { t, lang } = useLang();
  const { history, loading, clearAll, refresh } = useHistory(user?.id);

  useEffect(() => {
    const unsub = navigation.addListener("focus", () => void refresh());
    return unsub;
  }, [navigation, refresh]);

  const onReuse = (animalKey: string | null) => {
    navigation.navigate("Calculator", {
      animalKey: (animalKey as AnimalKey) ?? "dairy_cow",
    });
  };

  const onClearAll = () => {
    Alert.alert(t("history.clear_confirm"), "", [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: () => void clearAll(),
      },
    ]);
  };

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.scroll}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t("history.title")}</Text>
          <Text style={styles.subtitle}>
            {history.length > 0
              ? t("history.subtitle_n", { n: history.length })
              : t("history.subtitle_0")}
          </Text>
        </View>
        {history.length > 0 ? (
          <Pressable style={styles.clearBtn} onPress={onClearAll}>
            <Text style={styles.clearBtnText}>{t("history.clear_btn")}</Text>
          </Pressable>
        ) : null}
      </View>

      {loading && history.length === 0 ? (
        <LoadingSpinner fullScreen />
      ) : history.length === 0 ? (
        <EmptyState
          emoji="📜"
          title={t("history.empty_title")}
          description={t("history.empty_desc")}
          action={
            <Pressable
              style={styles.ctaBtn}
              onPress={() => navigation.navigate("Calculator")}
            >
              <Text style={styles.ctaText}>{t("common.start_calc")}</Text>
            </Pressable>
          }
        />
      ) : (
        <View style={styles.list}>
          {history.map((h) => {
            const payload = h.payload as {
              weight: number;
              production: number;
              flockSize: number;
              mode: "balanced" | "economy";
              prices: Record<string, number>;
              result: { totalCost: number; costPerMonth: number };
              animalName: string;
            };
            const animal = ANIMALS[(h.animal_key ?? "dairy_cow") as AnimalKey];
            return (
              <View key={h.id} style={styles.card}>
                <View style={styles.cardBody}>
                  <Text style={styles.cardEmoji}>{animal?.emoji ?? "📋"}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {h.name ?? animal?.name ?? "—"}
                    </Text>
                    <Text style={styles.cardMeta}>
                      {fmt(payload.weight, 0)} {animal?.weightUnit ?? "كجم"} ·{" "}
                      {payload.mode === "economy"
                        ? t("favorites.mode_economy")
                        : t("favorites.mode_balanced")}{" "}
                      · {fmtRelative(h.created_at, lang === "ar" ? "ar-EG" : "en-GB")}
                    </Text>
                    {payload.result ? (
                      <Text style={styles.cardCost}>
                        {fmtEGP(payload.result.totalCost)} /{" "}
                        {lang === "ar" ? "يوم" : "day"}
                      </Text>
                    ) : null}
                  </View>
                </View>
                <Pressable
                  style={styles.reuseBtn}
                  onPress={() => onReuse(h.animal_key)}
                >
                  <Text style={styles.reuseBtnText}>{t("history.reuse")}</Text>
                </Pressable>
              </View>
            );
          })}
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
  subtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  clearBtn: {
    backgroundColor: COLORS.dangerSoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.dangerBorder,
  },
  clearBtnText: { color: COLORS.danger, fontSize: 12, fontWeight: "700" },

  ctaBtn: {
    backgroundColor: COLORS.brand,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 10,
  },
  ctaText: { color: "#fff", fontWeight: "700" },

  list: { gap: 8 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardBody: { flexDirection: "row", alignItems: "center", gap: 12 },
  cardEmoji: { fontSize: 28 },
  cardTitle: { fontSize: 14, fontWeight: "700", color: COLORS.textPrimary },
  cardMeta: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  cardCost: { fontSize: 12, fontWeight: "700", color: COLORS.brand, marginTop: 4 },
  reuseBtn: {
    marginTop: 10,
    backgroundColor: COLORS.brand,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  reuseBtnText: { color: "#fff", fontWeight: "700", fontSize: 12 },
});
