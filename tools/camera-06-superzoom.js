const fs = require('fs');
const path = require('path');
const https = require('https');
const sharp = require('sharp');

// ====================================================================
// 🔬 SUPER ZOOM CONFIGURATION - TWEAK THESE PARAMETERS
// ====================================================================

// Input/Output
const GEOJSON_FILE = '../points.geojson';
const OUTPUT_FOLDER = 'output_superzoom';
const API_KEY = process.env.GOOGLE_API_KEY || 'AIzaSyCVO2iup2fhlaimSsBMrozoBWKW19pjPmw';

// Extract video name from this script's filename
const SCRIPT_NAME = path.basename(__filename, '.js');
const VIDEO_NAME = SCRIPT_NAME.split('-').slice(2).join('-');
const OUTPUT_VIDEO = `video/${VIDEO_NAME}.mp4`;

// Image settings
const IMAGE_SIZE = '640x300';           // Ultra-wide format

// Zoom settings
const FOV_START = 120;                  // Wide angle (zoomed out)
const FOV_END = 1;                      // Minimum FOV (maximum API zoom)
const PITCH = 0;                        // Look straight ahead
const HEADING_OFFSET = 0;               // Additional heading rotation

// Frame distribution
const MAX_FRAMES = 200;                 // Total number of frames
const API_ZOOM_FRAMES = 100;            // First N frames use API zoom (FOV 120° → 1°)
const DIGITAL_ZOOM_MAX = 100;           // Maximum digital zoom after FOV 1° (1x → 100x)

// Advanced settings
const ZOOM_CURVE = 3.5;                 // Exponential curve for API zoom (higher = faster at end)
const DIGITAL_ZOOM_CURVE = 2.5;         // Exponential curve for digital zoom
const MIN_DISTANCE = 5;                 // Minimum meters between frames
const DELAY_MS = 100;                   // Delay between API requests (ms)

// ====================================================================
// Helper Functions
// ====================================================================

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
    const toRad = (deg) => deg * Math.PI / 180;
    const toDeg = (rad) => rad * 180 / Math.PI;
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const λ1 = toRad(lon1);
    const λ2 = toRad(lon2);
    const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
    return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

function downloadImage(url, outputPath) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                response.resume();
                reject(new Error(`HTTP ${response.statusCode}`));
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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// 📤 EXPORT PARAMETERS (used by both modes)
// ============================================

function exportParameters() {
    const params = {
        type: 'superzoom',
        FOV_START: FOV_START,
        FOV_END: FOV_END,
        ZOOM_CURVE: ZOOM_CURVE,
        PITCH: PITCH,
        HEADING_OFFSET: HEADING_OFFSET,
        API_ZOOM_FRAMES: API_ZOOM_FRAMES,
        DIGITAL_ZOOM_MAX: DIGITAL_ZOOM_MAX,
        DIGITAL_ZOOM_CURVE: DIGITAL_ZOOM_CURVE,
        MAX_FRAMES: MAX_FRAMES
    };
    fs.writeFileSync('camera-params-06.js', `window.CAMERA_06_PARAMS = ${JSON.stringify(params, null, 2)};`);
}

// ============================================
// 🎥 MAIN EXECUTION
// ============================================

(async () => {
    // Check if --export-only flag is passed
    const exportOnly = process.argv.includes('--export-only');
    
    console.log('\n🔬 SUPER ZOOM (API + Digital)\n');
    console.log('Configuration:');
    console.log(`  Phase 1: API Zoom`);
    console.log(`    - FOV: ${FOV_START}° → ${FOV_END}° (curve: ${ZOOM_CURVE})`);
    console.log(`    - Frames: 1-${API_ZOOM_FRAMES}`);
    console.log(`  Phase 2: Digital Zoom`);
    console.log(`    - Zoom: 1x → ${DIGITAL_ZOOM_MAX}x (curve: ${DIGITAL_ZOOM_CURVE})`);
    console.log(`    - Frames: ${API_ZOOM_FRAMES + 1}-${MAX_FRAMES}`);
    console.log(`  Pitch: ${PITCH}° (constant)`);
    console.log(`  Heading: Route direction + ${HEADING_OFFSET}°`);
    console.log(`  Total Frames: ${MAX_FRAMES}\n`);
    
    // If export-only flag is set, just export and exit
    if (exportOnly) {
        exportParameters();
        console.log(`✅ Exported parameters to camera-params-06.js`);
        console.log(`\n🌐 Refresh your browser to see changes in the visualizer!\n`);
        process.exit(0);
    }

    // Create output folder
    if (!fs.existsSync(OUTPUT_FOLDER)) {
        fs.mkdirSync(OUTPUT_FOLDER, { recursive: true });
    }

    // Read GeoJSON
    const geojsonData = JSON.parse(fs.readFileSync(GEOJSON_FILE, 'utf8'));
    const allPoints = geojsonData.features.map(f => ({
        lat: f.geometry.coordinates[1],
        lon: f.geometry.coordinates[0]
    }));

    // Filter points by distance
    const filteredPoints = [];
    let lastPoint = null;
    for (const point of allPoints) {
        if (!lastPoint || getDistance(lastPoint.lat, lastPoint.lon, point.lat, point.lon) >= MIN_DISTANCE) {
            filteredPoints.push(point);
            lastPoint = point;
        }
    }

    // Limit to MAX_FRAMES
    const locations = filteredPoints.slice(0, MAX_FRAMES);
    console.log(`Processing ${locations.length} locations\n`);

    const [imgWidth, imgHeight] = IMAGE_SIZE.split('x').map(Number);

    // Process each frame
    for (let i = 0; i < locations.length; i++) {
        const location = locations[i];
        const progress = i / (locations.length - 1);
        
        // Calculate heading to next point
        let heading = HEADING_OFFSET;
        if (i < locations.length - 1) {
            heading += calculateBearing(location.lat, location.lon, locations[i + 1].lat, locations[i + 1].lon);
        } else if (i > 0) {
            heading += calculateBearing(locations[i - 1].lat, locations[i - 1].lon, location.lat, location.lon);
        }

        const filename = path.join(OUTPUT_FOLDER, `${(i + 1).toString().padStart(5, '0')}.jpg`);

        // ============================================================
        // PHASE 1: API ZOOM (FOV 120° → 1°)
        // ============================================================
        if (i < API_ZOOM_FRAMES) {
            const apiProgress = i / (API_ZOOM_FRAMES - 1);
            const fov = FOV_START - (FOV_START - FOV_END) * Math.pow(apiProgress, ZOOM_CURVE);
            const clampedFov = Math.max(1, Math.min(120, Math.round(fov)));

            const params = new URLSearchParams({
                size: IMAGE_SIZE,
                location: `${location.lat},${location.lon}`,
                fov: String(clampedFov),
                pitch: String(PITCH),
                heading: String(Math.round(heading)),
                key: API_KEY
            });

            const url = `https://maps.googleapis.com/maps/api/streetview?${params.toString()}`;
            
            try {
                await downloadImage(url, filename);
                const zoomPercent = Math.round(apiProgress * 100);
                console.log(`✓ Frame ${i + 1}/${locations.length} - API FOV:${clampedFov}° (${zoomPercent}% zoom)`);
            } catch (err) {
                console.error(`✗ Frame ${i + 1}/${locations.length} - Failed: ${err.message}`);
            }

            await sleep(DELAY_MS);
        }
        // ============================================================
        // PHASE 2: DIGITAL ZOOM (1x → 100x into pixels)
        // ============================================================
        else {
            const tempImagePath = path.join(OUTPUT_FOLDER, `temp_${i}.jpg`);
            
            // Download base image at FOV 1°
            const params = new URLSearchParams({
                size: IMAGE_SIZE,
                location: `${location.lat},${location.lon}`,
                fov: '1',
                pitch: String(PITCH),
                heading: String(Math.round(heading)),
                key: API_KEY
            });

            const url = `https://maps.googleapis.com/maps/api/streetview?${params.toString()}`;
            
            try {
                await downloadImage(url, tempImagePath);
                await sleep(DELAY_MS);

                // Calculate digital zoom level
                const digitalProgress = (i - API_ZOOM_FRAMES) / (locations.length - API_ZOOM_FRAMES - 1);
                const zoomLevel = 1 + (DIGITAL_ZOOM_MAX - 1) * Math.pow(digitalProgress, DIGITAL_ZOOM_CURVE);
                
                // Calculate crop area (center of image)
                const cropWidth = Math.max(1, Math.round(imgWidth / zoomLevel));
                const cropHeight = Math.max(1, Math.round(imgHeight / zoomLevel));
                const left = Math.round((imgWidth - cropWidth) / 2);
                const top = Math.round((imgHeight - cropHeight) / 2);

                // Crop and scale up (pixelated zoom)
                await sharp(tempImagePath)
                    .extract({ left, top, width: cropWidth, height: cropHeight })
                    .resize(imgWidth, imgHeight, { kernel: 'nearest' })  // 'nearest' for pixelated effect
                    .jpeg({ quality: 90 })
                    .toFile(filename);

                console.log(`✓ Frame ${i + 1}/${locations.length} - Digital ${zoomLevel.toFixed(1)}x (crop: ${cropWidth}×${cropHeight}px)`);

                // Clean up temp file
                fs.unlinkSync(tempImagePath);
            } catch (err) {
                console.error(`✗ Frame ${i + 1}/${locations.length} - Failed: ${err.message}`);
            }
        }
    }

    console.log(`\n✅ Done! Saved ${locations.length} frames to ${OUTPUT_FOLDER}/\n`);
    console.log('Create video:');
    console.log(`ffmpeg -framerate 30 -i ${OUTPUT_FOLDER}/%05d.jpg -c:v libx264 -pix_fmt yuv420p -y ${OUTPUT_VIDEO}\n`);
    
    // Export parameters for HTML visualizer
    exportParameters();
    console.log(`📤 Exported parameters to camera-params-06.js\n`);
})();
