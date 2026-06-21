package com.example.volome.data.models

data class Playlist(
    val id: String,
    val title: String,
    val artwork: String,
    val songCount: Int,
    val songIds: List<String>
)
