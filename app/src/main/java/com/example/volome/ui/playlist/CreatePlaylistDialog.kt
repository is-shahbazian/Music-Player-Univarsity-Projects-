package com.example.volome.ui.playlist

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Checkbox
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import com.example.volome.data.models.Song

@Composable
fun CreatePlaylistDialog(
    songs: List<Song>,
    onDismiss: () -> Unit,
    onCreate: (String, List<Song>) -> Unit
) {
    var playlistName by remember { mutableStateOf("") }
    val selectedSongs = remember { mutableStateOf(listOf<Song>()) }

    Dialog(onDismissRequest = onDismiss) {
        Surface(color = Color.DarkGray) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("Create Playlist", color = Color.White)
                Spacer(modifier = Modifier.height(8.dp))
                OutlinedTextField(
                    value = playlistName,
                    onValueChange = { playlistName = it },
                    label = { Text("Playlist Name") },
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(16.dp))
                Text("Select Songs", color = Color.White)
                LazyColumn(modifier = Modifier.height(200.dp)) {
                    items(songs) { song ->
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Checkbox(
                                checked = selectedSongs.value.contains(song),
                                onCheckedChange = {
                                    val currentSelection = selectedSongs.value.toMutableList()
                                    if (it) {
                                        currentSelection.add(song)
                                    } else {
                                        currentSelection.remove(song)
                                    }
                                    selectedSongs.value = currentSelection
                                }
                            )
                            Text(text = song.title, color = Color.White)
                        }
                    }
                }
                Spacer(modifier = Modifier.height(16.dp))
                Row {
                    Button(onClick = onDismiss) {
                        Text("Cancel")
                    }
                    Spacer(modifier = Modifier.weight(1f))
                    Button(onClick = { onCreate(playlistName, selectedSongs.value) }) {
                        Text("Create")
                    }
                }
            }
        }
    }
}
