const fs = require('fs');
const path = require('path');
const https = require('https');
const sharp = require('sharp');

// ====================================================================
// 🛰️ SATELLITE SUPER ZOOM CONFIGURATION - TWEAK THESE PARAMETERS
// ====================================================================

// Input/Output
const GEOJSON_FILE = path.join(__dirname, '..', 'points.geojson');
const OUTPUT_FOLDER = 'output_satellite_superzoom';
const API_KEY = process.env.GOOGLE_API_KEY || 'AIzaSyCVO2iup2fhlaimSsBMrozoBWKW19pjPmw';

// Extract video name from this script's filename
const SCRIPT_NAME = path.basename(__filename, '.js');
const VIDEO_NAME = SCRIPT_NAME.split('-').slice(2).join('-');
const OUTPUT_VIDEO = `video/${VIDEO_NAME}.mp4`;

// Image settings
const IMAGE_WIDTH = 640;                // Image width
const IMAGE_HEIGHT = 300;               // Image height (use 640x480, 640x360, 1024x576, etc.)
const SCALE = 2;                        // API scale (1 or 2) - 2 gives higher quality

// Zoom settings
const ZOOM_START = 12;                  // Wide view (city/region level)
const ZOOM_END = 21;                    // Maximum satellite zoom (building/street level)
const MAP_TYPE = 'satellite';           // 'satellite' or 'hybrid' (satellite + labels)

// Frame distribution
const MAX_FRAMES = 200;                 // Total number of frames
const API_ZOOM_FRAMES = 120;            // First N frames use API zoom (zoom 12 → 21)
const DIGITAL_ZOOM_MAX = 50;            // Maximum digital zoom after max API zoom (1x → 50x)

// Advanced settings
const ZOOM_CURVE = 0.5;                 // Exponential curve for API zoom
const DIGITAL_ZOOM_CURVE = 3.0;         // Exponential curve for digital zoom
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

// ====================================================================
// Main Execution
// ====================================================================

(async () => {
    console.log('\n🛰️  SATELLITE SUPER ZOOM (API + Digital)\n');
    console.log('Configuration:');
    console.log(`  Phase 1: API Zoom`);
    console.log(`    - Zoom levels: ${ZOOM_START} → ${ZOOM_END} (curve: ${ZOOM_CURVE})`);
    console.log(`    - Map type: ${MAP_TYPE}`);
    console.log(`    - Frames: 1-${API_ZOOM_FRAMES}`);
    console.log(`  Phase 2: Digital Zoom`);
    console.log(`    - Zoom: 1x → ${DIGITAL_ZOOM_MAX}x (curve: ${DIGITAL_ZOOM_CURVE})`);
    console.log(`    - Frames: ${API_ZOOM_FRAMES + 1}-${MAX_FRAMES}`);
    console.log(`  Total Frames: ${MAX_FRAMES}\n`);

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

    // Process each frame
    for (let i = 0; i < locations.length; i++) {
        const location = locations[i];
        const progress = i / (locations.length - 1);
        
        const filename = path.join(OUTPUT_FOLDER, `${(i + 1).toString().padStart(5, '0')}.jpg`);

        // ============================================================
        // PHASE 1: API ZOOM (zoom level 12 → 21)
        // ============================================================
        if (i < API_ZOOM_FRAMES) {
            const apiProgress = i / (API_ZOOM_FRAMES - 1);
            const zoom = ZOOM_START + (ZOOM_END - ZOOM_START) * Math.pow(apiProgress, ZOOM_CURVE);
            const clampedZoom = Math.max(0, Math.min(21, Math.round(zoom)));

            const params = new URLSearchParams({
                center: `${location.lat},${location.lon}`,
                zoom: String(clampedZoom),
                size: `${IMAGE_WIDTH}x${IMAGE_HEIGHT}`,
                scale: String(SCALE),
                maptype: MAP_TYPE,
                key: API_KEY
            });

            const url = `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`;
            const tempPath = path.join(OUTPUT_FOLDER, `temp_${i}.png`);
            
            try {
                // Download as PNG (Google Maps returns PNG)
                await downloadImage(url, tempPath);
                await sleep(DELAY_MS);
                
                // Convert to JPG
                await sharp(tempPath)
                    .jpeg({ quality: 90 })
                    .toFile(filename);
                
                fs.unlinkSync(tempPath);
                
                const zoomPercent = Math.round(apiProgress * 100);
                console.log(`✓ Frame ${i + 1}/${locations.length} - API Zoom:${clampedZoom} (${zoomPercent}%)`);
            } catch (err) {
                console.error(`✗ Frame ${i + 1}/${locations.length} - Failed: ${err.message}`);
                if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
            }
        }
        // ============================================================
        // PHASE 2: DIGITAL ZOOM (1x → 50x into pixels)
        // ============================================================
        else {
            const tempImagePath = path.join(OUTPUT_FOLDER, `temp_dl_${i}.png`);
            
            // Download base image at maximum zoom
            const params = new URLSearchParams({
                center: `${location.lat},${location.lon}`,
                zoom: String(ZOOM_END),
                size: `${IMAGE_WIDTH}x${IMAGE_HEIGHT}`,
                scale: String(SCALE),
                maptype: MAP_TYPE,
                key: API_KEY
            });

            const url = `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`;
            
            try {
                await downloadImage(url, tempImagePath);
                await sleep(DELAY_MS);

                // Calculate digital zoom level
                const digitalProgress = (i - API_ZOOM_FRAMES) / (locations.length - API_ZOOM_FRAMES - 1);
                const zoomLevel = 1 + (DIGITAL_ZOOM_MAX - 1) * Math.pow(digitalProgress, DIGITAL_ZOOM_CURVE);
                
                // The actual image size with scale
                const actualWidth = IMAGE_WIDTH * SCALE;
                const actualHeight = IMAGE_HEIGHT * SCALE;
                
                // Calculate crop area (center of image)
                const cropWidth = Math.max(1, Math.round(actualWidth / zoomLevel));
                const cropHeight = Math.max(1, Math.round(actualHeight / zoomLevel));
                const left = Math.round((actualWidth - cropWidth) / 2);
                const top = Math.round((actualHeight - cropHeight) / 2);

                // Crop and scale up (pixelated zoom)
                await sharp(tempImagePath)
                    .extract({ left, top, width: cropWidth, height: cropHeight })
                    .resize(actualWidth, actualHeight, { kernel: 'nearest' })  // 'nearest' for pixelated effect
                    .jpeg({ quality: 90 })
                    .toFile(filename);

                console.log(`✓ Frame ${i + 1}/${locations.length} - Digital ${zoomLevel.toFixed(1)}x (crop: ${cropWidth}×${cropHeight}px)`);

                // Clean up temp file
                fs.unlinkSync(tempImagePath);
            } catch (err) {
                console.error(`✗ Frame ${i + 1}/${locations.length} - Failed: ${err.message}`);
                if (fs.existsSync(tempImagePath)) fs.unlinkSync(tempImagePath);
            }
        }
    }

    console.log(`\n✅ Done! Saved ${locations.length} frames to ${OUTPUT_FOLDER}/\n`);
    console.log('Create video:');
    console.log(`ffmpeg -framerate 30 -i ${OUTPUT_FOLDER}/%05d.jpg -c:v libx264 -pix_fmt yuv420p -y ${OUTPUT_VIDEO}\n`);
})();
