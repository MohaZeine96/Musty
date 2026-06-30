const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const mm = require("music-metadata");

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true, // Crucial for security
      nodeIntegration: false, // Crucial for security
      sandbox: true,
    },
  });

  // Load your local HTML file
  mainWindow.loadFile("index.html");
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    // On macOS it's common to re-create a window when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Listen for the 'ping-main' channel from the renderer
// ipcMain.handle("ping-main", async () => {
//   return "Hello from the Main Process!";
// });
// Handle the file read request securely in the main process
// ipcMain.handle("read-directory", async (event, dirPath) => {
//   try {
//     const stats = fs.statSync(dirPath);

//     // Ensure it actually is a directory before reading
//     if (!stats.isDirectory()) {
//       throw new Error(`The path "${dirPath}" is a file, not a directory.`);
//     }

//     // fs.readdir returns an array of strings (filenames) inside the folder
//     const files = fs.readdirSync(dirPath);
//     return files;
//   } catch (error) {
//     console.error("Failed to read directory in Main:", error.message);
//     throw error;
//   }
// });
function formatTime(seconds) {
  if (!seconds || isNaN(seconds) || seconds <= 0) return "--:--";

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  // padStart(2, '0') turns "5" into "05" so you get 3:05 instead of 3:5
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
ipcMain.handle("read-music-directory", async (event, dirPath) => {
  try {
    const files = fs.readdirSync(dirPath);
    const musicDataCollection = [];

    // Supported extensions
    const supportedExts = [".mp3", ".m4a", ".wav", ".flac", ".ogg"];

    for (const fileName of files) {
      const fullPath = path.join(dirPath, fileName);
      const ext = path.extname(fileName).toLowerCase();

      // Only process files that match our audio extensions
      if (supportedExts.includes(ext)) {
        // Inside main.js -> ipcMain.handle('read-music-directory') loop:

        try {
          const metadata = await mm.parseFile(fullPath);
          const { title, artist, album, picture, genre } = metadata.common;

          // 1. Grab duration safely from metadata.format
          const duration =
            metadata.format && metadata.format.duration
              ? Math.floor(metadata.format.duration)
              : 0; // Fallback to 0 if undefined

          let base64Image = null;
          if (picture && picture.length > 0) {
            const pic = picture[0];
            base64Image = `data:${pic.format};base64,${pic.data.toString("base64")}`;
          }

          musicDataCollection.push({
            fileName: fileName,
            filePath: fullPath,
            title: title || fileName,
            artist: artist || "Unknown Artist",
            album: album || "Unknown Album",
            genre: genre || "Unkown genre",
            albumArt: base64Image,
            duration: formatTime(duration), // 2. Pass duration down to the renderer
          });
        } catch (parseError) {
          console.warn(`Skipping broken file ${fileName}:`, parseError.message);
        }
      }
    }

    return musicDataCollection; // Send the array of songs back to renderer
  } catch (error) {
    console.error("Failed to parse directory:", error.message);
    throw error;
  }
});
// Quit when all windows are closed, except on macOS.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
