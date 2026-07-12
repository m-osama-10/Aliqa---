/* ================================================================== */
/*  Ad Network — React Native mobile components                       */
/*  Web-based ad units rendered via WebView since the ad networks     */
/*  serve JavaScript/iframe creatives.                                */
/* ================================================================== */

import React, { useMemo } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import { COLORS } from "../../utils/constants";

/* ---------- Ad unit IDs ---------- */
export type AdUnitId =
  | "smartlink"
  | "native_banner"
  | "social_bar"
  | "banner_468x60"
  | "banner_320x50"
  | "banner_728x90"
  | "banner_160x300";

interface AdUnitConfig {
  id: AdUnitId;
  name: string;
  width: number;
  height: number;
  html: string;
  smartlinkUrl?: string;
}

/* ---------- Build the HTML for each ad unit ---------- */
const SMARTLINK_URL =
  "https://www.effectivecpmnetwork.com/dycf4uyk?key=568b4219419876ebaab26d5901a21464";

const AD_UNITS: Record<AdUnitId, AdUnitConfig> = {
  smartlink: {
    id: "smartlink",
    name: "Smartlink",
    width: 0,
    height: 48,
    smartlinkUrl: SMARTLINK_URL,
    html: "",
  },
  native_banner: {
    id: "native_banner",
    name: "Native Banner",
    width: 0,
    height: 250,
    html: `
      <!DOCTYPE html><html><head><meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
      <style>body{margin:0;padding:0;background:transparent;}#ad{display:block;}</style>
      </head><body>
      <script async data-cfasync="false" src="https://pl30337533.effectivecpmnetwork.com/4b8c5e9e7d96b04276080978d39ab1c5/invoke.js"></script>
      <div id="container-4b8c5e9e7d96b04276080978d39ab1c5"></div>
      </body></html>
    `,
  },
  social_bar: {
    id: "social_bar",
    name: "Social Bar",
    width: 0,
    height: 50,
    html: `
      <!DOCTYPE html><html><head><meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>body{margin:0;padding:0;background:transparent;}</style>
      </head><body>
      <script src="https://pl30337534.effectivecpmnetwork.com/72/a5/f0/72a5f04b78d375c5dbdb34390ddf417b.js"></script>
      </body></html>
    `,
  },
  banner_468x60: buildBannerHtml("8f73b34600b60c1038b428f92337defb", 468, 60),
  banner_320x50: buildBannerHtml("16853d965fde40e03031c3c18b531465", 320, 50),
  banner_728x90: buildBannerHtml("991e2a8aabb6ae41c5ecedffd5c76de4", 728, 90),
  banner_160x300: buildBannerHtml("bcb69437be1d16292d52ca803c2a11f6", 160, 300),
};

function buildBannerHtml(key: string, width: number, height: number): AdUnitConfig {
  return {
    id: `banner_${width}x${height === 60 ? 60 : height}` as AdUnitId,
    name: `Banner ${width}x${height}`,
    width,
    height,
    html: `
      <!DOCTYPE html><html><head><meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>body{margin:0;padding:0;background:transparent;display:flex;justify-content:center;align-items:center;}</style>
      </head><body>
      <script type="text/javascript">
        atOptions = {
          'key' : '${key}',
          'format' : 'iframe',
          'height' : ${height},
          'width' : ${width},
          'params' : {}
        };
      </script>
      <script type="text/javascript" src="https://www.highperformanceformat.com/${key}/invoke.js"></script>
      </body></html>
    `,
  };
}

/* ================================================================== */
/*  Smartlink — native Pressable button                                */
/* ================================================================== */
export function AdSmartlink({
  variant = "button",
}: {
  variant?: "button" | "banner";
}) {
  const openLink = () => {
    if (SMARTLINK_URL) Linking.openURL(SMARTLINK_URL);
  };

  if (variant === "banner") {
    return (
      <Pressable style={s.smartlinkBanner} onPress={openLink}>
        <Text style={s.smartlinkStar}>★</Text>
        <Text style={s.smartlinkText}>اعرض أفضل العروض</Text>
      </Pressable>
    );
  }

  return (
    <Pressable style={s.smartlinkBtn} onPress={openLink}>
      <Text style={s.smartlinkBtnText}>اعرض أفضل العروض</Text>
    </Pressable>
  );
}

/* ================================================================== */
/*  WebAd — generic WebView ad for script/iframe units                 */
/* ================================================================== */
export function WebAd({
  unitId,
  height,
  style,
}: {
  unitId: Exclude<AdUnitId, "smartlink">;
  height?: number;
  style?: object;
}) {
  const unit = AD_UNITS[unitId];
  const h = height ?? unit.height;

  const html = useMemo(
    () => unit.html,
    [unit.html]
  );

  return (
    <View style={[s.adContainer, { height: h }, style]}>
      <Text style={s.adLabel}>إعلان</Text>
      <WebView
        source={{ html }}
        style={{ flex: 1, backgroundColor: "transparent" }}
        scrollEnabled={false}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={["*"]}
        mixedContentMode="always"
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
      />
    </View>
  );
}

/* ================================================================== */
/*  Convenience wrappers for each banner size                          */
/* ================================================================== */
export function AdBanner320({ style }: { style?: object }) {
  return <WebAd unitId="banner_320x50" style={style} />;
}
export function AdBanner468({ style }: { style?: object }) {
  return <WebAd unitId="banner_468x60" style={style} />;
}
export function AdBanner728({ style }: { style?: object }) {
  return <WebAd unitId="banner_728x90" style={style} />;
}
export function AdBanner160({ style }: { style?: object }) {
  return <WebAd unitId="banner_160x300" style={style} />;
}
export function AdNativeBanner({ style }: { style?: object }) {
  return <WebAd unitId="native_banner" height={250} style={style} />;
}
export function AdSocialBar({ style }: { style?: object }) {
  return <WebAd unitId="social_bar" height={50} style={style} />;
}

/* ================================================================== */
/*  AdSlot — responsive picker                                         */
/* ================================================================== */
export function AdSlot({
  placement,
  style,
}: {
  placement: "header" | "footer" | "sidebar" | "in-feed" | "mobile-banner";
  style?: object;
}) {
  switch (placement) {
    case "header":
    case "footer":
      // Mobile: 320x50 is the best fit
      return <AdBanner320 style={style} />;
    case "sidebar":
      return <AdBanner160 style={style} />;
    case "in-feed":
      return <AdNativeBanner style={style} />;
    case "mobile-banner":
      return <AdBanner320 style={style} />;
    default:
      return null;
  }
}

/* ================================================================== */
/*  AdSection — labeled ad container                                   */
/* ================================================================== */
export function AdSection({
  placement,
  style,
}: {
  placement: "header" | "footer" | "sidebar" | "in-feed" | "mobile-banner";
  style?: object;
}) {
  return (
    <View style={[s.adSection, style]}>
      <Text style={s.adLabel}>إعلان</Text>
      <AdSlot placement={placement} />
    </View>
  );
}

const s = StyleSheet.create({
  adContainer: {
    width: "100%",
    backgroundColor: COLORS.muted,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  adLabel: {
    position: "absolute",
    top: 2,
    right: 6,
    zIndex: 2,
    fontSize: 8,
    color: COLORS.textMuted,
    opacity: 0.6,
    textTransform: "uppercase",
  },
  adSection: {
    marginVertical: 8,
    gap: 4,
  },
  smartlinkBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: "center",
  },
  smartlinkBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  smartlinkBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.primary + "40",
  },
  smartlinkStar: {
    fontSize: 16,
    color: COLORS.primary,
  },
  smartlinkText: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.text,
  },
});
