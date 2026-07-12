/* ================================================================== */
/*  ProfileScreen                                                      */
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
import { useAuth } from "../../hooks/useAuth";
import { useLang } from "../../utils/i18n";
import { COLORS } from "../../utils/constants";
import { AdBanner320, AdSmartlink } from "../../components/Ads/AdNetwork";
import { fmtDate } from "../../utils/helpers";
import type { RootStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Profile">;

export function ProfileScreen({ navigation }: Props) {
  const { user, profile, patchProfile, isAdmin } = useAuth();
  const { t, lang } = useLang();
  const [name, setName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");

  useEffect(() => {
    setName(profile?.full_name ?? "");
    setPhone(profile?.phone ?? "");
  }, [profile]);

  const onSave = async () => {
    try {
      await patchProfile({ full_name: name.trim(), phone: phone.trim() || null });
      Alert.alert(t("common.app_name"), t("profile.saved"));
    } catch {
      Alert.alert(t("common.error"), "");
    }
  };

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.scroll}>
      <View style={styles.avatarWrap}>
        <View style={styles.avatar}>
          <Text style={styles.avatarEmoji}>{user?.is_guest ? "👤" : "🧑‍🌾"}</Text>
        </View>
        <Text style={styles.userName}>{user?.full_name ?? t("common.guest")}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        <View style={[styles.roleBadge, isAdmin ? styles.roleAdmin : styles.roleUser]}>
          <Text style={styles.roleText}>
            {isAdmin ? t("common.admin") : t("common.user")}
          </Text>
        </View>
      </View>

      {user?.is_guest ? (
        <View style={styles.guestBox}>
          <Text style={styles.guestTitle}>👤 {t("common.guest")}</Text>
          <Text style={styles.guestDesc}>
            {lang === "ar"
              ? "سجّل الدخول لحفظ المفضلات والسجل ومزامنة البيانات."
              : "Sign in to save favorites, history, and sync data."}
          </Text>
          <Pressable
            style={styles.loginBtn}
            onPress={() => navigation.navigate("Login" as any)}
          >
            <Text style={styles.loginBtnText}>{t("auth.sign_in_btn")}</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.card}>
          <Field label={t("profile.name")}>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder={t("auth.full_name")}
              placeholderTextColor={COLORS.textMuted}
            />
          </Field>
          <Field label={t("profile.email")}>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={user?.email ?? ""}
              editable={false}
            />
          </Field>
          <Field label={t("profile.phone")}>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="01xxxxxxxxx"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="phone-pad"
            />
          </Field>
          {profile ? (
            <Field label={t("profile.joined")}>
              <View style={styles.readOnly}>
                <Text style={styles.readOnlyText}>
                  {fmtDate(profile.created_at, lang === "ar" ? "ar-EG" : "en-GB")}
                </Text>
              </View>
            </Field>
          ) : null}

          <Pressable style={styles.saveBtn} onPress={onSave}>
            <Text style={styles.saveBtnText}>{t("profile.save")}</Text>
          </Pressable>
        </View>
      )}

      {isAdmin ? (
        <Pressable
          style={styles.adminBtn}
          onPress={() => navigation.navigate("AdminDashboard" as any)}
        >
          <Text style={styles.adminBtnText}>🛠️ {t("nav.admin")}</Text>
        </Pressable>
      ) : null}

      <Pressable
        style={styles.settingsBtn}
        onPress={() => navigation.navigate("Settings" as any)}
      >
        <Text style={styles.settingsBtnText}>⚙️ {t("settings.title")}</Text>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: 16, paddingBottom: 40 },

  avatarWrap: { alignItems: "center", marginBottom: 24 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.brandSoft,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.brand,
  },
  avatarEmoji: { fontSize: 44 },
  userName: { fontSize: 22, fontWeight: "800", color: COLORS.textPrimary, marginTop: 12 },
  userEmail: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  roleBadge: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleAdmin: { backgroundColor: COLORS.accent },
  roleUser: { backgroundColor: COLORS.brandSoft },
  roleText: { color: "#fff", fontSize: 11, fontWeight: "700" },

  guestBox: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  guestTitle: { fontSize: 16, fontWeight: "700", color: COLORS.textPrimary, marginBottom: 6 },
  guestDesc: { fontSize: 12, color: COLORS.textSecondary, textAlign: "center", marginBottom: 12 },
  loginBtn: {
    backgroundColor: COLORS.brand,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  loginBtnText: { color: "#fff", fontWeight: "700" },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  field: { marginBottom: 14 },
  label: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 6,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.bg,
  },
  inputDisabled: { backgroundColor: COLORS.brandSoft, color: COLORS.textSecondary },
  readOnly: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: COLORS.bg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  readOnlyText: { fontSize: 14, color: COLORS.textPrimary },

  saveBtn: {
    backgroundColor: COLORS.brand,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 6,
  },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  adminBtn: {
    backgroundColor: COLORS.accentSoft,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.accentBorder,
  },
  adminBtnText: { color: "#7a5a1a", fontWeight: "700" },

  settingsBtn: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  settingsBtnText: { color: COLORS.textPrimary, fontWeight: "700" },
});
