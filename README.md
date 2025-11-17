<img width="1484" height="548" alt="Screenshot 2025-11-16 at 2 15 44 PM" src="https://github.com/user-attachments/assets/b40169ef-de58-4f55-b3ea-772573612ff5" />

# 🌐 DAE_DIGITAL NATIVE WORKSHOP  
### Nov25 Scraping Street View    
**Tools:** Google Street View API, Node.js, FFmpeg, QGIS  

The workshop positions **code as camera** — exploring how digital infrastructures and APIs encode geography and movement to **reconstruct digital landscapes** as narrative and critical media.

---

## Overview

*Scraping Street View* explores how to use open web infrastructures as creative and investigative tools.  
Through this workshop, participants will learn how to use the **Google Street View API** to programmatically capture sequences of images from specific locations — transforming them into short, coded video essays.

The workshop combines **scripting, mapping, and visual storytelling** to reframe familiar platforms such as Google Maps and Street View as open datasets for artistic exploration.

Participants will learn to:
- Access and use the Google Street View API
- Extract geolocated imagery from chosen routes or locations
- Visualize and manipulate spatial data in **QGIS**
- Generate camera movements through code
- Convert image sequences into short videos using **FFmpeg**

By the end, each participant will be able to “film” a short, coded documentary — using only open-access material and scripting as the camera.

---

<img width="1715" height="992" alt="Screenshot 2025-09-04 at 9 51 46 AM" src="https://github.com/user-attachments/assets/55ededbf-fb2e-47d1-9ec0-51cc7bf24615" />

## References

- [Laura Kurgan](https://c4sr.columbia.edu/projects/plain-sight)
- [CSR - Conflict Urbanism](https://centerforspatialresearch.github.io/conflict_urbanism_sp2023/2023/04/28/Those-Who-Live-and-Travel-in-the-Dark.html)
- [Robert Pietrusko](https://www.warning-office.org/wo-test-sites)
- [Sam Lavigne](https://lav.io/projects/street-views/)
- [James Bridle](https://jamesbridle.com/works/every-cctv-camera-cc)
- [Clement Valla](https://clementvalla.com/work/postcards-from-google-earth/)
- [Dan Miller](https://dl.acm.org/doi/10.1145/3715668.3736392#:~:text=As%20we%20Witness%20the%20unraveling,stored%20the%20files%20%5B9%5D.)
- [Mario Santamaria](https://www.mariosantamaria.net/Emerald-black-latency/)
- [Simon Weckert](https://www.simonweckert.com/googlemapshacks.html)
- [Jenny Odell](https://www.jennyodell.com/satellite-landscapes.html)
- [Josh Begley](https://joshbegley.com/)
- [WTTDOTM](https://trafficcamphotobooth.com/animenyc.html)
- [Tatu Gustaffsson](https://stanisland.com/2024/10/08/tatu-gustaffsson-cctv-project-finland/)

---

## Requirements

- Basic familiarity with JavaScript (or curiosity to learn)
- A laptop with macOS, Windows, or Linux
- 1. A GitHub account for forking the workshop repository
- 2. Google account (for API key setup and My Maps) - **for the purpose of this exercise you will use my API key, but I show you how to set up one for the future
- 3. QGIS - for getting coordinate points to run image searching and camera movements
- 4. Visual Studio Code with installed dependencies: `Node.js`, `npm`, `FFmpeg` (we will see how to install them at the beginning of workshop)


### 1. GitHub Account

You will need a GitHub account in order to:

- Fork the workshop repository to your own profile  
- Clone the folder locally  
- Run the scripts on your machine  

GitHub serves mainly as a way to bring the workshop code into your own environment.

### 2. Google Account

A Google account is necessary for two reasons:

A. **Using the Google Street View API**  
B. **Creating and tracing your route in Google My Maps**  
   We will use My Maps to design a path for the camera movement.  
   This path will later be exported and transformed into a list of GPS points for the API to scrape.

<img width="1137" height="802" alt="Screenshot 2025-11-16 at 2 27 31 PM" src="https://github.com/user-attachments/assets/ac44a750-ae39-4d01-a5df-6ade1c7d6e90" />


### 3. QGIS

QGIS will be used for transforming the route created in Google My Maps into a set of coordinates that the API can follow.

1. **Install QGIS**  
   Import your My Maps export (KML/KMZ) - drag and drop file into canvas.
   
2. **Add a basemap**  
   Install plugin "QuickMapSerives" to view satellite or street basemaps to helps orient yourself spatially.

    <img width="1591" height="994" alt="Screenshot 2025-11-16 at 2 10 52 PM" src="https://github.com/user-attachments/assets/908f2143-a48f-42ff-a0eb-104cb8e74d8a" />

4. **Generate points along your route**  
   Use the “Points Along Geometry” tool to generate evenly spaced coordinates points. 
   The spacing value controls how close each Street View capture will be. The tool is automatically set in degree, as ad advice 0.00001° ≈ 1 meters

   Notes:  
   - Google Street View often has imagery every ~5 meters  
   - You can use smaller spacing to capture more detail, but not always is available 
   - Even if you oversample, the script can be adjusted later
  
   <img width="1478" height="748" alt="Screenshot 2025-11-16 at 2 13 03 PM" src="https://github.com/user-attachments/assets/c4380a7a-b71a-49ea-94dc-601f302692c3" />


5. **Export as GeoJSON**  
   Save your point layer as a `.geojson` file (e.g., `points.geojson`).  
   Place this file inside your workshop folder next to your `.js` script — the script will automatically detect and use the coordinates.

### 4. Visual Studio Code

Before you can run these camera tools, make sure you have these dependencies installed on your computer:

**0. Brew**
[Homebrew](https://brew.sh/) is the package manager used to install tools like Node.js and FFmpeg.

Open the Terminal app and run:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```
**1. Node.js (JavaScript Runtime)**
Required to run all camera scripts.

**Install on Mac:**
```bash
brew install node
```

**Install on Windows:**
- Download from [nodejs.org](https://nodejs.org/) (LTS version)
- Run the installer and follow prompts

**Install on Linux:**
```bash
sudo apt-get install nodejs npm
```

**Verify installation:**
```bash
node --version  # Should show v18+ or higher
npm --version   # Should show 8+
```

**2. FFmpeg (Video Creation)**
Required to convert image frames into MP4 videos.

**Install on Mac:**
```bash
brew install ffmpeg
```

**Install on Windows:**
- Download from [ffmpeg.org](https://ffmpeg.org/download.html)
- Extract and add to PATH environment variable
- Or use: `choco install ffmpeg` (if you have Chocolatey)

**Install on Linux:**
```bash
sudo apt-get install ffmpeg
```

**Verify installation:**
```bash
ffmpeg -version  # Should show ffmpeg version info
```


---

### **Folder Structure**

When you open this folder in VS Code, you should see:

```
tools/
├── camera-01-static.js           ← Edit parameters here
├── camera-02-zoom.js             ← Edit parameters here
├── camera-03-rotation.js         ← Edit parameters here
├── camera-04-pitch.js            ← Edit parameters here
├── camera-05-combined.js         ← Edit parameters here
├── camera-06-superzoom.js        ← Edit parameters here
├── camera-07-satellite-superzoom.js ← Edit parameters here
├── camera-08-spiral.js           ← Edit parameters here
├── camera-params-XX.js           ← Auto-generated by --export-only
├── index.html                    ← Open this in browser to visualize
├── points.geojson                ← GPS route data
├── README.md                     ← You are here!
├── output_static/                ← Frames created here after running scripts
├── output_zoom/
├── output_spiral_08/
└── ... (other output folders)
```

---

### **Google API Key Setup (Required for Full Video Mode)**

To download Street View images, you need a Google Maps API key.

**How to set it up:**

1. **Get your API key** (it's already provided in the code):
   ```
   xxx
   ```

2. **Set the environment variable** (do this ONCE per terminal session):
   
   **On Mac/Linux:**
   ```bash
   export GOOGLE_API_KEY="xxx"
   ```
   
   **On Windows (PowerShell):**
   ```powershell
   $env:GOOGLE_API_KEY="xxx"
   ```

3. **Verify it's set:**
   ```bash
   echo $GOOGLE_API_KEY  # Should print the key
   ```

**Tip:** After setting the environment variable, you can run camera scripts in the same terminal without repeating this step. If you open a new terminal, you'll need to set it again.

---

### **Quick Verification Checklist**

Before running these tools, verify everything is installed:

```bash
# ✓ Check Node.js
node --version

# ✓ Check NPM
npm --version

# ✓ Check FFmpeg
ffmpeg -version

# ✓ Check you're in the right folder
pwd  # Should show: .../DAE_Workshop/tools

# ✓ Check GPS data file exists
ls -la points.geojson

# ✓ Check at least one camera script exists
ls -la camera-01-static.js
```

—


### **Camera Scripts**

Every camera script is editable and the preview is visible on index.html in “Camera Movement”. To preview and print the result there are **two modes**:

| Mode | Command | Time | Use Case |
|------|---------|------|----------|
|  **Test** (no downloads) | `node camera-08-spiral.js --export-only` | 2 seconds | Iterate on parameters |
| **Create** (full video) | `node camera-08-spiral.js` | 5-10 min | Generate final video |

### **Workflow:**

```bash
# 1. Edit parameters (top of camera-08-spiral.js)
nano camera-08-spiral.js
# Change: SPIRAL_AMPLITUDE = 90 → 45

# 2. Test instantly (no image downloads!)
node camera-08-spiral.js --export-only

# 3. Refresh browser (see 3D changes immediately)
# 4. Loop: Edit → Test → Refresh until happy

# 5. Ready for final video? Run full mode:
export GOOGLE_API_KEY="xxx"
node camera-08-spiral.js

# 6. Create video:
ffmpeg -framerate 30 -i output_spiral_08/%05d.jpg -c:v libx264 -pix_fmt yuv420p -y output_spiral_08.mp4
```

### **8 Cameras snippets:**

```
1. camera-01-static.js      → Static forward view
2. camera-02-zoom.js        → Progressive zoom
3. camera-03-rotation.js    → 360° rotation
4. camera-04-pitch.js       → Up/down motion
5. camera-05-combined.js    → Multiple effects combined
6. camera-06-superzoom.js   → Extreme API + digital zoom
7. camera-07-satellite.js   → Satellite path/zoom
8. camera-08-spiral.js      → Narrowing spiral motion
```


---

#### **Mode 1: Testing (--export-only flag)**
- Instant parameter export to hmtl
- No image downloads
- Refresh browser to see 3D visualization update

#### **Mode 2: Full Video (no flag)**
- Downloads n Street View images
- Saves frames to `output_XX/` folder
- Ready for ffmpeg video creation
- Launch when you're happy with your parameters

#### **Key Features**
- All parameters editable at the **top** of each file  
- **Single file per camera** - edit and run the same file  


---


### 1. Choose a Camera Movement
Each file focuses on one camera effect:
- **camera-01-static.js** - Basic forward-facing view
- **camera-02-zoom.js** - Progressive zoom effect
- **camera-03-rotation.js** - Rotating camera
- **camera-04-pitch.js** - Looking up/down
- **camera-05-combined.js** - Multiple effects combined
**camera-06-superzoom.js** - Extreme zoom into pixel detail (Street View)
**camera-07-satellite-superzoom.js** - Satellite path/zoom
- **camera-08-spiral.js** - Spiral mathematical values

### 2. Edit Parameters
Open any tool file and **edit the values at the top** (in the CONFIGURATION section):

```javascript
// ============================================
//  CONFIGURATION - TWEAK ONLY THESE PARAMETERS!
// ============================================
const FOV = 90;          // Change this!
const PITCH = 0;         // Change this!
const HEADING_OFFSET = 0; // Change this!
```

### 3. Run the Camera Movement
```bash
export GOOGLE_API_KEY="xxx"
node camera-01-static.js
```
—
# MOVEMENTS

## Parameter Reference

### FOV (Field of View)
- **1°** - Maximum zoom (telephoto lens)
- **30°** - Medium zoom
- **60°** - Normal view
- **90°** - Wide angle
- **120°** - Ultra-wide (fish-eye)

### Pitch (Vertical Angle)
- **-90°** - Straight down (bird's eye view)
- **-45°** - Looking down at street
- **0°** - Horizon (normal forward view)
- **+45°** - Looking up at buildings
- **+90°** - Straight up (sky view)

### Heading (Horizontal Direction)
- **0°** - North
- **90°** - East
- **180°** - South
- **270°** - West
- Use `HEADING_OFFSET` to rotate from the route direction

### Common Settings

**Standard frame count:**
- `MAX_FRAMES = 100` - Short video (~3 seconds at 30fps)
- `MAX_FRAMES = 150` - Medium video (~5 seconds)
- `MAX_FRAMES = 200` - Long video (~6.6 seconds)
- `MAX_FRAMES = 300` - Extended video (~10 seconds)

**Distance between frames:**
- `MIN_DISTANCE = 5` - Smooth motion (recommended)
- `MIN_DISTANCE = 10` - Faster motion, more jumpy
- `MIN_DISTANCE = 2` - Very smooth, many frames

---

## 1: Static Camera

**File:** `camera-01-static.js`

**What it does:** Basic forward-facing view as you move along the route.

**Parameters to tweak:**
```javascript
const FOV = 90;                // 1° (zoomed) to 120° (wide)
const PITCH = 0;               // -90° (down) to +90° (up)
const HEADING_OFFSET = 0;      // Degrees offset from route direction
```

**Try these:**
- `FOV = 120` - Ultra-wide fish-eye view
- `FOV = 30` - Zoomed telephoto view
- `PITCH = -45` - Looking down at the street
- `PITCH = 45` - Looking up at buildings
- `HEADING_OFFSET = 90` - Looking sideways (right)

---

## 2: Progressive Zoom

**File:** `camera-02-zoom.js`

**What it does:** Gradually zooms in as you move along the route.

**Parameters to tweak:**
```javascript
const FOV_START = 120;         // Starting FOV (wide)
const FOV_END = 1;             // Ending FOV (zoomed)
const ZOOM_CURVE = 3.5;        // How fast the zoom accelerates
const PITCH = 0;               // Look angle
```

**Try these:**
- `ZOOM_CURVE = 1` - Linear zoom (steady speed)
- `ZOOM_CURVE = 4` - Fast zoom at the end
- `FOV_START = 90, FOV_END = 30` - Gentle zoom
- `PITCH = -30` - Zoom while looking down

**Zoom curve explained:**
- `1` = steady speed throughout
- `2` = slightly faster at end
- `3.5` = much faster at end (recommended)
- `5` = extreme acceleration at end

---

## 3: Rotation

**File:** `camera-03-rotation.js`

**What it does:** Rotates the camera while moving.

**Parameters to tweak:**
```javascript
const FOV = 90;
const PITCH = 0;
const ROTATION_DEGREES = 720;      // Total rotation
const ROTATION_TYPE = 'continuous'; // or 'oscillating'
const OSCILLATION_COUNT = 4;       // For oscillating mode
```

**Try these:**
- `ROTATION_DEGREES = 360` - One full spin
- `ROTATION_DEGREES = 1440` - Four full spins
- `ROTATION_TYPE = 'oscillating'` - Swing back and forth
- `OSCILLATION_COUNT = 2` - Faster oscillation
- `PITCH = 45` - Rotate while looking up

**Rotation types:**
- `continuous` - Spins in one direction
- `oscillating` - Swings side to side

---

## 4: Pitch Movement

**File:** `camera-04-pitch.js`

**What it does:** Changes the vertical viewing angle (up/down).

**Parameters to tweak:**
```javascript
const FOV = 90;
const PITCH_TYPE = 'sine';         // 'sine', 'linear', 'descent', 'ascent'
const PITCH_AMPLITUDE = 45;        // Max angle from horizon
const PITCH_FREQUENCY = 4;         // Oscillation speed (for sine)
const PITCH_START = -90;           // Start angle (for linear/descent/ascent)
const PITCH_END = 0;               // End angle
```

**Try these:**

**Sine wave (oscillating):**
- `PITCH_TYPE = 'sine', PITCH_AMPLITUDE = 60, PITCH_FREQUENCY = 3`
- Creates smooth up/down motion

**Descent (bird's eye):**
- `PITCH_TYPE = 'descent', PITCH_START = -90, PITCH_END = 0`
- Starts looking straight down, ends at horizon

**Ascent:**
- `PITCH_TYPE = 'ascent', PITCH_START = 0, PITCH_END = 90`
- Starts at horizon, ends looking straight up

**Linear:**
- `PITCH_TYPE = 'linear'` - Steady transition without easing

---

## 5: Combined Effects

**File:** `camera-05-combined.js`

**What it does:** Combines zoom, pitch, and rotation simultaneously!

**Parameters to tweak:**
```javascript
// Zoom
const FOV_START = 90;
const FOV_END = 30;
const FOV_CURVE = 2;

// Pitch (up/down oscillation)
const PITCH_AMPLITUDE = 30;
const PITCH_FREQUENCY = 3;

// Heading (rotation + wave)
const ROTATION_DEGREES = 360;
const HEADING_WAVE_AMP = 45;
const HEADING_WAVE_FREQ = 5;
```

**Try these:**
- **Spiral zoom:** `FOV_CURVE = 3, ROTATION_DEGREES = 720, PITCH_AMPLITUDE = 20`
- **Wave motion:** `PITCH_AMPLITUDE = 40, HEADING_WAVE_AMP = 60`
- **Extreme:** `FOV_END = 1, ROTATION_DEGREES = 1440, PITCH_AMPLITUDE = 60`

---

## 6: Super Zoom (API + Digital)

**File:** `camera-06-superzoom.js`

**What it does:** Two-phase zoom - first uses API zoom (FOV 120° → 1°), then continues zooming digitally into pixel-level detail (1x → 100x).

**Note:** Requires the `sharp` package for image processing:
```bash
npm install sharp
```

**Parameters to tweak:**
```javascript
const FOV_START = 120;             // Starting FOV (wide)
const FOV_END = 1;                 // Minimum FOV (max API zoom)
const API_ZOOM_FRAMES = 100;       // Frames for phase 1 (API zoom)
const DIGITAL_ZOOM_MAX = 100;      // Max digital zoom factor
const MAX_FRAMES = 200;            // Total frames
const ZOOM_CURVE = 3.5;            // API zoom speed curve
const DIGITAL_ZOOM_CURVE = 2.5;    // Digital zoom speed curve
```

**Try these:**

**Extreme super zoom:**
- `API_ZOOM_FRAMES = 80, DIGITAL_ZOOM_MAX = 200, MAX_FRAMES = 200`
- Goes from wide view to extreme pixel magnification

**Faster digital zoom:**
- `DIGITAL_ZOOM_CURVE = 4` - Accelerates faster into pixels

**Balanced two-phase:**
- `API_ZOOM_FRAMES = 100, MAX_FRAMES = 200` - Equal time for each phase

**Pixel art effect:**
- `DIGITAL_ZOOM_MAX = 50, DIGITAL_ZOOM_CURVE = 1.5` - Moderate pixelation

**How it works:**
1. **Phase 1 (Frames 1-100):** Uses Google's API to zoom from FOV 120° to FOV 1°
2. **Phase 2 (Frames 101-200):** Takes FOV 1° image, crops smaller and smaller areas from center, scales back up with pixelation

**Visual effect:**
- Smooth zoom from wide angle → maximum API zoom → pixel-level detail
- Creates dramatic "zoom into the pixels" effect
- Final frames show heavily pixelated detail

---

## 7: Satellite Super Zoom

**File:** `camera-07-satellite-superzoom.js`

**What it does:** Two-phase zoom from satellite/space view - first uses API zoom levels (12 → 21), then continues zooming digitally into pixel-level detail (1x → 50x). Like Google Earth zooming from space down to street level and beyond.

**Note:** Requires the `sharp` package for image processing:
```bash
npm install sharp
```

**Parameters to tweak:**
```javascript
const ZOOM_START = 12;             // Starting zoom level (wide view)
const ZOOM_END = 21;               // Maximum API zoom level
const API_ZOOM_FRAMES = 120;       // Frames for phase 1 (API zoom)
const DIGITAL_ZOOM_MAX = 50;       // Max digital zoom factor
const MAX_FRAMES = 200;            // Total frames
const MAP_TYPE = 'satellite';      // 'satellite' or 'hybrid'
const ZOOM_CURVE = 2.5;            // API zoom speed curve
const DIGITAL_ZOOM_CURVE = 3.0;    // Digital zoom speed curve
const SCALE = 2;                   // API scale (1 or 2 for higher quality)
```

**Try these:**

**From space to ground:**
- `ZOOM_START = 10, ZOOM_END = 21, API_ZOOM_FRAMES = 150, DIGITAL_ZOOM_MAX = 80`
- Creates dramatic descent from very high altitude to extreme detail

**Hybrid view with labels:**
- `MAP_TYPE = 'hybrid'` - Shows satellite imagery with street/place labels

**Faster zoom:**
- `ZOOM_CURVE = 1.5, DIGITAL_ZOOM_CURVE = 2` - More linear, steady zoom

**Extreme pixel zoom:**
- `DIGITAL_ZOOM_MAX = 100, DIGITAL_ZOOM_CURVE = 4` - Goes very deep into pixels

**Google Earth style:**
- `ZOOM_START = 8, ZOOM_END = 20, API_ZOOM_FRAMES = 100, MAX_FRAMES = 150`
- Classic "zoom to location" effect

**Zoom level reference:**
- **1-3:** World view
- **4-6:** Country view
- **7-10:** State/Region view
- **11-14:** City view
- **15-17:** Streets/Neighborhood view
- **18-20:** Building/Block view
- **21:** Maximum detail (street-level)

**How it works:**
1. **Phase 1 (Frames 1-120):** Uses Google Maps Static API to zoom from level 12 (city) to level 21 (street)
2. **Phase 2 (Frames 121-200):** Takes zoom 21 image, crops smaller areas from center, scales up with pixelation

**Visual effect:**
- Smooth zoom from satellite altitude → street level → pixel detail
- Creates cinematic "Google Earth" style zoom
- Perfect for establishing shots or dramatic reveals
- Final frames show pixelated satellite texture

---



## TWIXING VALUES —-> possible ideas to test

### effect 1
```javascript
// camera-05-combined.js
const FOV_START = 90, FOV_END = 30
const PITCH_AMPLITUDE = 40, PITCH_FREQUENCY = 6
const ROTATION_DEGREES = 1080
const HEADING_WAVE_AMP = 60, HEADING_WAVE_FREQ = 8
```

### effect 2
```javascript
// camera-01-static.js
const FOV = 70  // Cinematic
const PITCH = -15  // Slightly looking down
const HEADING_OFFSET = 0
```

### effect 3
```javascript
// camera-03-rotation.js
const FOV = 110  // Wide
const ROTATION_TYPE = 'oscillating'
const OSCILLATION_COUNT = 8
```

### effect 4
```javascript
// camera-04-pitch.js
const PITCH_TYPE = 'descent'
const PITCH_START = -90, PITCH_END = 0
const FOV = 90
```

---


### **Common Issues**

**Q: How do I test parameters without downloading images?**  
A: Use `--export-only` flag:
```bash
node camera-07-spiral.js --export-only
```
Takes < 1 second, no downloads and will update the html file to get a preview of camera movement.

**Q: Where do I change the parameters?**  
A: At the **top** of each `camera-XX-*.js` file in the `CONFIGURATION` section

**Q: I ran the full command and it's downloading - how do I stop it?**  
A: Press `Ctrl+C` in the terminal to cancel. Use `--export-only` flag next time.

**Q: Why don't my browser changes appear?**  
A: Make sure to:
1. Run: `node camera-07-spiral.js --export-only`
2. REFRESH browser (Cmd+R on Mac)
3. Check browser console for any errors (Cmd+Option+I)

**Q: No frames generated:**
- Check your `GOOGLE_API_KEY` environment variable is set
- Make sure `points.geojson` (or the file you are using for point locations) exists in the folder
- Try running in full mode without `--export-only`

**Q: Video looks jumpy:**
- Decrease `MIN_DISTANCE` (try 2 or 3 meters)
- Increase `MAX_FRAMES` (try 200 or 300)

**Q: Frames generated but ffmpeg video creation fails:**
- Make sure FFmpeg is installed: `brew install ffmpeg`
- Check the output directory name matches the ffmpeg command
- Example: `output_spiral/` directory needs `ffmpeg -i output_spiral/%05d.jpg`

**Q: Can I test multiple cameras at once?**  
A: Yes! Run each in a different terminal:
```bash
# Terminal 1
node camera-03-rotation.js --export-only

# Terminal 2  
node camera-07-spiral.js --export-only
```

**Q: Want to start over?**
```bash
rm -rf output_*  # Delete all output folders
```

### **The Quick Loop (Best Practice)**

1. **Edit** → 2. **Test** (`--export-only`) → 3. **Refresh** → **Repeat**

When happy:

4. **Export full** (downloads images) → 5. **FFmpeg** → 6. **Video**



---

## Quick Reference Table

| Effect | File | Key Parameters | Good For |
|--------|------|----------------|----------|
| Static | 01 | FOV, PITCH, HEADING_OFFSET | Documentation, tours |
| Zoom | 02 | FOV_START, FOV_END, ZOOM_CURVE | Focus, reveal |
| Rotation | 03 | ROTATION_DEGREES, ROTATION_TYPE | 360° view, panorama |
| Pitch | 04 | PITCH_TYPE, PITCH_AMPLITUDE | Scanning, descent |
| Combined | 05 | All of the above | Artistic, creative effects |
| Super Zoom | 06 | API_ZOOM_FRAMES, DIGITAL_ZOOM_MAX | Extreme zoom, pixel art |
| Satellite Zoom | 07 | ZOOM_START, ZOOM_END, DIGITAL_ZOOM_MAX | Space to ground, Google Earth style |

---

## Explore CONSOLE Google Street View (to detect fov, heading and pitch)

<img width="1351" height="958" alt="Screenshot 2025-11-17 at 12 28 54 AM" src="https://github.com/user-attachments/assets/24d265d7-4697-47ea-a4ed-4bd97fe69971" />

```bash
// PASTE THIS DIRECTLY INTO GOOGLE STREET VIEW CONSOLE
// Monitors URL changes as you move the camera

let watching = false;
let lastUrl = '';

window.watch = function() {
  if (watching) {
    console.log('Already watching');
    return;
  }
  watching = true;
  console.log('STREET VIEW MONITOR\nMove your camera around...\n');

  const interval = setInterval(() => {
    const url = window.location.href;
    
    // URL format: @lat,lon,zoom+a,height+y,heading+h,tilt+t
    // Example: @9.9054766,7.439502,3a,15y,212.5h,123.64t
    
    if (url !== lastUrl) {
      lastUrl = url;
      
      // Extract lat,lon,zoom,height,heading,tilt from URL
      const match = url.match(/@([\d.-]+),([\d.-]+),(\d+)a,(\d+)y,([\d.]+)h,([\d.]+)t/);
      
      if (match) {
        const lat = match[1];
        const lon = match[2];
        const zoom = match[3];
        const height = match[4];
        let heading = parseFloat(match[5]);
        let tilt = parseFloat(match[6]);
        
        // Normalize heading to 0-360
        heading = (heading % 360 + 360) % 360;
        
        // Convert tilt to pitch (-90 to +90)
        // tilt goes from 0 (looking down) to 180 (looking up) to 0 (looking down again)
        // pitch goes from -90 (straight down) to 0 (horizon) to +90 (straight up)
        let pitch = tilt - 90;
        
        // Calculate FOV from zoom using exponential relationship
        // Street View zoom: 1=120°, 2=60°, 3=40°, 4=30°, 5=24°, etc
        // Formula: FOV ≈ 120 / (2^(zoom-1))
        const fov = Math.max(10, Math.min(120, 120 / Math.pow(2, zoom - 1)));
        
        console.clear();
        console.log(' STREET VIEW CAMERA\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(` Heading: ${heading.toFixed(1)}°  (0-360)`);
        console.log(` Pitch:   ${pitch.toFixed(1)}°  (-90 to +90)`);
        console.log(`  FOV:     ${fov.toFixed(1)}°  (10-120)`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(` Lat/Lon: ${lat}, ${lon}`);
        console.log(` Zoom:    ${zoom}x`);
        console.log(` Height:  ${height}m`);
      }
    }
  }, 250);

  window.stop = function() {
    clearInterval(interval);
    watching = false;
    console.log(' Stopped watching');
  };
};

console.log(' Street View Monitor Ready!');
console.log('Type: watch()  to start');
console.log('Type: stop()   to stop');


```

## Assembling Multiple Videos

### assemble-videos.js**

Once you've created individual camera videos (static, zoom, rotation, etc.), you can combine them into a single video using `assemble-videos.js`. This tool offers multiple ways to connect your videos together with transitions or compare them side-by-side.

### **Important: Use `video/` prefix for all video files!**

All your videos are stored in the `video/` folder. When using `assemble-videos.js`, **always include the folder path**:

```bash
# CORRECT - run from tools/ folder, include video/ prefix
cd /tools
node assemble-videos.js --sidebyside video/static.mp4 video/rotation.mp4

# WRONG - missing video/ folder prefix
node assemble-videos.js --sidebyside static.mp4 rotation.mp4

# WRONG - running from inside video/ folder
cd video/
node assemble-videos.js --sidebyside static.mp4 rotation.mp4
```



### **Quick Start: Combine 2+ Videos**

#### **Method 1: Simple Concatenation**
```bash
node assemble-videos.js --simple video/video1.mp4 video/video2.mp4 video/video3.mp4
```


#### **Method 2: Fade Transition (Smooth)**
```bash
node assemble-videos.js --fade video/static.mp4 video/rotation.mp4 video/spiral.mp4
```


#### **Method 3: Slide Effect**
```bash
node assemble-videos.js --slideright video/static.mp4 video/rotation.mp4 video/spiral.mp4
```
- Clips slide in from different directions  
Available: `--slideright`, `--slideleft`, `--slidedown`, `--slideup`

#### **Method 4: Wipe Effect**
```bash
node assemble-videos.js --wipeleft video/static.mp4 video/rotation.mp4
```
**Dynamic** - Wipe transition between clips  
Available: `--wipeleft`, `--wiperight`

---

### **Side-by-Side & Stacked (Any Number of Videos!)**

#### **Compare 2 Videos Side-by-Side**
```bash
node assemble-videos.js --sidebyside video/static.mp4 video/rotation.mp4
```
Layout: 2 videos side-by-side  
Output: 1920×1080 (each video ~960×1080)

#### **Compare 3 Videos Side-by-Side**
```bash
node assemble-videos.js --sidebyside video/static.mp4 video/rotation.mp4 video/spiral.mp4
```
Layout: 3 videos in a row  
Output: 1920×1080 (each video ~640×1080)

#### **Compare 5 Videos (Grid Layout)**
```bash
node assemble-videos.js --sidebyside video/v1.mp4 video/v2.mp4 video/v3.mp4 video/v4.mp4 video/v5.mp4
```
Layout: 3 videos top row, 2 bottom (automatic grid)  
Output: 1920×1080 (each video optimally sized)

#### **Stack 2 Videos Vertically**
```bash
node assemble-videos.js --stacked video/static.mp4 video/rotation.mp4
```
Layout: Top video on top, bottom video below  
Output: 640×1080 (each video 640×540)

#### **Stack 4 Videos Vertically**
```bash
node assemble-videos.js --stacked video/v1.mp4 video/v2.mp4 video/v3.mp4 video/v4.mp4
```
Layout: Videos stacked 1, 2, 3, 4  
Output: 640×1080 (each video 640×270)

#### **Stack ANY Number of Videos**
```bash
node assemble-videos.js --stacked video/video1.mp4 video/video2.mp4 video/video3.mp4 video/video4.mp4 video/video5.mp4 video/video6.mp4
```
Works with 2, 5, 10, or as many as you want!

---


### **Customizing Output**

#### **Change Output Filename**
```bash
node assemble-videos.js --fade video/static.mp4 video/rotation.mp4 --output my_result.mp4
```

**What it does:**
- `--output FILENAME` specifies the name of the output video file
- The file will be saved in the current directory (usually `tools/`)
- Default filename (if not specified): `assembled.mp4`



#### **Change Clip Duration** (for transitions)
```bash
node assemble-videos.js --fade video/static.mp4 video/rotation.mp4 --duration 5
```
Default: 10 seconds  
**Note:** The tool auto-detects clip duration, so usually you don't need this

#### **Change Transition Duration**
```bash
node assemble-videos.js --fade video/static.mp4 video/rotation.mp4 --transition 2
```
Default: 1 second  
Useful for longer/shorter fade effects

#### **Preview FFmpeg Command** (don't execute)
```bash
node assemble-videos.js --fade video/static.mp4 video/rotation.mp4 --preview
```
Shows the FFmpeg command without running it - useful for debugging

---



### **Full Workflow: Create & Combine**

```bash
# 1  Set API key (once per terminal session)
export GOOGLE_API_KEY="xxx"

# 2  Generate individual camera videos
node camera-01-static.js
node camera-02-zoom.js
node camera-03-rotation.js

# 3 Create video files from frames using ffmpeg
ffmpeg -framerate 30 -i output_static/%05d.jpg -c:v libx264 -pix_fmt yuv420p -y video/static.mp4
ffmpeg -framerate 30 -i output_zoom/%05d.jpg -c:v libx264 -pix_fmt yuv420p -y video/zoom.mp4
ffmpeg -framerate 30 -i output_rotation/%05d.jpg -c:v libx264 -pix_fmt yuv420p -y video/rotation.mp4

# 4 Assemble them together with transitions
node assemble-videos.js --fade video/static.mp4 video/zoom.mp4 video/rotation.mp4 --output final_showcase.mp4

# 5 Or compare side-by-side
node assemble-videos.js --sidebyside video/static.mp4 video/zoom.mp4 video/rotation.mp4 --output comparison.mp4

# 6  Watch your result!
open final_showcase.mp4  # macOS
# or
vlc final_showcase.mp4   # Any system
```

---
