package com.example.volome.viewmodels

import android.app.Application
import android.content.ContentUris
import android.content.Context
import android.media.MediaPlayer
import android.net.Uri
import android.provider.MediaStore
import androidx.core.content.edit
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.volome.data.models.Playlist
import com.example.volome.data.models.Song
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.util.UUID

enum class RepeatMode {
    OFF, ONE, ALL
}

class MusicViewModel(application: Application) : AndroidViewModel(application) {

    private val _songs = MutableStateFlow<List<Song>>(emptyList())
    val songs = _songs.asStateFlow()

    private val _playlists = MutableStateFlow<List<Playlist>>(emptyList())
    val playlists = _playlists.asStateFlow()

    private val _currentSong = MutableStateFlow<Song?>(null)
    val currentSong = _currentSong.asStateFlow()

    private val _isPlaying = MutableStateFlow(false)
    val isPlaying = _isPlaying.asStateFlow()

    private val _currentTime = MutableStateFlow(0)
    val currentTime = _currentTime.asStateFlow()

    private val _repeatMode = MutableStateFlow(RepeatMode.OFF)
    val repeatMode = _repeatMode.asStateFlow()

    private var mediaPlayer: MediaPlayer? = null
    private var timeUpdateJob: Job? = null

    private val sharedPreferences = application.getSharedPreferences("music_prefs", Context.MODE_PRIVATE)
    private val likedSongsSetKey = "liked_songs_set"
    private val playlistsKey = "playlists"
    private val gson = Gson()

    init {
        loadPlaylists()
    }

    fun loadSongsFromStorage() {
        viewModelScope.launch {
            val likedSongsIds = sharedPreferences.getStringSet(likedSongsSetKey, emptySet()) ?: emptySet()
            val songList = mutableListOf<Song>()
            val projection = arrayOf(MediaStore.Audio.Media._ID, MediaStore.Audio.Media.TITLE, MediaStore.Audio.Media.ARTIST, MediaStore.Audio.Media.ALBUM_ID, MediaStore.Audio.Media.DURATION)
            val selection = "${MediaStore.Audio.Media.IS_MUSIC} != 0"

            getApplication<Application>().contentResolver.query(
                MediaStore.Audio.Media.EXTERNAL_CONTENT_URI, projection, selection, null, null
            )?.use { cursor ->
                while (cursor.moveToNext()) {
                    val id = cursor.getLong(cursor.getColumnIndexOrThrow(MediaStore.Audio.Media._ID))
                    val title = cursor.getString(cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.TITLE))
                    val artist = cursor.getString(cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.ARTIST))
                    val albumId = cursor.getLong(cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.ALBUM_ID))
                    val duration = cursor.getInt(cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.DURATION))
                    val contentUri = ContentUris.withAppendedId(MediaStore.Audio.Media.EXTERNAL_CONTENT_URI, id)
                    val albumArtUri = ContentUris.withAppendedId(Uri.parse("content://media/external/audio/albumart"), albumId)

                    songList.add(
                        Song(id.toString(), title, artist, contentUri, albumArtUri, duration / 1000, likedSongsIds.contains(id.toString()))
                    )
                }
            }
            _songs.value = songList
        }
    }

    fun createPlaylist(name: String, songs: List<Song>) {
        val newPlaylist = Playlist(
            id = UUID.randomUUID().toString(),
            title = name,
            artwork = songs.firstOrNull()?.albumArtUri.toString(),
            songCount = songs.size,
            songIds = songs.map { it.id }
        )
        val updatedPlaylists = _playlists.value + newPlaylist
        _playlists.value = updatedPlaylists
        savePlaylists(updatedPlaylists)
    }

    fun addSongsToPlaylist(playlistId: String, songs: List<Song>) {
        val updatedPlaylists = _playlists.value.map {
            if (it.id == playlistId) {
                it.copy(
                    songIds = (it.songIds + songs.map { s -> s.id }).distinct(),
                    songCount = (it.songIds + songs.map { s -> s.id }).distinct().size
                )
            } else {
                it
            }
        }
        _playlists.value = updatedPlaylists
        savePlaylists(updatedPlaylists)
    }

    private fun savePlaylists(playlists: List<Playlist>) {
        val json = gson.toJson(playlists)
        sharedPreferences.edit { putString(playlistsKey, json) }
    }

    private fun loadPlaylists() {
        val json = sharedPreferences.getString(playlistsKey, null)
        if (json != null) {
            val type = object : TypeToken<List<Playlist>>() {}.type
            _playlists.value = gson.fromJson(json, type)
        }
    }

    fun playSong(song: Song) {
        _currentSong.value = song
        mediaPlayer?.release()
        mediaPlayer = MediaPlayer().apply {
            setDataSource(getApplication(), song.contentUri)
            prepareAsync()
            setOnPreparedListener { start(); _isPlaying.value = true; startTimeUpdate() }
            setOnCompletionListener { onSongCompletion() }
        }
    }

    private fun onSongCompletion() {
        when (_repeatMode.value) {
            RepeatMode.OFF -> _isPlaying.value = false
            RepeatMode.ONE -> _currentSong.value?.let { playSong(it) }
            RepeatMode.ALL -> playNext()
        }
    }

    fun playNext() {
        val currentIdx = songs.value.indexOf(_currentSong.value).takeIf { it != -1 } ?: return
        val nextIdx = (currentIdx + 1) % songs.value.size
        playSong(songs.value[nextIdx])
    }

    fun playPrevious() {
        val currentIdx = songs.value.indexOf(_currentSong.value).takeIf { it != -1 } ?: return
        val prevIdx = if (currentIdx > 0) currentIdx - 1 else songs.value.size - 1
        playSong(songs.value[prevIdx])
    }

    fun toggleRepeatMode() {
        _repeatMode.value = when (_repeatMode.value) {
            RepeatMode.OFF -> RepeatMode.ALL
            RepeatMode.ALL -> RepeatMode.ONE
            RepeatMode.ONE -> RepeatMode.OFF
        }
    }

    fun shuffleAndPlay() {
        if (songs.value.isNotEmpty()) playSong(songs.value.random())
    }

    fun togglePlayPause() {
        mediaPlayer?.let { if (it.isPlaying) pause() else resume() }
    }

    private fun pause() {
        mediaPlayer?.pause()
        _isPlaying.value = false
        timeUpdateJob?.cancel()
    }

    private fun resume() {
        mediaPlayer?.start()
        _isPlaying.value = true
        startTimeUpdate()
    }

    fun toggleLike(songId: String) {
        val currentLikedIds = sharedPreferences.getStringSet(likedSongsSetKey, mutableSetOf())?.toMutableSet() ?: mutableSetOf()
        val isLiked = currentLikedIds.contains(songId)
        if (isLiked) currentLikedIds.remove(songId) else currentLikedIds.add(songId)
        sharedPreferences.edit { putStringSet(likedSongsSetKey, currentLikedIds) }

        _songs.update { list -> list.map { if (it.id == songId) it.copy(isLiked = !isLiked) else it } }
        if (_currentSong.value?.id == songId) {
            _currentSong.update { it?.copy(isLiked = !isLiked) }
        }
    }

    fun seekTo(progress: Float) {
        mediaPlayer?.let {
            it.seekTo((it.duration * progress).toInt())
            _currentTime.value = it.currentPosition / 1000
        }
    }

    private fun startTimeUpdate() {
        timeUpdateJob?.cancel()
        timeUpdateJob = viewModelScope.launch {
            while (_isPlaying.value) {
                _currentTime.value = mediaPlayer?.currentPosition?.div(1000) ?: 0
                delay(1000)
            }
        }
    }

    override fun onCleared() {
        mediaPlayer?.release()
        timeUpdateJob?.cancel()
        super.onCleared()
    }
}
