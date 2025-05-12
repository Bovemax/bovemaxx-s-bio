const audio = document.getElementById('audio');
const playPauseButton = document.querySelector('.play-pause i');
const skipForwardButton = document.querySelector('.skip-forward');
const skipBackwardButton = document.querySelector('.skip-backward');
const songTitleDisplay = document.querySelector('.song-title');

let isPlaying = false;
let currentSongIndex = 0;
let songs = []; // Will be populated from JSON

let isFirstPlay = true; // Flag to track if it's the first play of the first song

function loadSong(index) {
    const currentSong = songs[index];
    audio.src = currentSong.src;
    songTitleDisplay.textContent = `${currentSong.title} - ${currentSong.artist}`; // Display both
    isPlaying = false;
    updatePlayPauseButton();
    audio.volume = 0.5; // Set default volume here (0.0 to 1.0)

    // If it's the first song and it's the first play, set the starting time
    if (index === 0 && isFirstPlay) {
        audio.addEventListener('loadedmetadata', function setStartTime() {
            audio.currentTime = 11.903; // Start at 11.903 seconds
            audio.removeEventListener('loadedmetadata', setStartTime); // Remove listener after it's used
            isFirstPlay = false; // Reset the flag for future songs
        });
    }
}

function playPause() {
    if (audio.paused) {
        audio.play();
        isPlaying = true;

        // If it's the first song and it's the first play, set the flag to false
        if (currentSongIndex === 0 && isFirstPlay) {
            isFirstPlay = false; // Mark that the first play has occurred
        }
    } else {
        audio.pause();
        isPlaying = false;
    }
    updatePlayPauseButton();
}

function skipForward() {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    loadSong(currentSongIndex);
    audio.play(); // Start playing the new song
    isPlaying = true;
    updatePlayPauseButton();
}

function skipBackward() {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    loadSong(currentSongIndex);
    audio.play(); // Start playing the new song
    isPlaying = true;
    updatePlayPauseButton();
}

function updatePlayPauseButton() {
    playPauseButton.classList.remove(isPlaying ? 'fa-play' : 'fa-pause');
    playPauseButton.classList.add(isPlaying ? 'fa-pause' : 'fa-play');
}

function fetchPlaylist() {
    fetch('js/playlist.json') // Adjust path if necessary
        .then(response => response.json())
        .then(data => {
            songs = data;
            loadSong(currentSongIndex); // Load the first song
        })
        .catch(error => console.error('Error fetching playlist:', error));
}

// Fetch the playlist and then start the player
fetchPlaylist();

// Event listeners
playPauseButton.addEventListener('click', playPause);
skipForwardButton.addEventListener('click', skipForward);
skipBackwardButton.addEventListener('click', skipBackward);
audio.addEventListener('ended', skipForward);