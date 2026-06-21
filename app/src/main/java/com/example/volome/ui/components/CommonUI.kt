package com.example.volome.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.composed
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController

/**
 * یک TopAppBar عمومی که دکمه بازگشت را فقط در صورتی نمایش می‌دهد
 * که صفحه‌ای برای بازگشت در پشته ناوبری وجود داشته باشد.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun UniversalTopAppBar(
    title: String,
    navController: NavController,
    modifier: Modifier = Modifier
) {
    val canNavigateBack = navController.previousBackStackEntry != null

    TopAppBar(
        title = { Text(text = title, color = Color.White) },
        modifier = modifier,
        colors = TopAppBarDefaults.topAppBarColors(
            containerColor = Color.Transparent // برای هماهنگی با دیزاین شیشه‌ای
        ),
        navigationIcon = {
            if (canNavigateBack) {
                IconButton(onClick = { navController.navigateUp() }) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "Back",
                        tint = Color.White
                    )
                }
            }
        }
    )
}

/**
 * یک Modifier برای ایجاد افکت شیشه‌ای (Glassmorphism) روی هر Composable.
 */
fun Modifier.glassmorphism(
    shape: Shape,
    color: Color = Color.White.copy(alpha = 0.1f),
    borderColor: Color = Color.White.copy(alpha = 0.2f),
    borderWidth: Dp = 1.dp
): Modifier = composed {
    this
        .clip(shape)
        .background(color)
        .border(width = borderWidth, color = borderColor, shape = shape)
}

/**
 * یک Modifier برای ایجاد پس‌زمینه مخصوص صفحه پلیر با هاله‌ای از نور قرمز.
 */
fun Modifier.playerBackground(): Modifier {
    return this.background(
        Brush.radialGradient(
            colors = listOf(
                Color(0xFF6B0000), // قرمز تیره در مرکز
                Color.Black,      // مشکی در لبه‌ها
            ),
            radius = 1200f // شعاع بزرگ برای ایجاد هاله نرم
        )
    )
}
