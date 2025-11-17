const https = require('https');
const fs = require('fs');
const path = require('path');

// ============================================
// 🎬 CONFIGURATION - TWEAK THESE PARAMETERS!
// ============================================

const API_KEY = process.env.GOOGLE_API_KEY || 'AIzaSyCVO2iup2fhlaimSsBMrozoBWKW19pjPmw';
const GEOJSON_FILE = '../points.geojson';
const OUTPUT_DIR = 'output_pitch';

// Extract video name from this script's filename
const SCRIPT_NAME = path.basename(__filename, '.js');
const VIDEO_NAME = SCRIPT_NAME.split('-').slice(2).join('-');
const OUTPUT_VIDEO = `video/${VIDEO_NAME}.mp4`;

// Image settings
const IMAGE_SIZE = '640x300';

// Route settings
const MIN_DISTANCE = 5;
const MAX_FRAMES = 200;
const DELAY_MS = 100;

// Camera settings - PITCH MOVEMENT
const FOV = 90;                    // Constant FOV
const PITCH_TYPE = 'sine';         // 'sine', 'linear', 'descent', or 'ascent'
const PITCH_AMPLITUDE = 45;        // Max angle up/down from horizon
const PITCH_FREQUENCY = 4;         // How many oscillation cycles (for sine)
const PITCH_START = -90;           // Starting pitch (for linear/descent/ascent)
const PITCH_END = 0;               // Ending pitch (for linear/descent/ascent)
const HEADING_OFFSET = 0;          // Offset from route direction

// ============================================
// 🔧 HELPER FUNCTIONS
// ============================================

function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function calculateBearing(lat1, lon1, lat2, lon2) {
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const y = Math.sin(dLon) * Math.cos(lat2 * Math.PI / 180);
    const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
              Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLon);
    const bearing = Math.atan2(y, x) * 180 / Math.PI;
    return (bearing + 360) % 360;
}

function downloadImage(url, outputPath) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed: ${response.statusCode}`));
                return;
            }
            const fileStream = fs.createWriteStream(outputPath);
            response.pipe(fileStream);
            fileStream.on('finish', () => {
                fileStream.close();
                resolve();
            });
            fileStream.on('error', reject);
        }).on('error', reject);
    });
}

// ============================================
// 📤 EXPORT PARAMETERS (used by both modes)
// ============================================

function exportParameters() {
    const params = {
        type: 'pitch',
        FOV: FOV,
        PITCH_TYPE: PITCH_TYPE,
        PITCH_AMPLITUDE: PITCH_AMPLITUDE,
        PITCH_FREQUENCY: PITCH_FREQUENCY,
        PITCH_START: PITCH_START,
        PITCH_END: PITCH_END,
        HEADING_OFFSET: HEADING_OFFSET,
        MAX_FRAMES: MAX_FRAMES
    };
    fs.writeFileSync('camera-params-04.js', `window.CAMERA_04_PARAMS = ${JSON.stringify(params, null, 2)};`);
}

// ============================================
// 🎥 MAIN EXECUTION
// ============================================

async function main() {
    // Check if --export-only flag is passed
    const exportOnly = process.argv.includes('--export-only');
    
    console.log(`\n⬆️⬇️ PITCH MOVEMENT\n`);
    console.log(`Configuration:`);
    console.log(`  FOV: ${FOV}° (constant)`);
    console.log(`  Pitch: ${PITCH_TYPE} (amplitude: ±${PITCH_AMPLITUDE}°)`);
    console.log(`  Heading: Route direction + ${HEADING_OFFSET}°`);
    console.log(`  Frames: ${MAX_FRAMES}`);
    console.log(`  Distance: ${MIN_DISTANCE}m between frames\n`);
    
    // If export-only flag is set, just export and exit
    if (exportOnly) {
        exportParameters();
        console.log(`✅ Exported parameters to camera-params-04.js`);
        console.log(`\n🌐 Refresh your browser to see changes in the visualizer!\n`);
        process.exit(0);
    }
    console.log(`  Pitch Type: ${PITCH_TYPE}`);
    if (PITCH_TYPE === 'sine') {
        console.log(`  Pitch: ±${PITCH_AMPLITUDE}° oscillation (${PITCH_FREQUENCY} cycles)`);
    } else {
        console.log(`  Pitch: ${PITCH_START}° → ${PITCH_END}°`);
    }
    console.log(`  Heading: Route direction + ${HEADING_OFFSET}°`);
    console.log(`  Frames: ${MAX_FRAMES}\n`);

    const geojson = JSON.parse(fs.readFileSync(GEOJSON_FILE, 'utf-8'));
    const allPoints = geojson.features.map(f => f.geometry.coordinates);
    
    const locations = [allPoints[0]];
    let lastPoint = allPoints[0];
    
    for (let i = 1; i < allPoints.length && locations.length < MAX_FRAMES; i++) {
        const current = allPoints[i];
        const distance = getDistance(lastPoint[1], lastPoint[0], current[1], current[0]);
        if (distance >= MIN_DISTANCE) {
            locations.push(current);
            lastPoint = current;
        }
    }
    
    console.log(`Processing ${locations.length} locations\n`);
    
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    
    for (let i = 0; i < locations.length; i++) {
        const [lon, lat] = locations[i];
        const progress = i / (locations.length - 1);
        
        // Calculate pitch based on type
        let pitch = 0;
        if (PITCH_TYPE === 'sine') {
            pitch = PITCH_AMPLITUDE * Math.sin(progress * Math.PI * PITCH_FREQUENCY);
        } else if (PITCH_TYPE === 'linear') {
            pitch = PITCH_START + (PITCH_END - PITCH_START) * progress;
        } else if (PITCH_TYPE === 'descent') {
            // Smooth descent with easing
            const eased = 0.5 - 0.5 * Math.cos(progress * Math.PI);
            pitch = PITCH_START + (PITCH_END - PITCH_START) * eased;
        } else if (PITCH_TYPE === 'ascent') {
            // Smooth ascent with easing
            const eased = 0.5 - 0.5 * Math.cos(progress * Math.PI);
            pitch = PITCH_END + (PITCH_START - PITCH_END) * (1 - eased);
        }
        
        // Clamp pitch to valid range
        pitch = Math.max(-90, Math.min(90, pitch));
        
        let heading = HEADING_OFFSET;
        if (i < locations.length - 1) {
            const [nextLon, nextLat] = locations[i + 1];
            heading = calculateBearing(lat, lon, nextLat, nextLon) + HEADING_OFFSET;
        }
        
        const url = `https://maps.googleapis.com/maps/api/streetview?` +
            `size=${IMAGE_SIZE}` +
            `&location=${lat},${lon}` +
            `&fov=${FOV}` +
            `&pitch=${Math.round(pitch)}` +
            `&heading=${Math.round(heading)}` +
            `&key=${API_KEY}`;
        
        const outputPath = path.join(OUTPUT_DIR, `${String(i + 1).padStart(5, '0')}.jpg`);
        
        try {
            await downloadImage(url, outputPath);
            const pitchDesc = pitch < -30 ? 'down' : pitch > 30 ? 'up' : 'horizon';
            console.log(`✓ Frame ${i + 1}/${locations.length} - Pitch:${Math.round(pitch)}° (${pitchDesc})`);
            await new Promise(resolve => setTimeout(resolve, DELAY_MS));
        } catch (err) {
            console.error(`✗ Frame ${i + 1} failed:`, err.message);
        }
    }
    
    console.log(`\n✅ Done! Saved ${locations.length} frames to ${OUTPUT_DIR}/`);
    console.log(`\nCreate video:`);
    console.log(`ffmpeg -framerate 30 -i ${OUTPUT_DIR}/%05d.jpg -c:v libx264 -pix_fmt yuv420p -y ${OUTPUT_VIDEO}`);
    
    // Export parameters for HTML visualizer
    exportParameters();
    console.log(`\n📤 Exported parameters to camera-params-04.js`);
}

main().catch(console.error);
