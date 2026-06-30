// const { app, BrowserWindow, ipcMain, protocol, net } = require("electron");
// const path = require("path");
// const fs = require("fs");
// const mm = require("music-metadata");

// // 1. You must register these precise privileges BEFORE the app is ready
// protocol.registerSchemesAsPrivileged([
//   {
//     scheme: "media",
//     privileges: {
//       bypassCSP: true,
//       stream: true,
//       corsEnabled: true,
//       standard: true, // <-- CRITICAL: Tells Electron this behaves like a standard URL
//       supportFetchAPI: true,
//     },
//   },
// ]);
// function createWindow() {
//   // Create the browser window.
//   const mainWindow = new BrowserWindow({
//     width: 800,
//     height: 600,
//     webPreferences: {
//       preload: path.join(__dirname, "preload.js"),
//       contextIsolation: true, // Crucial for security
//       nodeIntegration: false, // Crucial for security
//       sandbox: true,
//     },
//   });

//   // Load your local HTML file
//   mainWindow.loadFile("index.html");
// }

// // This method will be called when Electron has finished initialization
// app.whenReady().then(() => {
//   // 2. Intercept the hardcoded HTML source string
//   protocol.handle("media", (request) => {
//     // Extract the raw file path from the URL
//     let filePath = request.url.slice("media://".length);

//     // Decode spaces, commas, and special characters safely
//     filePath = decodeURIComponent(filePath);

//     // Clean up any double or leading slashes added by Windows paths
//     if (filePath.startsWith("/")) {
//       filePath = filePath.substring(1);
//     }

//     // This will print to your terminal so you can verify it matches your folder structure
//     console.log("Streaming from:", filePath);

//     // Stream the file back to your hardcoded HTML element
//     return net.fetch(`file://${filePath}`);
//   });

//   createWindow();
// });

// // Listen for the 'ping-main' channel from the renderer
// // ipcMain.handle("ping-main", async () => {
// //   return "Hello from the Main Process!";
// // });
// // Handle the file read request securely in the main process
// // ipcMain.handle("read-directory", async (event, dirPath) => {
// //   try {
// //     const stats = fs.statSync(dirPath);

// //     // Ensure it actually is a directory before reading
// //     if (!stats.isDirectory()) {
// //       throw new Error(`The path "${dirPath}" is a file, not a directory.`);
// //     }

// //     // fs.readdir returns an array of strings (filenames) inside the folder
// //     const files = fs.readdirSync(dirPath);
// //     return files;
// //   } catch (error) {
// //     console.error("Failed to read directory in Main:", error.message);
// //     throw error;
// //   }
// // });
// function formatTime(seconds) {
//   if (!seconds || isNaN(seconds) || seconds <= 0) return "--:--";

//   const mins = Math.floor(seconds / 60);
//   const secs = Math.floor(seconds % 60);

//   // padStart(2, '0') turns "5" into "05" so you get 3:05 instead of 3:5
//   return `${mins}:${secs.toString().padStart(2, "0")}`;
// }
// ipcMain.handle("read-music-directory", async (event, dirPath) => {
//   try {
//     const files = fs.readdirSync(dirPath);
//     const musicDataCollection = [];

//     // Supported extensions
//     const supportedExts = [".mp3", ".m4a", ".wav", ".flac", ".ogg"];

//     for (const fileName of files) {
//       const fullPath = path.join(dirPath, fileName);
//       const ext = path.extname(fileName).toLowerCase();

//       // Only process files that match our audio extensions
//       if (supportedExts.includes(ext)) {
//         // Inside main.js -> ipcMain.handle('read-music-directory') loop:

//         try {
//           const metadata = await mm.parseFile(fullPath);
//           const { title, artist, album, picture, genre } = metadata.common;

//           // 1. Grab duration safely from metadata.format
//           const duration =
//             metadata.format && metadata.format.duration
//               ? Math.floor(metadata.format.duration)
//               : 0; // Fallback to 0 if undefined

//           let base64Image = null;
//           if (picture && picture.length > 0) {
//             const pic = picture[0];
//             base64Image = `data:${pic.format};base64,${pic.data.toString("base64")}`;
//           }

//           musicDataCollection.push({
//             fileName: fileName,
//             filePath: fullPath,
//             title: title || fileName,
//             artist: artist || "Unknown Artist",
//             album: album || "Unknown Album",
//             genre: genre || "Unkown genre",
//             albumArt: uint8ArrayToBase64(base64Image),
//             duration: formatTime(duration), // 2. Pass duration down to the renderer
//           });
//         } catch (parseError) {
//           console.warn(`Skipping broken file ${fileName}:`, parseError.message);
//         }
//       }
//     }
//     function uint8ArrayToBase64(uint8Array) {
//       let binaryString = "";
//       const chunkSize = 65536;

//       for (let i = 0; i < uint8Array.length; i += chunkSize) {
//         const chunk = uint8Array.subarray(i, i + chunkSize);
//         binaryString += String.fromCharCode.apply(null, chunk);
//       }

//       // ❌ Don't use btoa() in main.js (Node environment)
//       // return btoa(binaryString);

//       // ✅ Use Buffer to encode the binary string in Node.js:
//       return Buffer.from(binaryString, "binary").toString("base64");
//     }
//     return musicDataCollection; // Send the array of songs back to renderer
//   } catch (error) {
//     console.error("Failed to parse directory:", error.message);
//     throw error;
//   }
// });

// // async function getSongTags(filePath) {
// //     try {
// //         // Import the music-metadata library
// //         const mm = await import('music-metadata');
// //         const metadata = await mm.parseFile(filePath);
// //         const { uint8ArrayToBase64 } = await import('uint8array-extras');
// //         // If there's no metadata, log and return null
// //         if (!metadata) {
// //             console.error("Failed to extract metadata.");
// //             return null;
// //         }

// //         // Extract metadata
// //         const songTags = {
// //             title: metadata.common.title || "Unknown Title",
// //             artist: metadata.common.artist || "Unknown Artist",
// //             album: metadata.common.album || "Unknown Album",
// //             year: metadata.common.year || 0,
// //             genre: metadata.common.genre ? metadata.common.genre.join(", ") : "Unknown Genre",
// //             duration: metadata.format.duration ? metadata.format.duration : 0,
// //             albumArt: false, // Default to null
// //             id: count++
// //         };

// //         // Extract album art if present
// //         if (metadata.common.picture && metadata.common.picture.length > 0) {
// //             const pictureData = metadata.common.picture[0].data; // Picture data (Buffer or Uint8Array)

// //             // Convert picture data to Base64
// //             const base64Image = (Buffer.isBuffer(pictureData))
// //                 ? pictureData.toString("base64")
// //                 : uint8ArrayToBase64(pictureData);

// //             const mimeType = metadata.common.picture[0].format || "image/png"; // Default to PNG if format is missing
// //             songTags.albumArt = `data:${mimeType};base64,${base64Image}`; // Set album art as Base64 data URL
// //         } else {
// //             songTags.albumArt = false; // Ensure albumArt is null if no picture exists
// //         }
// //         return songTags;
// //     } catch (err) {
// //         console.error("Error reading metadata:", err.message);
// //         return null;
// //     }
// // }
// // Quit when all windows are closed, except on macOS.
// app.on("window-all-closed", () => {
//   if (process.platform !== "darwin") app.quit();
// });

const { app, BrowserWindow, ipcMain, protocol, net } = require("electron");
const path = require("path");
const fs = require("fs");
const mm = require("music-metadata");

// 1. Register privileges BEFORE the app is ready
protocol.registerSchemesAsPrivileged([
  {
    scheme: "media",
    privileges: {
      bypassCSP: true,
      stream: true,
      corsEnabled: true,
      standard: true,
      supportFetchAPI: true,
    },
  },
]);

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.loadFile("index.html");
}

app.whenReady().then(() => {
  // 2. Intercept custom media protocol streams
  protocol.handle("media", (request) => {
    let filePath = request.url.slice("media://".length);
    filePath = decodeURIComponent(filePath);

    if (filePath.startsWith("/")) {
      filePath = filePath.substring(1);
    }

    console.log("Streaming from:", filePath);
    return net.fetch(`file://${filePath}`);
  });

  createWindow();
});

function formatTime(seconds) {
  if (!seconds || isNaN(seconds) || seconds <= 0) return "--:--";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// Global utility helper inside the Main Node environment
function uint8ArrayToBase64(uint8Array) {
  let binaryString = "";
  const chunkSize = 65536;

  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.subarray(i, i + chunkSize);
    binaryString += String.fromCharCode.apply(null, chunk);
  }

  return Buffer.from(binaryString, "binary").toString("base64");
}

ipcMain.handle("read-music-directory", async (event, dirPath) => {
  try {
    const files = fs.readdirSync(dirPath);
    const musicDataCollection = [];
    const supportedExts = [".mp3", ".m4a", ".wav", ".flac", ".ogg"];

    for (const fileName of files) {
      const fullPath = path.join(dirPath, fileName);
      const ext = path.extname(fileName).toLowerCase();

      if (supportedExts.includes(ext)) {
        try {
          const metadata = await mm.parseFile(fullPath);
          const { title, artist, album, picture, genre } = metadata.common;

          const duration =
            metadata.format && metadata.format.duration
              ? Math.floor(metadata.format.duration)
              : 0;

          // --- FIX: Securely handle artwork processing ---
          let base64Image = null;
          if (picture && picture.length > 0) {
            const pic = picture[0];

            // 1. Convert the raw binary buffer/Uint8Array using your custom function
            const base64Data = uint8ArrayToBase64(pic.data);

            // 2. Clean up and sanitize the mime-type string
            let mimeType = (pic.format || "image/png").toLowerCase().trim();
            if (!mimeType.startsWith("image/")) {
              if (mimeType === "jpg") mimeType = "jpeg";
              mimeType = `image/${mimeType}`;
            }

            // 3. Assemble the completed Data URI string
            base64Image = `data:${mimeType};base64,${base64Data}`;
          }

          musicDataCollection.push({
            fileName: fileName,
            filePath: fullPath,
            title: title || fileName,
            artist: artist || "Unknown Artist",
            album: album || "Unknown Album",
            genre: genre || "Unknown genre",
            albumArt: base64Image, // ✅ Sends ready string data or null cleanly
            duration: formatTime(duration),
          });
        } catch (parseError) {
          console.warn(`Skipping broken file ${fileName}:`, parseError.message);
        }
      }
    }

    return musicDataCollection;
  } catch (error) {
    console.error("Failed to parse directory:", error.message);
    throw error;
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
