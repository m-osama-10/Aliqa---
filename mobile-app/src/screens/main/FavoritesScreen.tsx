/* ================================================================== */
/*  FavoritesScreen                                                    */
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
import { useFavorites } from "../../hooks/useFavorites";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { EmptyState } from "../../components/EmptyState";
import { ANIMALS, type AnimalKey, type FormulationResult } from "../../api/feedData";
import { fmt, fmtEGP, fmtRelative } from "../../utils/helpers";
import type { RootStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Favorites">;

export function FavoritesScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { t, lang } = useLang();
  const { favorites, loading, remove, refresh } = useFavorites(user?.id);

  useEffect(() => {
    const unsub = navigation.addListener("focus", () => void refresh());
    return unsub;
  }, [navigation, refresh]);

  const onView = (fav: typeof favorites[number]) => {
    const payload = fav.payload as {
      weight: number;
      production: number;
      flockSize: number;
      mode: "balanced" | "economy";
      prices: Record<string, number>;
      result: FormulationResult;
    };
    navigation.navigate("Calculator", {
      animalKey: (fav.animal_key ?? "dairy_cow") as AnimalKey,
    });
  };

  const onDelete = (id: string, name?: string | null) => {
    Alert.alert(t("favorites.delete_title"), t("favorites.delete_desc"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: () => void remove(id),
      },
    ]);
  };

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.scroll}>
      <Text style={styles.title}>{t("favorites.title")}</Text>
      <Text style={styles.subtitle}>
        {favorites.length > 0
          ? t("favorites.subtitle_n", { n: favorites.length })
          : t("favorites.subtitle_0")}
      </Text>

      {loading && favorites.length === 0 ? (
        <LoadingSpinner fullScreen />
      ) : favorites.length === 0 ? (
        <EmptyState
          emoji="⭐"
          title={t("favorites.empty_title")}
          description={t("favorites.empty_desc")}
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
          {favorites.map((fav) => {
            const payload = fav.payload as {
              weight: number;
              production: number;
              flockSize: number;
              mode: "balanced" | "economy";
              result: FormulationResult;
              animalName: string;
            };
            const result = payload.result;
            const animalKey = (fav.animal_key ?? "dairy_cow") as AnimalKey;
            const animal = ANIMALS[animalKey];
            return (
              <View key={fav.id} style={styles.card}>
                <Pressable style={styles.cardBody} onPress={() => onView(fav)}>
                  <Text style={styles.cardEmoji}>{animal?.emoji ?? "📋"}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {fav.name ?? animal?.name ?? "—"}
                    </Text>
                    <Text style={styles.cardMeta}>
                      {fmt(payload.weight, 0)} {animal?.weightUnit ?? "كجم"} ·{" "}
                      {payload.mode === "economy"
                        ? t("favorites.mode_economy")
                        : t("favorites.mode_balanced")}{" "}
                      · {fmtRelative(fav.created_at, lang === "ar" ? "ar-EG" : "en-GB")}
                    </Text>
                    <Text style={styles.cardCost}>
                      {fmtEGP(result.totalCost)} /{" "}
                      {lang === "ar" ? "يوم" : "day"} ·{" "}
                      {fmtEGP(result.costPerMonth)} /{" "}
                      {lang === "ar" ? "شهر" : "month"}
                    </Text>
                  </View>
                </Pressable>
                <View style={styles.cardActions}>
                  <Pressable
                    style={styles.viewBtn}
                    onPress={() => onView(fav)}
                  >
                    <Text style={styles.viewBtnText}>{t("favorites.view")}</Text>
                  </Pressable>
                  <Pressable
                    style={styles.delBtn}
                    onPress={() => onDelete(fav.id, fav.name)}
                  >
                    <Text style={styles.delBtnText}>{t("favorites.delete")}</Text>
                  </Pressable>
                </View>
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
  title: { fontSize: 22, fontWeight: "800", color: COLORS.textPrimary },
  subtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2, marginBottom: 16 },
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
  cardEmoji: { fontSize: 32 },
  cardTitle: { fontSize: 14, fontWeight: "700", color: COLORS.textPrimary },
  cardMeta: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  cardCost: { fontSize: 12, fontWeight: "700", color: COLORS.brand, marginTop: 4 },
  cardActions: { flexDirection: "row", gap: 8, marginTop: 10 },
  viewBtn: {
    flex: 1,
    backgroundColor: COLORS.brandSoft,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.brand,
  },
  viewBtnText: { color: COLORS.brand, fontWeight: "700", fontSize: 12 },
  delBtn: {
    flex: 1,
    backgroundColor: COLORS.dangerSoft,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.dangerBorder,
  },
  delBtnText: { color: COLORS.danger, fontWeight: "700", fontSize: 12 },
});
