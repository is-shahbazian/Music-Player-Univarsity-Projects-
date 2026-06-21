package com.example.volome.ui.playlist

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.Button
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.volome.Routes
import com.example.volome.ui.components.Card
import com.example.volome.ui.components.CardHeader
import com.example.volome.viewmodels.MusicViewModel

@Composable
fun PlaylistScreen(musicViewModel: MusicViewModel, onNavigate: (String) -> Unit) {
    val playlists by musicViewModel.playlists.collectAsState()
    val songs by musicViewModel.songs.collectAsState()
    var showDialog by remember { mutableStateOf(false) }

    Scaffold(
        containerColor = Color.Black,
        floatingActionButton = {
            FloatingActionButton(onClick = { showDialog = true }) {
                Icon(Icons.Default.Add, contentDescription = "Create Playlist")
            }
        }
    ) { padding ->
        if (showDialog) {
            CreatePlaylistDialog(
                songs = songs,
                onDismiss = { showDialog = false },
                onCreate = { name, selectedSongs ->
                    musicViewModel.createPlaylist(name, selectedSongs)
                    showDialog = false
                }
            )
        }

        if (playlists.isEmpty()) {
            Box(
                modifier = Modifier.fillMaxSize().padding(padding),
                contentAlignment = Alignment.Center
            ) {
                Text("No playlists yet. Create one!", color = Color.Gray, fontSize = 18.sp)
            }
        } else {
            LazyColumn(modifier = Modifier.padding(padding)) {
                items(playlists) { playlist ->
                    Card(
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp).clickable {
                            val route = Routes.PLAYLIST_DETAIL.replace("{playlistId}", playlist.id)
                            onNavigate(route)
                        }
                    ) {
                        CardHeader(title = playlist.title, subtitle = "${playlist.songCount} songs")
                    }
                }
            }
        }
    }
}
