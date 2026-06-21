package com.example.volome.data.models

import android.net.Uri

data class Song(
    val id: String,
    val title: String,
    val artist: String,
    val contentUri: Uri,      // URI to the actual audio file
    val albumArtUri: Uri?,    // URI for the album artwork
    val duration: Int,
    var isLiked: Boolean = false // To track liked status
)
