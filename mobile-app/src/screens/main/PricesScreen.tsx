/* ================================================================== */
/*  PricesScreen                                                       */
/* ================================================================== */

import React, { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useLang } from "../../utils/i18n";
import { COLORS } from "../../utils/constants";
import { AdBanner320, AdSmartlink } from "../../components/Ads/AdNetwork";
import {
  INGREDIENT_ORDER,
  INGREDIENTS,
  type IngredientKey,
} from "../../api/feedData";
import {
  getActivePrices,
  resetActivePrices,
  updatePrice,
  getActiveProfile,
  getActiveProfileId,
  getPriceProfiles,
  setActiveProfile,
  addPriceProfile,
  deletePriceProfile,
  type PriceProfile,
  getPricesUpdatedAt,
} from "../../services/storage";
import { fmt } from "../../utils/helpers";
import type { RootStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Prices">;

export function PricesScreen(_props: Props) {
  const { t, lang } = useLang();
  const [prices, setPrices] = useState<Record<IngredientKey, number>>({} as Record<IngredientKey, number>);
  const [profile, setProfile] = useState<PriceProfile | null>(null);
  const [profiles, setProfiles] = useState<PriceProfile[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const refresh = async () => {
    const p = await getActivePrices();
    setPrices(p);
    const prof = await getActiveProfile();
    setProfile(prof);
    setProfiles(await getPriceProfiles());
    setUpdatedAt(await getPricesUpdatedAt());
  };

  useEffect(() => {
    void refresh();
  }, []);

  const onChangePrice = async (k: IngredientKey, value: number) => {
    const next = await updatePrice(k, value);
    setPrices(next);
    setUpdatedAt(await getPricesUpdatedAt());
  };

  const onReset = async () => {
    Alert.alert(t("prices.reset_btn"), "", [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.confirm"),
        onPress: async () => {
          const def = await resetActivePrices();
          setPrices(def);
          setUpdatedAt(null);
          Alert.alert(t("common.app_name"), t("prices.reset_done"));
        },
      },
    ]);
  };

  const onSwitchProfile = async (id: string) => {
    await setActiveProfile(id);
    await refresh();
  };

  const onAddProfile = async () => {
    if (profiles.length >= 3) {
      Alert.alert(t("common.app_name"), "الحد الأقصى ٣ ملفات");
      return;
    }
    // Auto-generate a name; user can rename later via long-press if needed.
    const name = `ملف ${profiles.length + 1}`;
    await addPriceProfile(name, `Profile ${profiles.length + 1}`);
    await refresh();
  };

  const onDeleteProfile = async (id: string) => {
    if (profiles.length <= 1) return;
    Alert.alert(t("favorites.delete_title"), "", [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: async () => {
          await deletePriceProfile(id);
          await refresh();
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.scroll}>
      <Text style={styles.title}>{t("prices.title")}</Text>
      <Text style={styles.subtitle}>
        {updatedAt
          ? t("prices.updated_at", { date: updatedAt })
          : t("prices.subtitle_none")}
      </Text>

      {/* Profile switcher */}
      <View style={styles.profilesRow}>
        {profiles.map((p) => {
          const selected = profile?.id === p.id;
          return (
            <Pressable
              key={p.id}
              style={[styles.profileChip, selected && styles.profileChipSelected]}
              onLongPress={() => onDeleteProfile(p.id)}
              onPress={() => onSwitchProfile(p.id)}
            >
              <Text
                style={[
                  styles.profileChipText,
                  selected && styles.profileChipTextSelected,
                ]}
              >
                {lang === "ar" ? p.name : p.nameEn}
              </Text>
            </Pressable>
          );
        })}
        {profiles.length < 3 ? (
          <Pressable style={styles.profileAdd} onPress={onAddProfile}>
            <Text style={styles.profileAddText}>+</Text>
          </Pressable>
        ) : null}
      </View>

      <Text style={styles.note}>{t("prices.note")}</Text>

      <View style={styles.card}>
        {INGREDIENT_ORDER.map((k) => {
          const ing = INGREDIENTS[k];
          const val = prices[k] ?? ing.defaultPrice;
          return (
            <View key={k} style={styles.row}>
              <Text style={styles.emoji}>{ing.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.name} numberOfLines={1}>
                  {lang === "ar" ? ing.name : ing.nameEn}
                </Text>
                <Text style={styles.default}>
                  {t("prices.default_hint", { n: ing.defaultPrice })}
                </Text>
              </View>
              <TextInput
                style={styles.input}
                value={String(val)}
                keyboardType="decimal-pad"
                onChangeText={(txt) => {
                  const n = parseFloat(txt.replace(/[^\d.]/g, ""));
                  if (isFinite(n) && n > 0) void onChangePrice(k, n);
                }}
              />
              <Text style={styles.unit}>{t("prices.egp_per_kg")}</Text>
            </View>
          );
        })}
      </View>

      <Pressable style={styles.resetBtn} onPress={onReset}>
        <Text style={styles.resetBtnText}>{t("prices.reset_btn")}</Text>
      </Pressable>
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
  subtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2, marginBottom: 12 },

  profilesRow: { flexDirection: "row", gap: 6, marginBottom: 12, flexWrap: "wrap" },
  profileChip: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  profileChipSelected: {
    backgroundColor: COLORS.brandSoft,
    borderColor: COLORS.brand,
  },
  profileChipText: { fontSize: 12, color: COLORS.textPrimary, fontWeight: "600" },
  profileChipTextSelected: { color: COLORS.brand, fontWeight: "700" },
  profileAdd: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: COLORS.brandSoft,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.brand,
  },
  profileAddText: { color: COLORS.brand, fontWeight: "700", fontSize: 18 },

  note: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 16,
    marginBottom: 12,
  },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  emoji: { fontSize: 20 },
  name: { fontSize: 13, fontWeight: "600", color: COLORS.textPrimary },
  default: { fontSize: 10, color: COLORS.textMuted, marginTop: 2 },
  input: {
    width: 70,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.brand,
    textAlign: "center",
    backgroundColor: COLORS.bg,
  },
  unit: { fontSize: 10, color: COLORS.textMuted },

  resetBtn: {
    backgroundColor: COLORS.card,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 16,
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  resetBtnText: { color: COLORS.danger, fontWeight: "700" },
});
