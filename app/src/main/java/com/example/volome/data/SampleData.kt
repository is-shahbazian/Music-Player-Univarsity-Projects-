package com.example.volome.data

import android.net.Uri
import androidx.core.net.toUri
import com.example.volome.data.models.Playlist
import com.example.volome.data.models.Song

object SampleData {

    // This data is now only for UI previews and sample playlists, as real songs are loaded from storage.
    private val sampleSongs = listOf(
        Song(
            id = "1",
            title = "Bohemian Rhapsody",
            artist = "Queen",
            contentUri = Uri.EMPTY,
            albumArtUri = "https://upload.wikimedia.org/wikipedia/en/9/9f/Bohemian_Rhapsody.png".toUri(),
            duration = 355
        ),
        Song(
            id = "2",
            title = "Stairway to Heaven",
            artist = "Led Zeppelin",
            contentUri = Uri.EMPTY,
            albumArtUri = "https://upload.wikimedia.org/wikipedia/en/5/52/Stairway_to_Heaven_by_Led_Zeppelin_US_promotional_single.png".toUri(),
            duration = 482
        ),
        Song(
            id = "3",
            title = "Hotel California",
            artist = "Eagles",
            contentUri = Uri.EMPTY,
            albumArtUri = "https://upload.wikimedia.org/wikipedia/en/4/49/Hotelcalifornia.jpg".toUri(),
            duration = 390
        ),
        Song(
            id = "4",
            title = "Smells Like Teen Spirit",
            artist = "Nirvana",
            contentUri = Uri.EMPTY,
            albumArtUri = "https://upload.wikimedia.org/wikipedia/en/3/3c/Smells_Like_Teen_Spirit.jpg".toUri(),
            duration = 301
        ),
        Song(
            id = "5",
            title = "Like a Rolling Stone",
            artist = "Bob Dylan",
            contentUri = Uri.EMPTY,
            albumArtUri = "https://upload.wikimedia.org/wikipedia/en/c/c1/Like_a_rolling_stone_by_bob_dylan_us_single_cover.jpg".toUri(),
            duration = 369
        )
    )

    val samplePlaylists = listOf(
        Playlist("p1", "Rock Classics", "https://i.scdn.co/image/ab67706c0000bebb4a9f34a0a5e8399a77519e48", 5, sampleSongs.map { it.id }),
        Playlist("p2", "Chill Mix", "https://i.scdn.co/image/ab67706f00000002b1f8f5e7e5f1f1d1f0f1b0e3", 3, sampleSongs.shuffled().map { it.id }.take(3)),
        Playlist("p3", "Workout Jams", "https://i.scdn.co/image/ab67706f000000029c1b9a9b7a0d8e8b0f8c8d2a", 4, sampleSongs.shuffled().map { it.id }.take(4))
    )

    fun getSongs(): List<Song> = sampleSongs

    fun getPlaylists(): List<Playlist> = samplePlaylists
}
