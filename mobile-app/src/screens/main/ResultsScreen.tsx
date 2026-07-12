/* ================================================================== */
/*  ResultsScreen                                                      */
/* ================================================================== */

import React, { useState } from "react";
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
import { RationResultCard } from "../../components/RationResultCard";
import { useFavorites } from "../../hooks/useFavorites";
import { IngredientSlider } from "../../components/IngredientSlider";
import {
  computeManualResult,
  formulateRation,
} from "../../services/rationOptimizer";
import {
  INGREDIENT_ORDER,
  INGREDIENTS,
  type IngredientKey,
} from "../../api/feedData";
import { clamp, fmt } from "../../utils/helpers";
import { AdBanner320, AdNativeBanner, AdSmartlink } from "../../components/Ads/AdNetwork";
import type { RootStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Results">;

export function ResultsScreen({ route, navigation }: Props) {
  const { user } = useAuth();
  const { t, lang } = useLang();
  const { animalKey, weight, production, flockSize, mode, prices } = route.params;
  const { save } = useFavorites(user?.id);

  // Compute fresh (or use the one passed in).
  const [result, setResult] = useState(
    route.params.result ??
      formulateRation({ animalKey, weight, production, prices, mode, flockSize })
  );

  const [isManual, setIsManual] = useState(false);
  const [manual, setManual] = useState<Partial<Record<IngredientKey, number>>>(
    () => {
      const seed: Partial<Record<IngredientKey, number>> = {};
      for (const c of result.components) seed[c.ingredient.key] = c.percent;
      return seed;
    }
  );

  const balanced = formulateRation({
    animalKey,
    weight,
    production,
    prices,
    mode: "balanced",
    flockSize,
  });

  const savings =
    !isManual && mode === "economy" && balanced.feasible && result.feasible
      ? (() => {
          const diff = balanced.totalCost - result.totalCost;
          if (diff <= 0) return null;
          return { amount: +diff.toFixed(2), pct: +((diff / balanced.totalCost) * 100).toFixed(1) };
        })()
      : null;

  const onManualChange = (k: IngredientKey, v: number) => {
    const next = { ...manual, [k]: v };
    setManual(next);
    setResult(
      computeManualResult(next, result.perAnimalDmi, prices, result.targets, result.flockSize)
    );
  };

  const toggleManual = () => {
    if (isManual) {
      // Back to auto.
      setIsManual(false);
      setResult(
        formulateRation({ animalKey, weight, production, prices, mode, flockSize })
      );
      return;
    }
    setIsManual(true);
    // Seed manual from current LP result.
    const seed: Partial<Record<IngredientKey, number>> = {};
    for (const c of result.components) seed[c.ingredient.key] = c.percent;
    setManual(seed);
  };

  const sumPct = INGREDIENT_ORDER.reduce((s, k) => s + (manual[k] ?? 0), 0);

  const onSave = async () => {
    if (!result.feasible) return;
    const animalName =
      lang === "ar"
        ? (await import("../../api/feedData")).ANIMALS[animalKey].name
        : (await import("../../api/feedData")).ANIMALS[animalKey].nameEn;
    await save({
      animalKey,
      animalName,
      weight,
      production,
      flockSize,
      mode: isManual ? "balanced" : mode,
      prices,
      result,
    });
    Alert.alert(t("common.app_name"), t("calc.saved_toast"));
  };

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.scroll}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("calc.result_title")}</Text>
        <Pressable style={styles.modeToggle} onPress={toggleManual}>
          <Text style={styles.modeToggleText}>
            {isManual ? t("calc.reset_auto") : t("calc.edit_btn")}
          </Text>
        </Pressable>
      </View>

      {isManual ? (
        <View style={styles.manualCard}>
          <View style={styles.sumRow}>
            <Text style={styles.sumLabel}>{t("manual.sum_label")}</Text>
            <Text
              style={[
                styles.sumValue,
                Math.abs(sumPct - 100) > 0.1 ? styles.sumValueWarn : styles.sumValueOk,
              ]}
            >
              {fmt(sumPct, 1)}%
            </Text>
          </View>
          {Math.abs(sumPct - 100) > 0.1 ? (
            <Text style={styles.sumWarn}>
              {sumPct > 100
                ? t("manual.over", { n: fmt(sumPct - 100, 1) })
                : t("manual.under", { n: fmt(100 - sumPct, 1) })}
            </Text>
          ) : null}
          {INGREDIENT_ORDER.map((k) => {
            const ing = INGREDIENTS[k];
            return (
              <IngredientSlider
                key={k}
                ingredient={ing}
                value={manual[k] ?? 0}
                onChange={(v) => onManualChange(k, v)}
                min={0}
                max={Math.max(100, ing && (animalKey as any) ? 100 : 100)}
                step={0.5}
              />
            );
          })}
        </View>
      ) : null}

      <RationResultCard
        result={result}
        animalKey={animalKey}
        weight={weight}
        production={production}
        mode={isManual ? "balanced" : mode}
        lang={lang}
        savings={savings}
        onSave={onSave}
      />

      <Text style={styles.disclaimer}>{t("calc.disclaimer")}</Text>

      {/* In-feed native ad + smartlink + banner before back button */}
      <View style={{ marginVertical: 8 }}>
        <AdNativeBanner />
      </View>
      <View style={{ marginVertical: 8, alignItems: "center" }}>
        <AdSmartlink variant="banner" />
      </View>
      <View style={{ marginBottom: 8 }}>
        <AdBanner320 />
      </View>

      <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>‹ {t("common.back")}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: 16, paddingBottom: 40 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  title: { fontSize: 18, fontWeight: "800", color: COLORS.textPrimary },
  modeToggle: {
    backgroundColor: COLORS.brandSoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.brand,
  },
  modeToggleText: { color: COLORS.brand, fontWeight: "700", fontSize: 12 },

  manualCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sumRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  sumLabel: { fontSize: 13, fontWeight: "700", color: COLORS.textPrimary },
  sumValue: { fontSize: 16, fontWeight: "900" },
  sumValueOk: { color: COLORS.brand },
  sumValueWarn: { color: COLORS.danger },
  sumWarn: { fontSize: 11, color: COLORS.danger, marginBottom: 8 },

  disclaimer: {
    fontSize: 10,
    color: COLORS.textMuted,
    lineHeight: 16,
    marginTop: 16,
    textAlign: "center",
  },

  backBtn: {
    alignSelf: "center",
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  backText: { color: COLORS.brand, fontWeight: "700" },
});
