const https = require('https');
const fs = require('fs');
const path = require('path');

// ============================================
// 🎬 CONFIGURATION - TWEAK THESE PARAMETERS!
// ============================================

const API_KEY = process.env.GOOGLE_API_KEY || 'AIzaSyCVO2iup2fhlaimSsBMrozoBWKW19pjPmw';
const GEOJSON_FILE = '../points.geojson';  // Change to 'points.geojson' for other routes
const OUTPUT_DIR = 'output_static';

// Extract video name from this script's filename (camera-01-STATIC -> static)
const SCRIPT_NAME = path.basename(__filename, '.js');  // e.g., 'camera-01-static'
const VIDEO_NAME = SCRIPT_NAME.split('-').slice(2).join('-');  // e.g., 'static'
const OUTPUT_VIDEO = `video/${VIDEO_NAME}.mp4`;

// Image settings
const IMAGE_SIZE = '640x300';  // Width x Height

// Route settings
const MIN_DISTANCE = 5;        // Minimum meters between frames
const MAX_FRAMES = 200;        // Maximum number of frames to generate
const DELAY_MS = 100;          // Delay between API requests (milliseconds)

// Camera settings (constant throughout)
const FOV = 90;                // Field of View: 1° (zoomed) to 120° (wide)
const PITCH = 0;               // Pitch: -90° (down) to +90° (up), 0° = horizon
const HEADING_OFFSET = 0;      // Offset from route direction in degrees

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
        type: 'static',
        FOV: FOV,
        PITCH: PITCH,
        HEADING_OFFSET: HEADING_OFFSET,
        MAX_FRAMES: MAX_FRAMES
    };
    fs.writeFileSync('camera-params-01.js', `window.CAMERA_01_PARAMS = ${JSON.stringify(params, null, 2)};`);
}

// ============================================
// 🎥 MAIN EXECUTION
// ============================================

async function main() {
    // Check if --export-only flag is passed
    const exportOnly = process.argv.includes('--export-only');
    
    console.log(`\n📷 STATIC CAMERA - Forward Facing View\n`);
    console.log(`Configuration:`);
    console.log(`  FOV: ${FOV}°`);
    console.log(`  Pitch: ${PITCH}°`);
    console.log(`  Heading: Route direction + ${HEADING_OFFSET}°`);
    console.log(`  Frames: ${MAX_FRAMES}`);
    console.log(`  Distance: ${MIN_DISTANCE}m between frames\n`);
    
    // If export-only flag is set, just export and exit
    if (exportOnly) {
        exportParameters();
        console.log(`✅ Exported parameters to camera-params-01.js`);
        console.log(`\n🌐 Refresh your browser to see changes in the visualizer!\n`);
        process.exit(0);
    }

    // Read GeoJSON
    const geojson = JSON.parse(fs.readFileSync(GEOJSON_FILE, 'utf-8'));
    const allPoints = geojson.features.map(f => f.geometry.coordinates);
    
    // Filter by distance
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
    
    console.log(`Total points: ${allPoints.length}`);
    console.log(`Filtered points: ${locations.length}\n`);
    
    // Create output directory
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    
    // Generate frames
    for (let i = 0; i < locations.length; i++) {
        const [lon, lat] = locations[i];
        
        // Calculate heading based on route direction
        let heading = HEADING_OFFSET;
        if (i < locations.length - 1) {
            const [nextLon, nextLat] = locations[i + 1];
            heading = calculateBearing(lat, lon, nextLat, nextLon) + HEADING_OFFSET;
        }
        
        const url = `https://maps.googleapis.com/maps/api/streetview?` +
            `size=${IMAGE_SIZE}` +
            `&location=${lat},${lon}` +
            `&fov=${FOV}` +
            `&pitch=${PITCH}` +
            `&heading=${heading}` +
            `&key=${API_KEY}`;
        
        const outputPath = path.join(OUTPUT_DIR, `${String(i + 1).padStart(5, '0')}.jpg`);
        
        try {
            await downloadImage(url, outputPath);
            console.log(`✓ Frame ${i + 1}/${locations.length} - FOV:${FOV}° pitch:${PITCH}° heading:${Math.round(heading)}°`);
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
    console.log(`\n📤 Exported parameters to camera-params-01.js`);
}

main().catch(console.error);
