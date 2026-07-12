/* ================================================================== */
/*  SettingsScreen                                                     */
/* ================================================================== */

import React from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAuth } from "../../hooks/useAuth";
import { useLang } from "../../utils/i18n";
import { useAppStore } from "../../store/appStore";
import { COLORS, APP_VERSION } from "../../utils/constants";
import { AdBanner320, AdSmartlink } from "../../components/Ads/AdNetwork";
import { clearCache } from "../../services/storage";
import * as Notifications from "expo-notifications";
import type { RootStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Settings">;

export function SettingsScreen({ navigation }: Props) {
  const { user, signOut } = useAuth();
  const { t, lang } = useLang();
  const { theme, setTheme } = useAppStore();
  const [notifEnabled, setNotifEnabled] = React.useState(true);

  const onClearCache = () => {
    Alert.alert(t("settings.clear_cache"), "", [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.confirm"),
        onPress: async () => {
          await clearCache();
          Alert.alert(t("common.app_name"), t("settings.cache_cleared"));
        },
      },
    ]);
  };

  const onLogout = () => {
    Alert.alert(t("auth.logout_confirm"), "", [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("auth.logout"),
        style: "destructive",
        onPress: () => void signOut(),
      },
    ]);
  };

  const toggleNotifications = async (v: boolean) => {
    setNotifEnabled(v);
    if (v) {
      await Notifications.requestPermissionsAsync();
    } else {
      // Best-effort: we can't fully revoke, but we mark as disabled.
    }
  };

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.scroll}>
      <Text style={styles.title}>{t("settings.title")}</Text>

      {/* Language */}
      <Section title={t("settings.language")}>
        <SegRow
          options={[
            { value: "ar", label: t("settings.arabic") },
            { value: "en", label: t("settings.english") },
          ]}
          value={lang}
          onChange={(v) => useLang(v as "ar" | "en")}
        />
      </Section>

      {/* Theme */}
      <Section title={t("settings.theme")}>
        <SegRow
          options={[
            { value: "light", label: t("settings.light") },
            { value: "dark", label: t("settings.dark") },
            { value: "system", label: t("settings.system") },
          ]}
          value={theme}
          onChange={(v) => void setTheme(v as "light" | "dark" | "system")}
        />
      </Section>

      {/* Notifications */}
      <Section title={t("settings.notifications")}>
        <Row label={t("settings.notifications_enable")}>
          <Switch
            value={notifEnabled}
            onValueChange={toggleNotifications}
            trackColor={{ false: COLORS.border, true: COLORS.brand }}
            thumbColor="#fff"
          />
        </Row>
      </Section>

      {/* Account */}
      <Section title={t("settings.account")}>
        <NavRow
          label={t("profile.title")}
          onPress={() => navigation.navigate("Profile")}
          emoji="👤"
        />
        <NavRow
          label={t("settings.feedback")}
          onPress={() => navigation.navigate("Feedback")}
          emoji="✉️"
        />
        <NavRow
          label={t("settings.about")}
          onPress={() => navigation.navigate("About")}
          emoji="ℹ️"
        />
      </Section>

      {/* Storage */}
      <Section title={t("settings.cache")}>
        <NavRow
          label={t("settings.clear_cache")}
          onPress={onClearCache}
          emoji="🗑️"
        />
      </Section>

      {/* Privacy */}
      <Section title={t("settings.privacy")}>
        <View style={styles.privacyBox}>
          <Text style={styles.privacyText}>{t("settings.privacy_desc")}</Text>
        </View>
      </Section>

      <Pressable style={styles.logoutBtn} onPress={onLogout}>
        <Text style={styles.logoutBtnText}>{t("auth.logout")}</Text>
      </Pressable>

      <Text style={styles.versionText}>{t("settings.version", { v: APP_VERSION })}</Text>
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function SegRow({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.segRow}>
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            style={[styles.segBtn, selected && styles.segBtnSelected]}
            onPress={() => onChange(o.value)}
          >
            <Text
              style={[styles.segBtnText, selected && styles.segBtnTextSelected]}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      {children}
    </View>
  );
}

function NavRow({
  label,
  emoji,
  onPress,
}: {
  label: string;
  emoji: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.navRow} onPress={onPress}>
      <Text style={styles.navEmoji}>{emoji}</Text>
      <Text style={styles.navLabel}>{label}</Text>
      <Text style={styles.navArrow}>‹</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: "800", color: COLORS.textPrimary, marginBottom: 16 },

  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textSecondary,
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  sectionBody: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },

  segRow: { flexDirection: "row", padding: 8, gap: 6 },
  segBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: COLORS.bg,
  },
  segBtnSelected: { backgroundColor: COLORS.brand },
  segBtnText: { color: COLORS.textSecondary, fontWeight: "600", fontSize: 12 },
  segBtnTextSelected: { color: "#fff", fontWeight: "700" },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowLabel: { fontSize: 14, color: COLORS.textPrimary },

  navRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 10,
  },
  navEmoji: { fontSize: 18 },
  navLabel: { flex: 1, fontSize: 14, color: COLORS.textPrimary },
  navArrow: { color: COLORS.textMuted, fontSize: 18 },

  privacyBox: { padding: 14 },
  privacyText: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 18 },

  logoutBtn: {
    backgroundColor: COLORS.dangerSoft,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.dangerBorder,
  },
  logoutBtnText: { color: COLORS.danger, fontWeight: "700" },

  versionText: {
    textAlign: "center",
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 16,
  },
});
