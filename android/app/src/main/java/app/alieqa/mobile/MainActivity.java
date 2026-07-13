package app.alieqa.mobile;

import android.os.Bundle;
import android.os.Build;
import android.view.WindowManager;
import android.view.View;
import android.webkit.WebView;
import android.webkit.WebSettings;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Edge-to-edge display: let content draw under status bar
        // The web app handles safe-area-inset via CSS env() variables
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);

        // Set status bar to transparent with light icons (on green bg)
        try {
            getWindow().addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
            getWindow().setStatusBarColor(android.graphics.Color.TRANSPARENT);
            getWindow().setNavigationBarColor(android.graphics.Color.TRANSPARENT);

            // Light icons (status bar icons are white on green background)
            WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
            if (controller != null) {
                controller.setAppearanceLightStatusBars(false);
                controller.setAppearanceLightNavigationBars(false);
            }
        } catch (Exception e) {
            // ignore
        }

        try {
            WebView webView = this.bridge.getWebView();
            if (webView != null) {
                WebSettings settings = webView.getSettings();

                // Set a custom user agent so the web app can detect it's running
                // inside the Capacitor mobile app (not a regular browser).
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

                // Set background to green so status bar area matches app
                webView.setBackgroundColor(android.graphics.Color.parseColor("#2E7D4F"));
            }
        } catch (Exception e) {
            // ignore — best-effort customization
        }
    }
}
