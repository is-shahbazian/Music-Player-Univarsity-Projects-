package com.example.volome.ui.album

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import coil.compose.AsyncImage
import com.example.volome.data.models.Song
import com.example.volome.ui.components.SongListItem
import com.example.volome.ui.components.UniversalTopAppBar
import com.example.volome.ui.components.glassmorphism
import com.example.volome.ui.playlist.CreatePlaylistDialog
import com.example.volome.viewmodels.MusicViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AlbumDetailScreen(
    playlistId: String?,
    musicViewModel: MusicViewModel,
    navController: NavController,
    onSongClick: (Song) -> Unit
) {
    val allSongs by musicViewModel.songs.collectAsState()
    val playlists by musicViewModel.playlists.collectAsState()
    var showAddSongDialog by remember { mutableStateOf(false) }

    val playlist = playlists.find { it.id == playlistId }
    val songsInPlaylist = allSongs.filter { playlist?.songIds?.contains(it.id) == true }

    val title = playlist?.title ?: "Playlist"
    val artwork = playlist?.artwork

    if (showAddSongDialog) {
        CreatePlaylistDialog(
            songs = allSongs.filterNot { s -> playlist?.songIds?.contains(s.id) == true },
            onDismiss = { showAddSongDialog = false },
            onCreate = { _, songsToAdd ->
                if (playlistId != null) {
                    musicViewModel.addSongsToPlaylist(playlistId, songsToAdd)
                }
                showAddSongDialog = false
            }
        )
    }

    Scaffold(
        containerColor = Color.Black,
        topBar = {
            UniversalTopAppBar(
                title = title,
                navController = navController
            )
        }
    ) { padding ->
        LazyColumn(modifier = Modifier.padding(padding), contentPadding = PaddingValues(bottom = 120.dp)) {
            item {
                PlaylistHeader(title, songsInPlaylist.size, artwork,
                    onPlayAll = {
                        if (songsInPlaylist.isNotEmpty()) {
                            onSongClick(songsInPlaylist.first())
                        }
                    },
                    onAddSongs = { showAddSongDialog = true }
                )
            }
            items(songsInPlaylist) { song ->
                SongListItem(song = song, onClick = { onSongClick(song) })
                HorizontalDivider(color = Color.DarkGray, modifier = Modifier.padding(start = 72.dp))
            }
        }
    }
}

@Composable
private fun PlaylistHeader(
    title: String, songCount: Int, artwork: String?,
    onPlayAll: () -> Unit,
    onAddSongs: () -> Unit
) {
    Column(
        modifier = Modifier.padding(horizontal = 16.dp, vertical = 24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        AsyncImage(
            model = artwork,
            contentDescription = title,
            modifier = Modifier.size(200.dp).clip(RoundedCornerShape(16.dp)).background(Color.DarkGray),
            contentScale = ContentScale.Crop
        )
        Spacer(modifier = Modifier.height(24.dp))
        Text(title, style = MaterialTheme.typography.headlineMedium, color = Color.White, fontWeight = FontWeight.Bold)
        Text("$songCount Songs", style = MaterialTheme.typography.bodyMedium, color = Color.Gray)
        Spacer(modifier = Modifier.height(24.dp))
        Row {
            Button(
                onClick = onPlayAll,
                shape = CircleShape,
                modifier = Modifier.glassmorphism(CircleShape)
            ) {
                Icon(Icons.Default.PlayArrow, "Play All", tint = Color.White)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Play All", color = Color.White)
            }
            Spacer(modifier = Modifier.width(12.dp))
            OutlinedButton(
                onClick = onAddSongs,
                shape = CircleShape,
                modifier = Modifier.glassmorphism(CircleShape)
            ) {
                Icon(Icons.Default.Add, "Add Songs", tint = Color.White)
            }
        }
    }
}
