/* ================================================================== */
/*  CalculatorScreen                                                   */
/* ================================================================== */

import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAuth } from "../../hooks/useAuth";
import { useLang } from "../../utils/i18n";
import { COLORS } from "../../utils/constants";
import {
  ANIMAL_ORDER,
  ANIMALS,
  INGREDIENT_ORDER,
  INGREDIENTS,
  type AnimalKey,
  type FormulationMode,
} from "../../api/feedData";
import { IngredientSlider } from "../../components/IngredientSlider";
import { useCalculation } from "../../hooks/useCalculation";
import { clamp, fmt } from "../../utils/helpers";
import { useHistory } from "../../hooks/useHistory";
import { AdBanner320 } from "../../components/Ads/AdNetwork";
import type { RootStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Calculator">;

export function CalculatorScreen({ navigation, route }: Props) {
  const { user } = useAuth();
  const { t, lang } = useLang();
  const initialAnimal = route.params?.animalKey ?? "dairy_cow";
  const [animalKey, setAnimalKey] = useState<AnimalKey>(initialAnimal);
  const animal = ANIMALS[animalKey];

  const [weight, setWeight] = useState<number>(animal.defaultWeight);
  const [production, setProduction] = useState<number>(animal.productionDefault);
  const [flockSize, setFlockSize] = useState<number>(animal.defaultFlockSize);
  const [mode, setMode] = useState<FormulationMode>("balanced");

  // When the user changes animal, reset its inputs.
  const onSelectAnimal = (k: AnimalKey) => {
    setAnimalKey(k);
    const a = ANIMALS[k];
    setWeight(a.defaultWeight);
    setProduction(a.productionDefault);
    setFlockSize(a.defaultFlockSize);
  };

  const calc = useCalculation({ animalKey, weight, production, flockSize, mode });
  const { add: addHistory } = useHistory(user?.id);

  // Compute balanced & economy summaries for preview.
  const balanced = calc.balanced;
  const economy = useMemo(() => calc.result, [calc.result]);
  const savings = calc.savings;

  const onCompute = async () => {
    const result = calc.result;
    if (!result.feasible) return;

    // Record to history (best-effort).
    void addHistory({
      animalKey,
      animalName: lang === "ar" ? animal.name : animal.nameEn,
      weight,
      production,
      flockSize,
      mode,
      prices: calc.prices,
      result,
      durationMs: 0,
    }).catch(() => {});

    navigation.navigate("Results", {
      animalKey,
      weight,
      production,
      flockSize,
      mode,
      prices: calc.prices,
      result,
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionTitle}>{t("calc.s1.title")}</Text>
        <View style={styles.animalGrid}>
          {ANIMAL_ORDER.map((k) => {
            const a = ANIMALS[k];
            const selected = k === animalKey;
            return (
              <Pressable
                key={k}
                style={[
                  styles.animalChip,
                  selected && styles.animalChipSelected,
                ]}
                onPress={() => onSelectAnimal(k)}
              >
                <Text style={styles.animalChipEmoji}>{a.emoji}</Text>
                <Text
                  style={[
                    styles.animalChipName,
                    selected && styles.animalChipNameSelected,
                  ]}
                  numberOfLines={2}
                >
                  {lang === "ar" ? a.name : a.nameEn}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Animal description */}
        <View style={styles.descCard}>
          <Text style={styles.descText}>
            {lang === "ar" ? animal.description : animal.descriptionEn}
          </Text>
        </View>

        {/* Animal data */}
        <Text style={styles.sectionTitle}>{t("calc.s2.title")}</Text>

        <Stepper
          label={`${t("calc.weight")} (${animal.weightUnit})`}
          value={weight}
          min={animal.weightMin}
          max={animal.weightMax}
          step={animal.weightStep}
          onChange={setWeight}
        />

        {animal.hasProductionInput ? (
          <Stepper
            label={`${animal.productionLabel} (${animal.productionUnit})`}
            value={production}
            min={animal.productionMin}
            max={animal.productionMax}
            step={animal.productionStep}
            onChange={setProduction}
          />
        ) : null}

        {animal.hasFlockInput ? (
          <Stepper
            label={`${animal.flockLabel} (${animal.flockUnit})`}
            value={flockSize}
            min={animal.flockMin}
            max={animal.flockMax}
            step={animal.flockStep}
            onChange={setFlockSize}
          />
        ) : null}

        <View style={styles.dmiRow}>
          <Text style={styles.dmiLabel}>{t("calc.dmi_label")}</Text>
          <Text style={styles.dmiValue}>
            {fmt(balanced.perAnimalDmi * Math.max(1, flockSize), 2)} {t("common.kg")}
            {flockSize > 1 ? t("calc.dmi_flock_suffix") : ""}
          </Text>
        </View>

        {/* Mode selector */}
        <Text style={styles.sectionTitle}>{t("calc.s3.title")}</Text>
        <Text style={styles.tipText}>{t("calc.s3.tip")}</Text>
        <View style={styles.modeRow}>
          <ModeButton
            label={t("calc.balanced")}
            sub={t("calc.balanced_sub")}
            selected={mode === "balanced" && !calc.isManual}
            onPress={() => {
              setMode("balanced");
              calc.setMode("balanced");
            }}
          />
          <ModeButton
            label={t("calc.economy")}
            sub={t("calc.economy_sub")}
            selected={mode === "economy" && !calc.isManual}
            onPress={() => {
              setMode("economy");
              calc.setMode("economy");
            }}
          />
        </View>

        {savings && savings.amount > 0 ? (
          <View style={styles.savingsBox}>
            <Text style={styles.savingsLabel}>{t("result.savings")}</Text>
            <Text style={styles.savingsValue}>
              {fmt(savings.amount, 2)} {t("common.egp")} · {fmt(savings.pct, 0)}%
            </Text>
          </View>
        ) : null}

        {/* Prices */}
        <Text style={styles.sectionTitle}>{t("calc.s4.title")}</Text>
        <Text style={styles.tipText}>{t("calc.s4.hint")}</Text>
        <View style={styles.pricesCard}>
          {INGREDIENT_ORDER.map((k) => {
            const ing = INGREDIENTS[k];
            return (
              <View key={k} style={styles.priceRow}>
                <Text style={styles.priceEmoji}>{ing.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.priceName} numberOfLines={1}>
                    {lang === "ar" ? ing.name : ing.nameEn}
                  </Text>
                  <Text style={styles.priceDefault}>
                    {t("prices.default_hint", { n: ing.defaultPrice })}
                  </Text>
                </View>
                <TextInput
                  style={styles.priceInput}
                  value={String(calc.prices[k] ?? ing.defaultPrice)}
                  keyboardType="decimal-pad"
                  onChangeText={(txt) => {
                    const n = parseFloat(txt.replace(/[^\d.]/g, ""));
                    if (isFinite(n) && n > 0) void calc.setPrice(k, n);
                  }}
                />
                <Text style={styles.priceUnit}>{t("prices.egp_per_kg")}</Text>
              </View>
            );
          })}
        </View>

        {/* Preview result */}
        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>
            {calc.isManual ? t("calc.result_manual") : t("calc.result_title")}
          </Text>
          {calc.result.feasible ? (
            <>
              <View style={styles.previewStats}>
                <PreviewStat
                  label={t("result.cost_daily")}
                  value={`${fmt(calc.result.totalCost, 2)} ${t("common.egp")}`}
                />
                <PreviewStat
                  label={t("result.cost_monthly")}
                  value={`${fmt(calc.result.costPerMonth, 0)} ${t("common.egp")}`}
                />
                <PreviewStat
                  label={t("result.protein")}
                  value={`${fmt(calc.result.achieved.cp, 1)}%`}
                />
              </View>

              <Text style={styles.previewComponents}>
                {calc.result.components
                  .map(
                    (c) =>
                      `${c.ingredient.emoji} ${fmt(c.percent, 0)}% (${fmt(c.kg, 1)} ${t("common.kg")})`
                  )
                  .join(" · ")}
              </Text>
            </>
          ) : (
            <Text style={styles.previewInfeasible}>{t("result.infeasible")}</Text>
          )}
        </View>

        <Pressable
          style={[styles.computeBtn, !calc.result.feasible && styles.btnDisabled]}
          onPress={onCompute}
          disabled={!calc.result.feasible}
        >
          <Text style={styles.computeBtnText}>
            {t("calc.compute_btn")} ›
          </Text>
        </Pressable>

        {/* Banner ad at the bottom of calculator */}
        <View style={{ marginTop: 16 }}>
          <AdBanner320 />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* Helpers */

function Stepper({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (n: number) => void;
}) {
  const dec = () => onChange(clamp(+(value - step).toFixed(4), min, max));
  const inc = () => onChange(clamp(+(value + step).toFixed(4), min, max));
  return (
    <View style={styles.stepper}>
      <Text style={styles.stepperLabel}>{label}</Text>
      <View style={styles.stepperControls}>
        <Pressable style={styles.stepperBtn} onPress={dec}>
          <Text style={styles.stepperBtnText}>−</Text>
        </Pressable>
        <TextInput
          style={styles.stepperValue}
          value={String(value)}
          keyboardType="decimal-pad"
          onChangeText={(txt) => {
            const n = parseFloat(txt.replace(/[^\d.]/g, ""));
            if (isFinite(n)) onChange(clamp(n, min, max));
          }}
        />
        <Pressable style={styles.stepperBtn} onPress={inc}>
          <Text style={styles.stepperBtnText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

function ModeButton({
  label,
  sub,
  selected,
  onPress,
}: {
  label: string;
  sub: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.modeBtn, selected && styles.modeBtnSelected]}
      onPress={onPress}
    >
      <Text
        style={[styles.modeBtnLabel, selected && styles.modeBtnLabelSelected]}
      >
        {label}
      </Text>
      <Text
        style={[styles.modeBtnSub, selected && styles.modeBtnSubSelected]}
      >
        {sub}
      </Text>
    </Pressable>
  );
}

function PreviewStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.previewStat}>
      <Text style={styles.previewStatLabel}>{label}</Text>
      <Text style={styles.previewStatValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: 16, paddingBottom: 40 },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginVertical: 12,
  },
  tipText: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 10, lineHeight: 18 },

  animalGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  animalChip: {
    width: "31%",
    flexGrow: 1,
    backgroundColor: COLORS.card,
    borderRadius: 10,
    padding: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  animalChipSelected: {
    backgroundColor: COLORS.brandSoft,
    borderColor: COLORS.brand,
  },
  animalChipEmoji: { fontSize: 24 },
  animalChipName: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginTop: 4,
  },
  animalChipNameSelected: { color: COLORS.brand },

  descCard: {
    backgroundColor: COLORS.card,
    borderRadius: 10,
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  descText: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 18 },

  stepper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.card,
    borderRadius: 10,
    padding: 12,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stepperLabel: { flex: 1, fontSize: 13, fontWeight: "600", color: COLORS.textPrimary },
  stepperControls: { flexDirection: "row", alignItems: "center", gap: 8 },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.brandSoft,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.brandBorder,
  },
  stepperBtnText: { fontSize: 20, fontWeight: "700", color: COLORS.brand, lineHeight: 22 },
  stepperValue: {
    minWidth: 60,
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
    textAlign: "center",
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 0,
  },

  dmiRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  dmiLabel: { fontSize: 13, color: COLORS.textSecondary },
  dmiValue: { fontSize: 14, fontWeight: "700", color: COLORS.brand },

  modeRow: { flexDirection: "row", gap: 8, marginVertical: 6 },
  modeBtn: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  modeBtnSelected: {
    backgroundColor: COLORS.brandSoft,
    borderColor: COLORS.brand,
  },
  modeBtnLabel: { fontSize: 13, fontWeight: "700", color: COLORS.textPrimary },
  modeBtnLabelSelected: { color: COLORS.brand },
  modeBtnSub: { fontSize: 10, color: COLORS.textMuted, marginTop: 2, textAlign: "center" },
  modeBtnSubSelected: { color: COLORS.brand },

  savingsBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.accentSoft,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.accentBorder,
  },
  savingsLabel: { fontSize: 12, color: "#7a5a1a" },
  savingsValue: { fontSize: 14, fontWeight: "800", color: "#8a6a1a" },

  pricesCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  priceEmoji: { fontSize: 18 },
  priceName: { fontSize: 13, fontWeight: "600", color: COLORS.textPrimary },
  priceDefault: { fontSize: 10, color: COLORS.textMuted, marginTop: 2 },
  priceInput: {
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
  priceUnit: { fontSize: 10, color: COLORS.textMuted },

  previewCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.brandBorder,
  },
  previewTitle: { fontSize: 14, fontWeight: "800", color: COLORS.brand, marginBottom: 8 },
  previewStats: { flexDirection: "row", gap: 6, marginBottom: 8 },
  previewStat: {
    flex: 1,
    backgroundColor: COLORS.bg,
    borderRadius: 8,
    padding: 8,
    alignItems: "center",
  },
  previewStatLabel: { fontSize: 10, color: COLORS.textSecondary },
  previewStatValue: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  previewComponents: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 18 },
  previewInfeasible: { color: COLORS.danger, fontSize: 13 },

  computeBtn: {
    backgroundColor: COLORS.brand,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
  computeBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  btnDisabled: { opacity: 0.5 },
});
