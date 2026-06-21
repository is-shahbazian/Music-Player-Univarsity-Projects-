package com.example.volome.ui.home

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Shuffle
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.volome.Routes
import com.example.volome.data.SampleData
import com.example.volome.data.models.Playlist
import com.example.volome.ui.components.GlassButton
import com.example.volome.ui.components.SongListItem
import com.example.volome.viewmodels.MusicViewModel
import java.util.Calendar

@OptIn(ExperimentalMaterial3Api::class, ExperimentalFoundationApi::class)
@Composable
fun HomeScreen(
    musicViewModel: MusicViewModel,
    onNavigate: (String) -> Unit
) {
    val songs by musicViewModel.songs.collectAsState()
    val likedSongs = songs.filter { it.isLiked }

    val greeting = remember {
        val calendar = Calendar.getInstance()
        when (calendar.get(Calendar.HOUR_OF_DAY)) {
            in 5..11 -> "Good Morning"
            in 12..17 -> "Good Afternoon"
            else -> "Good Evening"
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(greeting, fontWeight = FontWeight.Bold, fontSize = 28.sp, color = Color.White) },
                actions = {
                    Box(modifier = Modifier.size(44.dp).clip(CircleShape).background(Color.Gray)) // Avatar
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.Black)
            )
        },
        containerColor = Color.Black
    ) { paddingValues ->
        LazyColumn(modifier = Modifier.padding(paddingValues)) {
            item {
                PlaylistGridSection(likedSongsCount = likedSongs.size, onNavigate = onNavigate)
            }
            item {
                MusicListHeader(songCount = songs.size, onNavigate = onNavigate, onShuffleClick = {
                    musicViewModel.shuffleAndPlay()
                    onNavigate(Routes.NOW_PLAYING)
                })
            }
            items(songs) { song ->
                SongListItem(
                    song = song,
                    onClick = {
                        musicViewModel.playSong(song)
                        onNavigate(Routes.NOW_PLAYING)
                    }
                )
                HorizontalDivider(color = Color.DarkGray, modifier = Modifier.padding(start = 88.dp))
            }
        }
    }
}

@Composable
fun PlaylistGridSection(likedSongsCount: Int, onNavigate: (String) -> Unit) {
    val playlists = SampleData.samplePlaylists // Using sample playlists for now

    LazyRow(
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 16.dp),
        horizontalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        if (likedSongsCount > 0) {
            item {
                LikedSongsPlaylistItem(likedSongsCount) { onNavigate(Routes.LIKED_SONGS) }
            }
        }
        items(playlists) { playlist ->
            PlaylistSquareItem(playlist) { 
                val route = Routes.PLAYLIST_DETAIL.replace("{playlistId}", playlist.id)
                onNavigate(route)
            }
        }
        item {
            AddPlaylistItem { onNavigate(Routes.PLAYLISTS) }
        }
    }
}

@Composable
fun PlaylistSquareItem(playlist: Playlist, onClick: () -> Unit) {
    Column(Modifier.width(160.dp).clickable(onClick = onClick)) {
        AsyncImage(
            model = playlist.artwork,
            contentDescription = playlist.title,
            modifier = Modifier.size(160.dp).clip(RoundedCornerShape(12.dp)),
            contentScale = ContentScale.Crop
        )
        Text(playlist.title, color = Color.White, modifier = Modifier.padding(top = 8.dp), maxLines = 1)
        Text("${playlist.songCount} Songs", color = Color.Gray, fontSize = 14.sp)
    }
}

@Composable
fun LikedSongsPlaylistItem(songCount: Int, onClick: () -> Unit) {
    Column(Modifier.width(160.dp).clickable(onClick = onClick)) {
        Box(
            modifier = Modifier.size(160.dp).clip(RoundedCornerShape(12.dp)).background(Brush.verticalGradient(listOf(Color(0xFF8A2BE2), Color(0xFF4B0082)))),
            contentAlignment = Alignment.Center
        ) {
            Icon(Icons.Filled.Favorite, "Liked Songs", tint = Color.White, modifier = Modifier.size(70.dp))
        }
        Text("Liked Songs", color = Color.White, modifier = Modifier.padding(top = 8.dp))
        Text("$songCount Songs", color = Color.Gray, fontSize = 14.sp)
    }
}

@Composable
fun AddPlaylistItem(onClick: () -> Unit) {
    Column(Modifier.width(160.dp).clickable(onClick = onClick)) {
        Box(
            modifier = Modifier.size(160.dp).clip(RoundedCornerShape(12.dp)).background(Color(0xFF282828)),
            contentAlignment = Alignment.Center
        ) {
            Icon(Icons.Default.Add, "Add Playlist", tint = Color.White, modifier = Modifier.size(70.dp))
        }
        Text("Create Playlist", color = Color.White, modifier = Modifier.padding(top = 8.dp))
    }
}

@Composable
fun MusicListHeader(songCount: Int, onNavigate: (String) -> Unit, onShuffleClick: () -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 20.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Column {
             Text("Music's", style = MaterialTheme.typography.headlineSmall, color = Color.White, fontWeight = FontWeight.Bold)
             Text("$songCount Songs", style = MaterialTheme.typography.bodyMedium, color = Color.Gray)
        }
        Row {
            GlassButton(onClick = { onNavigate(Routes.SEARCH) }, shape = RoundedCornerShape(24.dp)) {
                Icon(Icons.Default.Search, "Search", tint = Color.White)
            }
            Spacer(modifier = Modifier.width(8.dp))
            GlassButton(onClick = onShuffleClick, shape = RoundedCornerShape(24.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Shuffle, "Shuffle", tint=Color.White)
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Shuffle", color=Color.White)
                }
            }
        }
    }
}
