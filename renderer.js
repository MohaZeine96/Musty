// renderer.js
const songList = document.querySelector("#song-list");
const mainPlayer = document.querySelector("#mainPlayer");
const play = document.querySelector("#play");
const prograss_bar = document.querySelector("#prograss-bar");
const current_time = document.querySelector("#current-time");
const total_time = document.querySelector("#total-time");
const artTag = document.querySelector("#artTag");
let playButton;
// const waitForPing = async () => {
//   try {
//     const response = await window.electronAPI.ping();
//     console.log("Response from main process:", response);
//   } catch (error) {
//     console.error("Error while pinging main process:", error);
//   }
// };
// waitForPing();

// const handlefileload = async (event) => {
//   // const filePath = event.target.files[0].path;
//   try {
//     // Clear the old list UI

//     // Ask the Main process for the full array of items inside the folder
//     const filesArray = await window.dirReader.readFolder(
//       "C:\\Users\\mohaz\\Music",
//     );

//     // Loop through the filenames and append them to your UI
//     filesArray.forEach((fileName) => {
//       const li = document.createElement("li");
//       li.innerText = fileName;
//       songList.appendChild(li);
//     });
//   } catch (err) {
//     console.error("Error reading directory:", err);
//   }
//   // Call the safe fs reader bridge we created in preload.js
// };
// handlefileload();

const handleFilesLoad = async (event) => {
  // const filesSelected = event.target.files;

  const folderPath = "C:\\Users\\mohaz\\Music"; // Root folder path

  try {
    // Request the scanned tracks array from the main process
    const tracks = await window.musicAPI.parseFolder(folderPath);

    tracks.forEach((el) => {
      const html = `<div class="song-item">
                        
                        <div class="song-control">
                            <span class="song-selector"></span>
                            <button class="play-button">
                              <img src="img/icons8-play-50.png" alt="Play" />
                            </button>
                            
                        </div>
                        <div class="song-info">
                            <div class="metaData">
                                <span class="song-title">${el.title}</span >
                                <span class="song-artist">${el.artist}</span>
                                <span class="song-album">${el.album}</span>
                                <span class="song-genre">${el.genre}</span>
                            </div>
                          
                            <div class="Song-duration">
                                <span class="song-duration">${el.duration}</span>
                            </div>
                            
                        </div>
                       </div>`;
      songList.insertAdjacentHTML("beforeend", html);
      playButton = document.querySelectorAll(".play-button");
      let oldPlaying;
      playButton.forEach((el, i) => {
        el.addEventListener("click", () => {
          const song_item = document.querySelectorAll(".song-item");
          const currentTrack = tracks[i];
          console.log(i);

          const filePath = currentTrack.filePath;
          mainPlayer.src = filePath;
          oldPlaying === undefined
            ? ""
            : song_item[oldPlaying].classList?.remove("playing");
          mainPlayer.play();
          song_item[i].classList.add("playing");
          play.children[0].src = "img/pause.png";

          // Display album art
          console.log("Album Art:", currentTrack.albumArt);
          if (artTag && currentTrack.albumArt) {
            artTag.src = currentTrack.albumArt;
          }

          oldPlaying = i;
        });
      });
    });
  } catch (error) {
    console.error("Error while loading files:", error);
  }
};
handleFilesLoad();

play.addEventListener("click", () => {
  if (mainPlayer.paused) {
    mainPlayer.play();
    play.children[0].src = "img/pause.png";
  } else {
    mainPlayer.pause();
    play.children[0].src = "img/play.png";
  }
});
function formatTime(seconds) {
  if (!seconds || isNaN(seconds) || seconds <= 0) return "--:--";

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  // padStart(2, '0') turns "5" into "05" so you get 3:05 instead of 3:5
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
mainPlayer.addEventListener("timeupdate", () => {
  const current = mainPlayer.currentTime; // Current time in seconds
  const duration = mainPlayer.duration; // Total duration in seconds

  if (duration) {
    // Calculate the percentage of the song played
    const progressPercent = (current / duration) * 100;
    prograss_bar.style.width = progressPercent + "%";

    // Update your UI timestamps
    current_time.innerText = formatTime(current);
    total_time.innerText = formatTime(duration);
  }
});
