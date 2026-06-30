// renderer.js
const songList = document.querySelector("#song-list");
const mainPlayer = document.querySelector("#mainPlayer");
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
      console.log(tracks);
    });
  } catch (error) {
    console.error("Error while loading files:", error);
  }
};
handleFilesLoad();
