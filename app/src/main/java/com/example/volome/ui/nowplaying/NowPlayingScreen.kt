package com.example.volome.ui.nowplaying

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.VolumeUp
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import com.example.volome.ui.components.playerBackground
import com.example.volome.viewmodels.MusicViewModel
import com.example.volome.viewmodels.RepeatMode

@Composable
fun NowPlayingScreen(
    musicViewModel: MusicViewModel = viewModel(),
    onBack: () -> Unit
) {
    // --- State Management ---
    val currentSong by musicViewModel.currentSong.collectAsState()
    val isPlaying by musicViewModel.isPlaying.collectAsState()
    val currentTime by musicViewModel.currentTime.collectAsState()
    val repeatMode by musicViewModel.repeatMode.collectAsState()
    
    var isShuffleEnabled by remember { mutableStateOf(false) }

    val playPauseScale by animateFloatAsState(targetValue = if (isPlaying) 1.2f else 1.0f, label = "PlayPauseAnimation")

    Box(
        modifier = Modifier
            .fillMaxSize()
            .playerBackground()
            .padding(horizontal = 24.dp, vertical = 16.dp)
    ) {
        if (currentSong == null) {
             Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("No song playing", color = Color.White)
                 IconButton(onClick = onBack) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = Color.White)
                }
            }
        } else {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.fillMaxSize()
            ) {
                PlayerTopBar(onBack)
                Spacer(modifier = Modifier.height(32.dp))
                
                AlbumArt(albumArtUri = currentSong!!.albumArtUri)
                
                Spacer(modifier = Modifier.height(32.dp))
                SongInfo(title = currentSong!!.title, artist = currentSong!!.artist)
                Spacer(modifier = Modifier.height(24.dp))
                
                ProgressSlider(
                    progress = currentTime.toFloat(),
                    duration = currentSong!!.duration.toFloat(),
                    onSeek = { newPosition ->
                        val duration = currentSong!!.duration.toFloat()
                        if (duration > 0) {
                            musicViewModel.seekTo(newPosition / duration)
                        }
                    }
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                PlayerControls(
                    isPlaying = isPlaying,
                    isShuffleEnabled = isShuffleEnabled,
                    repeatMode = repeatMode,
                    onPlayPauseClick = { musicViewModel.togglePlayPause() },
                    onShuffleClick = { 
                        isShuffleEnabled = !isShuffleEnabled
                        if(isShuffleEnabled) musicViewModel.shuffleAndPlay()
                    },
                    onRepeatClick = { musicViewModel.toggleRepeatMode() },
                    onNextClick = { musicViewModel.playNext() },
                    onPrevClick = { musicViewModel.playPrevious() },
                    playPauseScale = playPauseScale
                )
                Spacer(modifier = Modifier.weight(1f))
                VolumeControls()
            }
        }
    }
}

@Composable
private fun PlayerTopBar(onBack: () -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(top = 16.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        IconButton(onClick = onBack) {
            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = Color.White)
        }
        Text("Now Playing", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 18.sp)
        IconButton(onClick = { /* Show options menu */ }) {
            Icon(Icons.Default.MoreVert, contentDescription = "More Options", tint = Color.White)
        }
    }
}

@Composable
private fun AlbumArt(albumArtUri: android.net.Uri?) {
    AsyncImage(
        model = albumArtUri,
        contentDescription = "Album Art",
        contentScale = ContentScale.Crop,
        modifier = Modifier
            .fillMaxWidth()
            .aspectRatio(1f)
            .clip(RoundedCornerShape(12.dp))
            .background(Color.DarkGray)
    )
}

@Composable
private fun SongInfo(title: String, artist: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(title, fontSize = 24.sp, fontWeight = FontWeight.Bold, color = Color.White, textAlign = TextAlign.Center, maxLines = 1)
        Text(artist, fontSize = 16.sp, color = Color.LightGray, textAlign = TextAlign.Center, maxLines = 1)
    }
}

@Composable
private fun ProgressSlider(progress: Float, duration: Float, onSeek: (Float) -> Unit) {
    Column {
        Slider(
            value = progress,
            onValueChange = onSeek,
            valueRange = 0f..(if (duration > 0) duration else 1f),
            colors = SliderDefaults.colors(
                thumbColor = Color.White,
                activeTrackColor = Color.White,
                inactiveTrackColor = Color.White.copy(alpha = 0.3f)
            )
        )
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text(text = formatTime(progress.toInt()), color = Color.LightGray, fontSize = 12.sp)
            Text(text = formatTime(duration.toInt()), color = Color.LightGray, fontSize = 12.sp)
        }
    }
}

@Composable
private fun PlayerControls(
    isPlaying: Boolean, isShuffleEnabled: Boolean, repeatMode: RepeatMode,
    onPlayPauseClick: () -> Unit, onShuffleClick: () -> Unit, onRepeatClick: () -> Unit,
    onNextClick: () -> Unit, onPrevClick: () -> Unit, playPauseScale: Float
) {
    val activeColor = Color(0xFFE91E63)
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceEvenly,
        verticalAlignment = Alignment.CenterVertically
    ) {
        IconButton(onClick = onShuffleClick) {
            Icon(Icons.Default.Shuffle, "Shuffle", tint = if (isShuffleEnabled) activeColor else Color.White)
        }
        IconButton(onClick = onPrevClick) {
            Icon(Icons.Default.SkipPrevious, "Previous", tint = Color.White, modifier = Modifier.size(36.dp))
        }
        IconButton(
            onClick = onPlayPauseClick,
            modifier = Modifier.scale(playPauseScale).background(Color.White, CircleShape).size(64.dp)
        ) {
            Icon(
                imageVector = if (isPlaying) Icons.Default.Pause else Icons.Default.PlayArrow,
                contentDescription = "Play/Pause", tint = Color.Black, modifier = Modifier.size(32.dp)
            )
        }
        IconButton(onClick = onNextClick) {
            Icon(Icons.Default.SkipNext, "Next", tint = Color.White, modifier = Modifier.size(36.dp))
        }
        IconButton(onClick = onRepeatClick) {
             val icon = when (repeatMode) {
                RepeatMode.ONE -> Icons.Default.LooksOne // Replaced RepeatOne
                else -> Icons.Default.Repeat
            }
            Icon(imageVector = icon, "Repeat", tint = if (repeatMode != RepeatMode.OFF) activeColor else Color.White)
        }
    }
}

@Composable
private fun VolumeControls() {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(Icons.AutoMirrored.Filled.VolumeUp, "Volume", tint = Color.LightGray)
        Slider(
            value = 0.5f, // This should come from a ViewModel
            onValueChange = { /* Set system volume */ },
            modifier = Modifier.weight(1f).padding(horizontal = 8.dp),
            colors = SliderDefaults.colors(
                thumbColor = Color.White,
                activeTrackColor = Color.White,
                inactiveTrackColor = Color.White.copy(alpha = 0.3f)
            )
        )
        Icon(Icons.Default.Router, "Cast", tint = Color.LightGray) // Replaced Airplay
    }
}

private fun formatTime(seconds: Int): String {
    val minutes = seconds / 60
    val remainingSeconds = seconds % 60
    return "%d:%02d".format(minutes, remainingSeconds)
}
