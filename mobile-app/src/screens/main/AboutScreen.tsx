/* ================================================================== */
/*  AboutScreen                                                        */
/* ================================================================== */

import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useLang } from "../../utils/i18n";
import { COLORS, APP_VERSION } from "../../utils/constants";
import { AdBanner320, AdSmartlink } from "../../components/Ads/AdNetwork";
import { INGREDIENTS, INGREDIENT_ORDER, ANIMALS, ANIMAL_ORDER } from "../../api/feedData";
import type { RootStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "About">;

export function AboutScreen(_props: Props) {
  const { t, lang } = useLang();

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.scroll}>
      <View style={styles.brandBlock}>
        <Text style={styles.brandEmoji}>🌾</Text>
        <Text style={styles.brandName}>{t("common.app_name")}</Text>
        <Text style={styles.brandSub}>{t("about.tagline")}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.intro}>{t("about.intro")}</Text>
      </View>

      <FeatureRow emoji="🧮" title={t("about.f1.t")} desc={t("about.f1.d")} />
      <FeatureRow emoji="📴" title={t("about.f2.t")} desc={t("about.f2.d")} />
      <FeatureRow emoji="💰" title={t("about.f3.t")} desc={t("about.f3.d")} />
      <FeatureRow emoji="📱" title={t("about.f4.t")} desc={t("about.f4.d")} />

      <Text style={styles.sectionTitle}>{t("about.how_title")}</Text>
      <View style={styles.card}>
        <Text style={styles.step}>1️⃣ {t("about.step1")}</Text>
        <Text style={styles.step}>2️⃣ {t("about.step2")}</Text>
        <Text style={styles.step}>3️⃣ {t("about.step3")}</Text>
        <Text style={styles.step}>4️⃣ {t("about.step4")}</Text>
        <Text style={styles.step}>5️⃣ {t("about.step5")}</Text>
      </View>

      <Text style={styles.sectionTitle}>{t("about.components_title")}</Text>
      <View style={styles.card}>
        {INGREDIENT_ORDER.map((k) => {
          const ing = INGREDIENTS[k];
          return (
            <View key={k} style={styles.ingRow}>
              <Text style={styles.ingEmoji}>{ing.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.ingName}>{lang === "ar" ? ing.name : ing.nameEn}</Text>
                <Text style={styles.ingMeta}>
                  بروتين {ing.protein}% · طاقة {ing.tdn}% · ألياف {ing.fiber}%
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>{t("about.targets_title")}</Text>
      <View style={styles.card}>
        {ANIMAL_ORDER.map((k) => {
          const a = ANIMALS[k];
          return (
            <View key={k} style={styles.ingRow}>
              <Text style={styles.ingEmoji}>{a.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.ingName}>{lang === "ar" ? a.name : a.nameEn}</Text>
                <Text style={styles.ingMeta}>
                  بروتين ≥ {a.targets.cpMin}% · طاقة ≥ {a.targets.tdnMin}% · ألياف ≤{" "}
                  {a.targets.fiberMax}%
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>{t("about.disclaimer_title")}</Text>
      <View style={[styles.card, styles.disclaimerCard]}>
        <Text style={styles.disclaimerText}>{t("about.disclaimer")}</Text>
      </View>

      <Text style={styles.versionLine}>{t("about.version")}</Text>
      <Text style={styles.versionSub}>v {APP_VERSION}</Text>
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

function FeatureRow({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <View style={styles.featureRow}>
      <Text style={styles.featureEmoji}>{emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDesc}>{desc}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: 16, paddingBottom: 40 },

  brandBlock: { alignItems: "center", marginBottom: 20 },
  brandEmoji: { fontSize: 72 },
  brandName: { fontSize: 28, fontWeight: "900", color: COLORS.brand, marginTop: 8 },
  brandSub: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2, textAlign: "center" },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  intro: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20 },

  featureRow: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  featureEmoji: { fontSize: 28 },
  featureTitle: { fontSize: 14, fontWeight: "700", color: COLORS.textPrimary },
  featureDesc: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4, lineHeight: 17 },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginVertical: 12,
  },
  step: { fontSize: 13, color: COLORS.textPrimary, lineHeight: 22 },

  ingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  ingEmoji: { fontSize: 22 },
  ingName: { fontSize: 13, fontWeight: "700", color: COLORS.textPrimary },
  ingMeta: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },

  disclaimerCard: { backgroundColor: COLORS.accentSoft, borderColor: COLORS.accentBorder },
  disclaimerText: { fontSize: 12, color: "#7a5a1a", lineHeight: 18 },

  versionLine: {
    textAlign: "center",
    color: COLORS.brand,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 24,
  },
  versionSub: {
    textAlign: "center",
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 4,
  },
});
