# DAE_digital-native-workshop

# 🎬 Street View Camera Experiments

Five simple JavaScript experiments for students to learn camera movement effects in Google Street View videos.

## 📚 How to Use

### 1. Choose an Experiment
Each file focuses on one camera effect:
- **experiment-01-static.js** - Basic forward-facing view
- **experiment-02-zoom.js** - Progressive zoom effect
- **experiment-03-rotation.js** - Rotating camera
- **experiment-04-pitch.js** - Looking up/down
- **experiment-05-combined.js** - Multiple effects combined
- **experiment-06-superzoom.js** - Extreme zoom into pixel detail (Street View)
- **experiment-07-satellite-superzoom.js** - Extreme zoom from space to ground (Satellite)

### 2. Edit Parameters
Open any experiment file and **edit the values at the top** (in the CONFIGURATION section):

```javascript
// ============================================
// 🎬 CONFIGURATION - TWEAK THESE PARAMETERS!
// ============================================
const FOV = 90;          // Change this!
const PITCH = 0;         // Change this!
const HEADING_OFFSET = 0; // Change this!
```

### 3. Run the Experiment
```bash
export GOOGLE_API_KEY="AIzaSyCVO2iup2fhlaimSsBMrozoBWKW19pjPmw"
node experiment-01-static.js
```

### 4. Create Video
```bash
ffmpeg -framerate 30 -i output_folder/%05d.jpg -c:v libx264 -pix_fmt yuv420p -y my_video.mp4
```

---

## 🎯 Experiment 1: Static Camera

**File:** `experiment-01-static.js`

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

## 🔍 Experiment 2: Progressive Zoom

**File:** `experiment-02-zoom.js`

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

## 🌀 Experiment 3: Rotation

**File:** `experiment-03-rotation.js`

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

## ⬆️⬇️ Experiment 4: Pitch Movement

**File:** `experiment-04-pitch.js`

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

## 🔬 Experiment 6: Super Zoom (API + Digital)

**File:** `experiment-06-superzoom.js`

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

## 🛰️ Experiment 7: Satellite Super Zoom

**File:** `experiment-07-satellite-superzoom.js`

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

## 🌊 Experiment 5: Combined Effects

**File:** `experiment-05-combined.js`

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

## 📐 Parameter Reference

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

## 💡 Creative Ideas

### Music Video Effect
```javascript
// experiment-05-combined.js
const FOV_START = 90, FOV_END = 30
const PITCH_AMPLITUDE = 40, PITCH_FREQUENCY = 6
const ROTATION_DEGREES = 1080
const HEADING_WAVE_AMP = 60, HEADING_WAVE_FREQ = 8
```

### Documentary Style
```javascript
// experiment-01-static.js
const FOV = 70  // Cinematic
const PITCH = -15  // Slightly looking down
const HEADING_OFFSET = 0
```

### Action Camera
```javascript
// experiment-03-rotation.js
const FOV = 110  // Wide
const ROTATION_TYPE = 'oscillating'
const OSCILLATION_COUNT = 8
```

### Establishing Shot
```javascript
// experiment-04-pitch.js
const PITCH_TYPE = 'descent'
const PITCH_START = -90, PITCH_END = 0
const FOV = 90
```

---

## 🎓 Learning Exercises

### Exercise 1: Find Your Style
Run all 5 experiments with default settings. Which effect do you like best?

### Exercise 2: Modify Values
Pick one experiment. Change ONE parameter at a time and observe the effect.

### Exercise 3: Extreme Values
Try extreme values:
- `FOV = 1` vs `FOV = 120`
- `PITCH = -90` vs `PITCH = 90`
- `ROTATION_DEGREES = 3600` (10 spins!)

### Exercise 4: Create a Story
Use different experiments for different parts of your route to tell a visual story.

### Exercise 5: Combine & Customize
Copy experiment-05 and create your own unique combination!

---

## 🐛 Troubleshooting

**No frames generated:**
- Check your `GOOGLE_API_KEY` environment variable
- Make sure `points.geojson` exists

**Video looks jumpy:**
- Decrease `MIN_DISTANCE` (try 2 or 3 meters)
- Increase `MAX_FRAMES`

**Frames generated but video creation fails:**
- Make sure FFmpeg is installed: `brew install ffmpeg`
- Check the output directory name matches

**Want to start over:**
```bash
rm -rf output_*  # Delete all output folders
```

---

## 📊 Quick Reference Table

| Effect | File | Key Parameters | Good For |
|--------|------|----------------|----------|
| Static | 01 | FOV, PITCH, HEADING_OFFSET | Documentation, tours |
| Zoom | 02 | FOV_START, FOV_END, ZOOM_CURVE | Focus, reveal |
| Rotation | 03 | ROTATION_DEGREES, ROTATION_TYPE | 360° view, panorama |
| Pitch | 04 | PITCH_TYPE, PITCH_AMPLITUDE | Scanning, descent |
| Combined | 05 | All of the above | Artistic, experimental |
| Super Zoom | 06 | API_ZOOM_FRAMES, DIGITAL_ZOOM_MAX | Extreme zoom, pixel art |
| Satellite Zoom | 07 | ZOOM_START, ZOOM_END, DIGITAL_ZOOM_MAX | Space to ground, Google Earth style |

---

## 🚀 Advanced: Create Your Own

Want to create your own experiment? Copy any file and:

1. Change the `OUTPUT_DIR` name
2. Modify the parameter calculation in the main loop
3. Add your own mathematical functions!

Example - Add randomness:
```javascript
const fov = 60 + Math.random() * 60;  // Random FOV 60-120°
const pitch = -30 + Math.random() * 60;  // Random pitch -30 to +30°
```

Have fun experimenting! 🎥✨
