package com.khaledsamir.reelseek

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import com.khaledsamir.reelseek.ui.RootScaffold
import com.khaledsamir.reelseek.ui.theme.ReelseekTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            ReelseekTheme {
                RootScaffold()
            }
        }
    }
}
