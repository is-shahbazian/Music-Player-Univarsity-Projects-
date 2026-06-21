package com.example.volome.ui.search

import android.content.Context
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.edit
import androidx.navigation.NavController
import com.example.volome.Routes
import com.example.volome.data.SampleData
import com.example.volome.ui.components.SongListItem
import com.example.volome.ui.components.UniversalTopAppBar
import com.example.volome.ui.home.PlaylistSquareItem
import com.example.volome.viewmodels.MusicViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SearchScreen(
    musicViewModel: MusicViewModel,
    navController: NavController,
    onNavigate: (String) -> Unit
) {
    val allSongs by musicViewModel.songs.collectAsState()
    var searchQuery by remember { mutableStateOf("") }
    var activeTab by remember { mutableStateOf("Top") }

    val context = LocalContext.current
    val searchHistoryPrefs = remember { context.getSharedPreferences("search_history", Context.MODE_PRIVATE) }
    var searchHistory by remember { mutableStateOf(searchHistoryPrefs.getStringSet("history", emptySet())?.toList() ?: emptyList()) }

    val filteredSongs = remember(searchQuery, allSongs) {
        if (searchQuery.isBlank()) emptyList() else allSongs.filter {
            it.title.contains(searchQuery, ignoreCase = true) || it.artist.contains(searchQuery, ignoreCase = true)
        }
    }
    val filteredPlaylists = remember(searchQuery) { // Using sample data for now
         if (searchQuery.isBlank()) emptyList() else SampleData.samplePlaylists.filter {
            it.title.contains(searchQuery, ignoreCase = true)
        }
    }

    fun performSearch() {
        if (searchQuery.isNotBlank()) {
            val newHistory = listOf(searchQuery) + searchHistory.filter { it != searchQuery }
            searchHistory = newHistory.take(10)
            searchHistoryPrefs.edit { putStringSet("history", searchHistory.toSet()) }
        }
    }

    Scaffold(
        containerColor = Color.Black,
        topBar = {
            UniversalTopAppBar(
                title = "Search",
                navController = navController
            )
        }
    ) { padding ->
        Column(modifier = Modifier.padding(padding).padding(horizontal = 16.dp)) {
            val keyboardController = LocalSoftwareKeyboardController.current
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                modifier = Modifier.fillMaxWidth(),
                placeholder = { Text("Search for songs or playlists", color = Color.Gray) },
                leadingIcon = { Icon(Icons.Default.Search, "Search Icon", tint = Color.Gray) },
                shape = RoundedCornerShape(12.dp),
                colors = TextFieldDefaults.colors(
                    focusedContainerColor = Color(0xFF1E1E1E),
                    unfocusedContainerColor = Color(0xFF1E1E1E),
                    focusedIndicatorColor = Color.Transparent,
                    unfocusedIndicatorColor = Color.Transparent,
                ),
                singleLine = true,
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                keyboardActions = KeyboardActions(
                    onSearch = {
                        performSearch()
                        keyboardController?.hide()
                    }
                )
            )
            
            Spacer(modifier = Modifier.height(16.dp))

            if (searchQuery.isBlank() && searchHistory.isNotEmpty()) {
                // TODO: Search History View
            } else {
                // Search Results View
                TabRow(selectedTabIndex = when(activeTab) {"Top" -> 0 "Songs" -> 1 else -> 2}, containerColor = Color.Black) {
                    listOf("Top", "Songs", "Playlists").forEach { title ->
                        Tab(
                            selected = activeTab == title,
                            onClick = { activeTab = title },
                            text = { Text(title) },
                            selectedContentColor = Color.White,
                            unselectedContentColor = Color.Gray
                        )
                    }
                }
                LazyColumn(modifier = Modifier.padding(top = 16.dp)) {
                    val showSongs = (activeTab == "Top" || activeTab == "Songs") && filteredSongs.isNotEmpty()
                    val showPlaylists = (activeTab == "Top" || activeTab == "Playlists") && filteredPlaylists.isNotEmpty()

                    if (showPlaylists) {
                        item { Text("Playlists", style = MaterialTheme.typography.titleMedium, color = Color.White, modifier = Modifier.padding(vertical = 8.dp)) }
                        items(filteredPlaylists) {
                            PlaylistSquareItem(playlist = it, onClick = { /*TODO*/ })
                            Spacer(modifier = Modifier.height(8.dp))
                        }
                    }
                    
                    if (showSongs) {
                        item { Text("Songs", style = MaterialTheme.typography.titleMedium, color = Color.White, modifier = Modifier.padding(vertical = 8.dp)) }
                        items(filteredSongs) {
                             SongListItem(song = it) {
                                musicViewModel.playSong(it)
                                onNavigate(Routes.NOW_PLAYING)
                            }
                            HorizontalDivider(color = Color.DarkGray, modifier = Modifier.padding(start = 72.dp))
                        }
                    }
                }
            }
        }
    }
}
