package app.alieqa.mobile;

import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebSettings;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        try {
            WebView webView = this.bridge.getWebView();
            if (webView != null) {
                WebSettings settings = webView.getSettings();

                // Set a custom user agent so the web app can detect it's running
                // inside the Capacitor mobile app (not a regular browser).
                // This triggers the mobile-specific UI (stepper calculator, etc.)
                String currentUA = settings.getUserAgentString();
                if (currentUA != null && !currentUA.contains("Capacitor")) {
                    settings.setUserAgentString(currentUA + " CapacitorApp/1.0");
                }

                // Ensure proper viewport handling — fill the screen exactly
                settings.setLoadWithOverviewMode(true);
                settings.setUseWideViewPort(true);
                settings.setSupportZoom(false);
                settings.setBuiltInZoomControls(false);

                // Prevent horizontal scroll/overflow
                webView.setHorizontalScrollBarEnabled(false);
                webView.setScrollbarFadingEnabled(true);
                webView.setOverScrollMode(WebView.OVER_SCROLL_NEVER);
            }
        } catch (Exception e) {
            // ignore — best-effort customization
        }
    }
}
