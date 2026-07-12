/* ================================================================== */
/*  FeedbackScreen                                                     */
/* ================================================================== */

import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { supabase } from "../../api/supabase";
import { useAuth } from "../../hooks/useAuth";
import { useLang } from "../../utils/i18n";
import { COLORS } from "../../utils/constants";
import { AdBanner320, AdSmartlink } from "../../components/Ads/AdNetwork";
import { validateFeedback } from "../../utils/validation";

export function FeedbackScreen() {
  const { user } = useAuth();
  const { t } = useLang();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const onSubmit = async () => {
    setError(null);
    const v = validateFeedback(subject, message);
    if (!v.ok) {
      setError(t(v.error!));
      return;
    }
    setLoading(true);
    try {
      const { error: err } = await supabase.from("feedback").insert({
        user_id: user && !user.is_guest ? user.id : null,
        subject: subject.trim(),
        message: message.trim(),
        rating: rating > 0 ? rating : null,
        contact: contact.trim() || null,
        status: "open",
      });
      if (err) throw err;
      setSent(true);
      setSubject("");
      setMessage("");
      setContact("");
      setRating(0);
    } catch (e) {
      setError(t("feedback.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{t("feedback.title")}</Text>

        {sent ? (
          <View style={styles.successCard}>
            <Text style={styles.successEmoji}>✅</Text>
            <Text style={styles.successText}>{t("feedback.sent")}</Text>
            <Pressable
              style={styles.againBtn}
              onPress={() => setSent(false)}
            >
              <Text style={styles.againBtnText}>{t("common.done")}</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.card}>
            <Field label={t("feedback.subject")}>
              <TextInput
                style={styles.input}
                value={subject}
                onChangeText={setSubject}
                placeholder="..."
                placeholderTextColor={COLORS.textMuted}
              />
            </Field>

            <Field label={t("feedback.message")}>
              <TextInput
                style={[styles.input, styles.textarea]}
                value={message}
                onChangeText={setMessage}
                placeholder="..."
                placeholderTextColor={COLORS.textMuted}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            </Field>

            <View style={styles.field}>
              <Text style={styles.label}>{t("feedback.rating")}</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <Pressable
                    key={n}
                    onPress={() => setRating(n)}
                    style={styles.starBtn}
                  >
                    <Text
                      style={[
                        styles.star,
                        n <= rating ? styles.starFilled : styles.starEmpty,
                      ]}
                    >
                      ★
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <Field label={t("feedback.contact")}>
              <TextInput
                style={styles.input}
                value={contact}
                onChangeText={setContact}
                placeholder="email / phone"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </Field>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable
              style={[styles.submitBtn, loading && styles.btnDisabled]}
              onPress={onSubmit}
              disabled={loading}
            >
              <Text style={styles.submitBtnText}>
                {loading ? t("common.loading") : t("feedback.submit")}
              </Text>
            </Pressable>
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
    </KeyboardAvoidingView>
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
  title: { fontSize: 22, fontWeight: "800", color: COLORS.textPrimary, marginBottom: 16 },

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
    fontSize: 15,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.bg,
  },
  textarea: {
    height: 100,
    paddingTop: 12,
    paddingBottom: 12,
  },
  starsRow: { flexDirection: "row", gap: 6 },
  starBtn: { padding: 4 },
  star: { fontSize: 28 },
  starFilled: { color: COLORS.accent },
  starEmpty: { color: COLORS.border },

  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    marginBottom: 10,
    textAlign: "center",
  },
  submitBtn: {
    backgroundColor: COLORS.brand,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 6,
  },
  submitBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  btnDisabled: { opacity: 0.6 },

  successCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.brandBorder,
  },
  successEmoji: { fontSize: 48 },
  successText: {
    color: COLORS.brand,
    fontSize: 14,
    textAlign: "center",
    marginVertical: 12,
  },
  againBtn: {
    backgroundColor: COLORS.brand,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  againBtnText: { color: "#fff", fontWeight: "700" },
});
