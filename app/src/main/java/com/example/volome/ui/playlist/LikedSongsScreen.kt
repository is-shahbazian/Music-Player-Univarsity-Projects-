package com.example.volome.ui.playlist

import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.navigation.NavController
import com.example.volome.data.models.Song
import com.example.volome.ui.components.SongListItem
import com.example.volome.ui.components.UniversalTopAppBar
import com.example.volome.viewmodels.MusicViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LikedSongsScreen(
    musicViewModel: MusicViewModel,
    navController: NavController,
    onSongClick: (Song) -> Unit
) {
    val songs by musicViewModel.songs.collectAsState()
    val likedSongs = songs.filter { it.isLiked }

    Scaffold(
        containerColor = Color.Black,
        topBar = {
            UniversalTopAppBar(
                title = "Liked Songs",
                navController = navController
            )
        }
    ) { padding ->
        LazyColumn(modifier = Modifier.padding(padding)) {
            items(likedSongs) { song ->
                SongListItem(song = song) {
                    onSongClick(song)
                }
                HorizontalDivider(color = Color.DarkGray)
            }
        }
    }
}
