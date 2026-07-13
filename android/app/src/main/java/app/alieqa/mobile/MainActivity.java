package app.alieqa.mobile;

import android.os.Bundle;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Set a custom user agent so the web app can detect it's running
        // inside the Capacitor mobile app (not a regular browser).
        // This triggers the mobile-specific UI (stepper calculator, etc.)
        try {
            WebView webView = this.bridge.getWebView();
            if (webView != null) {
                String currentUA = webView.getSettings().getUserAgentString();
                if (currentUA != null && !currentUA.contains("Capacitor")) {
                    webView.getSettings().setUserAgentString(currentUA + " CapacitorApp/1.0");
                }
            }
        } catch (Exception e) {
            // ignore — user agent customization is best-effort
        }
    }
}
