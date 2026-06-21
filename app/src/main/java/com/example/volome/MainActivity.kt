package com.example.volome

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavType
import androidx.navigation.compose.*
import androidx.navigation.navArgument
import coil.compose.AsyncImage
import com.example.volome.ui.album.AlbumDetailScreen
import com.example.volome.ui.home.HomeScreen
import com.example.volome.ui.nowplaying.NowPlayingScreen
import com.example.volome.ui.playlist.LikedSongsScreen
import com.example.volome.ui.playlist.PlaylistScreen
import com.example.volome.ui.search.SearchScreen
import com.example.volome.ui.theme.VolomeTheme
import com.example.volome.viewmodels.MusicViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge() // Enables immersive mode
        setContent {
            VolomeTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    PermissionWrapper()
                }
            }
        }
    }
}

@Composable
fun PermissionWrapper() {
    val context = LocalContext.current
    val permission = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        Manifest.permission.READ_MEDIA_AUDIO
    } else {
        Manifest.permission.READ_EXTERNAL_STORAGE
    }

    var hasPermission by remember { mutableStateOf(ContextCompat.checkSelfPermission(context, permission) == PackageManager.PERMISSION_GRANTED) }

    val permissionLauncher = rememberLauncherForActivityResult(contract = ActivityResultContracts.RequestPermission()) { isGranted ->
        hasPermission = isGranted
    }

    LaunchedEffect(Unit) {
        if (!hasPermission) {
            permissionLauncher.launch(permission)
        }
    }

    if (hasPermission) {
        MusicPlayerApp()
    } else {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Button(onClick = { permissionLauncher.launch(permission) }) {
                Text("Grant Permission")
            }
        }
    }
}

@Composable
fun MusicPlayerApp() {
    val musicViewModel: MusicViewModel = viewModel()
    val navController = rememberNavController()
    val currentSong by musicViewModel.currentSong.collectAsState()

    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route
    val showBottomBar = currentSong != null && currentRoute != Routes.NOW_PLAYING

    LaunchedEffect(Unit) {
        musicViewModel.loadSongsFromStorage()
    }

    Scaffold(
        bottomBar = {
            if (showBottomBar) {
                BottomPlayerBar(musicViewModel = musicViewModel, onClick = { navController.navigate(Routes.NOW_PLAYING) })
            }
        },
        containerColor = Color.Black
    ) { padding ->
        NavHost(navController = navController, startDestination = Routes.HOME, modifier = Modifier.padding(padding)) {
            composable(Routes.HOME) { HomeScreen(musicViewModel = musicViewModel, onNavigate = { route -> navController.navigate(route) }) }
            composable(Routes.SEARCH) { SearchScreen(musicViewModel = musicViewModel, navController = navController, onNavigate = { route -> navController.navigate(route) }) }
            composable(Routes.NOW_PLAYING) { NowPlayingScreen(musicViewModel = musicViewModel, onBack = { navController.popBackStack() }) }
            composable(Routes.LIKED_SONGS) { LikedSongsScreen(musicViewModel = musicViewModel, navController = navController, onSongClick = { song -> musicViewModel.playSong(song); navController.navigate(Routes.NOW_PLAYING) }) }
            composable(Routes.PLAYLISTS) { PlaylistScreen(musicViewModel = musicViewModel, onNavigate = { route -> navController.navigate(route) }) }
            composable(
                route = Routes.PLAYLIST_DETAIL,
                arguments = listOf(navArgument("playlistId") { type = NavType.StringType })
            ) { backStackEntry ->
                val playlistId = backStackEntry.arguments?.getString("playlistId")
                AlbumDetailScreen(
                    playlistId = playlistId,
                    musicViewModel = musicViewModel,
                    navController = navController,
                    onSongClick = { song ->
                        musicViewModel.playSong(song)
                        navController.navigate(Routes.NOW_PLAYING)
                    }
                )
            }
        }
    }
}

@Composable
fun BottomPlayerBar(musicViewModel: MusicViewModel, onClick: () -> Unit) {
    val currentSong by musicViewModel.currentSong.collectAsState()
    val isPlaying by musicViewModel.isPlaying.collectAsState()

    currentSong?.let { song ->
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFF1A1A1A))
                .clickable(onClick = onClick)
                .padding(horizontal = 12.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(modifier = Modifier.weight(1f), verticalAlignment = Alignment.CenterVertically) {
                AsyncImage(
                    model = song.albumArtUri,
                    contentDescription = "Album Art",
                    modifier = Modifier.size(48.dp).clip(RoundedCornerShape(8.dp)),
                    contentScale = ContentScale.Crop
                )
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text(song.title, color = Color.White, maxLines = 1, overflow = TextOverflow.Ellipsis)
                    Text(song.artist, color = Color.Gray, maxLines = 1, overflow = TextOverflow.Ellipsis)
                }
            }
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = { musicViewModel.toggleLike(song.id) }) {
                    Icon(
                        imageVector = if (song.isLiked) Icons.Filled.Favorite else Icons.Default.FavoriteBorder,
                        contentDescription = "Like",
                        tint = if (song.isLiked) Color.Red else Color.Gray
                    )
                }
                IconButton(onClick = { musicViewModel.togglePlayPause() }) {
                    Icon(
                        imageVector = if (isPlaying) Icons.Default.Pause else Icons.Default.PlayArrow,
                        contentDescription = "Play/Pause",
                        tint = Color.White,
                        modifier = Modifier.size(36.dp)
                    )
                }
            }
        }
    }
}
