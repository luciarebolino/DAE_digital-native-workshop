#!/usr/bin/env node

/**
 * 🎬 VIDEO ASSEMBLY TOOL
 * 
 * Easy options to combine multiple Street View videos
 * with different transitions and effects!
 * 
 * Usage:
 *   node assemble-videos.js --help
 *   node assemble-videos.js --simple video1.mp4 video2.mp4 video3.mp4
 *   node assemble-videos.js --fade video1.mp4 video2.mp4
 *   node assemble-videos.js --side-by-side video1.mp4 video2.mp4
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ============================================
// 🎨 ASSEMBLY METHODS
// ============================================

const METHODS = {
    simple: {
        name: '⚡ Simple (Fastest)',
        description: 'Direct concatenation - no re-encoding, fastest!',
        icon: '⚡',
        fast: true
    },
    fade: {
        name: '✨ Fade Transition',
        description: 'Smooth fade between clips (1 second)',
        icon: '✨',
        fast: false
    },
    slideright: {
        name: '➡️  Slide Right',
        description: 'New clip slides in from left',
        icon: '➡️',
        fast: false
    },
    slideleft: {
        name: '⬅️  Slide Left',
        description: 'New clip slides in from right',
        icon: '⬅️',
        fast: false
    },
    slidedown: {
        name: '⬇️  Slide Down',
        description: 'New clip slides down from top',
        icon: '⬇️',
        fast: false
    },
    slideup: {
        name: '⬆️  Slide Up',
        description: 'New clip slides up from bottom',
        icon: '⬆️',
        fast: false
    },
    wipeleft: {
        name: '🧹 Wipe Left',
        description: 'Wipe effect - new clip reveals left',
        icon: '🧹',
        fast: false
    },
    wiperight: {
        name: '🧹 Wipe Right',
        description: 'Wipe effect - new clip reveals right',
        icon: '🧹',
        fast: false
    },
    dissolve: {
        name: '💫 Dissolve',
        description: 'Smooth dissolve between clips',
        icon: '💫',
        fast: false
    },
    sidebyside: {
        name: '📊 Side-by-Side',
        description: 'Multiple videos side by side (2, 5, or any number!)',
        icon: '📊',
        fast: false
    },
    stacked: {
        name: '📈 Stacked',
        description: 'Multiple videos stacked vertically (2, 5, or any number!)',
        icon: '📈',
        fast: false
    }
};

// ============================================
// 🔧 HELPER FUNCTIONS
// ============================================

function showHelp() {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║            🎬 VIDEO ASSEMBLY TOOL - QUICK GUIDE              ║
╚══════════════════════════════════════════════════════════════╝

USAGE:
  node assemble-videos.js [METHOD] [VIDEO FILES] [OPTIONS]

METHODS:
`);
    
    Object.entries(METHODS).forEach(([key, method]) => {
        console.log(`  ${method.icon}  --${key.padEnd(15)} ${method.name}`);
        console.log(`     └─ ${method.description}`);
        if (method.fast) console.log(`     ⚡ FAST (no re-encoding)`);
        console.log();
    });

    console.log(`EXAMPLES:

  1️⃣  Simple concat (fastest):
    node assemble-videos.js --simple static.mp4 rotation.mp4 spiral.mp4

  2️⃣  With fade transitions:
    node assemble-videos.js --fade static.mp4 rotation.mp4 spiral.mp4

  3️⃣  With slide effect:
    node assemble-videos.js --slideright static.mp4 rotation.mp4 spiral.mp4

  4️⃣  Side-by-side comparison:
    node assemble-videos.js --sidebyside video1.mp4 video2.mp4

  5️⃣  Stacked (top/bottom):
    node assemble-videos.js --stacked video1.mp4 video2.mp4

OPTIONS:
  --output NAME     Name of output file (default: assembled.mp4)
  --duration SECS   Clip duration before transition (default: 10 seconds)
  --transition SECS Transition duration (default: 1 second)
  --preview         Show FFmpeg command without running
  --help            Show this help

EXAMPLES WITH OPTIONS:

  node assemble-videos.js --fade static.mp4 rotation.mp4 \\
    --output my_video.mp4 --duration 5 --transition 2

  node assemble-videos.js --slideright video1.mp4 video2.mp4 \\
    --output result.mp4 --preview

QUICK RECOMMENDATIONS:

  🎓 Teaching:      Use --simple (fastest for iteration)
  🎥 Professional:  Use --fade (smooth, polished)
  🎨 Creative:      Use --wipeleft, --slideright (interesting)
  📊 Comparison:    Use --sidebyside (see both at once)

═══════════════════════════════════════════════════════════════
`);
}

function getVideoInfo(filepath) {
    try {
        const cmd = `ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate -of csv=p=0 "${filepath}"`;
        const output = execSync(cmd, { encoding: 'utf-8' }).trim();
        const [width, height, framerate] = output.split(',');
        return {
            width: parseInt(width),
            height: parseInt(height),
            framerate: framerate,
            exists: true
        };
    } catch (err) {
        return { exists: false, error: err.message };
    }
}

function getVideoDuration(filepath) {
    try {
        const cmd = `ffprobe -v error -select_streams v:0 -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filepath}"`;
        const output = execSync(cmd, { encoding: 'utf-8' }).trim();
        return parseFloat(output);
    } catch (err) {
        return null;
    }
}

function validateVideos(videos) {
    const info = videos.map(v => ({
        path: v,
        info: getVideoInfo(v)
    }));

    const missing = info.filter(i => !i.info.exists);
    if (missing.length > 0) {
        console.error('\n❌ ERROR: Missing video files:');
        missing.forEach(m => console.error(`   ${m.path}`));
        process.exit(1);
    }

    return info;
}

function createConcatList(videos, filepath) {
    const content = videos
        .map(v => `file '${path.resolve(v)}'`)
        .join('\n');
    fs.writeFileSync(filepath, content);
}

function runCommand(cmd, preview = false) {
    if (preview) {
        console.log('\n📋 FFmpeg Command:\n');
        console.log(cmd);
        console.log('\n(use without --preview to execute)\n');
        return;
    }

    try {
        console.log('\n⏳ Processing...\n');
        execSync(cmd, { stdio: 'inherit' });
        console.log('\n✅ Done!\n');
    } catch (err) {
        console.error('\n❌ Error:', err.message, '\n');
        process.exit(1);
    }
}

// ============================================
// 🎬 ASSEMBLY METHODS
// ============================================

function assembleSimple(videos, output, preview = false) {
    const concatFile = 'concat_list.txt';
    createConcatList(videos, concatFile);

    const cmd = `ffmpeg -f concat -safe 0 -i ${concatFile} -c copy -y "${output}"`;
    
    runCommand(cmd, preview);
    
    if (!preview) {
        fs.unlinkSync(concatFile);
        console.log(`📁 Output: ${output}\n`);
    }
}

function assembleWithTransition(videos, output, transition = 'fade', duration = 10, transitionDuration = 1, preview = false, userSetDuration = false) {
    if (videos.length < 2) {
        console.error('❌ Need at least 2 videos for transitions\n');
        process.exit(1);
    }

    // Auto-detect video duration if user didn't set it
    if (!userSetDuration) {
        const videoDurations = videos.map(v => getVideoDuration(v)).filter(d => d !== null);
        if (videoDurations.length > 0) {
            const minDuration = Math.min(...videoDurations);
            const autoDetectedDuration = Math.max(2, Math.floor(minDuration) - 1);
            
            if (autoDetectedDuration < duration) {
                console.log(`📹 Auto-detected video duration: ~${minDuration.toFixed(1)}s`);
                console.log(`⚙️  Adjusting clip duration from ${duration}s to ${autoDetectedDuration}s\n`);
                duration = autoDetectedDuration;
                
                // Also reduce transition if it's too long
                if (transitionDuration > duration - 1) {
                    transitionDuration = Math.max(0.5, duration - 1);
                    console.log(`⚙️  Adjusting transition from 1s to ${transitionDuration}s for better effect\n`);
                }
            }
        }
    }

    const offset = Math.max(0, duration - transitionDuration);
    let filterChain = '';

    // Build trimmed video segments
    for (let i = 0; i < videos.length; i++) {
        filterChain += `[${i}:v]trim=0:${duration}[v${i}];`;
    }

    // Build transition chain
    let current = `v0`;
    for (let i = 1; i < videos.length; i++) {
        const next = `v${i}`;
        const result = videos.length > 2 && i < videos.length - 1 ? `v0${i}` : 'v';
        filterChain += `[${current}][${next}]xfade=transition=${transition}:duration=${transitionDuration}:offset=${offset}[${result}];`;
        current = result;
    }

    // Remove trailing semicolon
    filterChain = filterChain.slice(0, -1);

    // Build input files
    const inputs = videos.map(v => `-i "${v}"`).join(' ');

    const cmd = `ffmpeg ${inputs} -filter_complex "${filterChain}" -map "[v]" -c:v libx264 -preset fast -y "${output}"`;

    runCommand(cmd, preview);
    
    if (!preview) {
        console.log(`📁 Output: ${output}`);
        console.log(`✨ Transition: ${transition} (${transitionDuration}s)`);
        console.log(`⏱️  Clip duration: ${duration}s\n`);
    }
}

function assembleSideBySide(videos, output, preview = false) {
    if (videos.length < 2) {
        console.error('❌ Side-by-side requires at least 2 videos\n');
        process.exit(1);
    }

    // Calculate grid dimensions for optimal layout
    const numVideos = videos.length;
    let cols = Math.ceil(Math.sqrt(numVideos));
    let rows = Math.ceil(numVideos / cols);
    
    // Adjust for better aspect ratios
    if (numVideos === 3) {
        cols = 3;
        rows = 1;
    } else if (numVideos === 5) {
        cols = 3;
        rows = 2;
    }
    
    const totalWidth = 1920;
    const totalHeight = 1080;
    const widthPerVideo = Math.floor(totalWidth / cols);
    const heightPerVideo = Math.floor(totalHeight / rows);
    
    // Build inputs
    let filterChain = '';
    const inputs = videos.map((v, i) => `-i "${v}"`).join(' ');
    
    // Scale each video
    for (let i = 0; i < numVideos; i++) {
        filterChain += `[${i}:v]scale=${widthPerVideo}:${heightPerVideo}[v${i}];`;
    }
    
    // Build grid layout
    let gridRow = '';
    for (let row = 0; row < rows; row++) {
        let rowLabels = [];
        for (let col = 0; col < cols; col++) {
            const index = row * cols + col;
            if (index < numVideos) {
                rowLabels.push(`v${index}`);
            } else {
                // Pad with black if grid is not completely filled
                filterChain += `color=c=black:s=${widthPerVideo}x${heightPerVideo}[black${row}${col}];`;
                rowLabels.push(`black${row}${col}`);
            }
        }
        const rowLabelStr = rowLabels.map(l => `[${l}]`).join('');
        gridRow += `${rowLabelStr}hstack=inputs=${cols}[row${row}];`;
    }
    
    // Stack rows vertically
    let outputLabel = 'v';
    if (rows === 1) {
        filterChain += gridRow.slice(0, -1); // Remove last ;
        outputLabel = 'row0';
    } else {
        filterChain += gridRow;
        let rowStack = Array.from({length: rows}, (_, i) => `[row${i}]`).join('');
        filterChain += `${rowStack}vstack=inputs=${rows}[v]`;
    }
    
    const cmd = `ffmpeg ${inputs} -filter_complex "${filterChain}" -map "[${outputLabel}]" -c:v libx264 -preset fast -y "${output}"`;

    runCommand(cmd, preview);
    
    if (!preview) {
        console.log(`📁 Output: ${output}`);
        console.log(`📊 Layout: Side-by-Side Grid (${cols}×${rows} = ${numVideos} videos)`);
        console.log(`   Resolution: ${widthPerVideo}×${heightPerVideo} per video\n`);
    }
}

function assembleStacked(videos, output, preview = false) {
    if (videos.length < 2) {
        console.error('❌ Stacked requires at least 2 videos\n');
        process.exit(1);
    }

    // For stacked, we use simple vertical layout
    const numVideos = videos.length;
    const totalHeight = 1080;
    const width = 640;
    const heightPerVideo = Math.floor(totalHeight / numVideos);
    
    // Build inputs
    let filterChain = '';
    const inputs = videos.map((v, i) => `-i "${v}"`).join(' ');
    
    // Scale each video
    for (let i = 0; i < numVideos; i++) {
        filterChain += `[${i}:v]scale=${width}:${heightPerVideo}[v${i}];`;
    }
    
    // Build vstack filter with all videos
    let stackOrder = Array.from({length: numVideos}, (_, i) => `v${i}`).join('][');
    filterChain += `[${stackOrder}]vstack=inputs=${numVideos}[v]`;
    
    const cmd = `ffmpeg ${inputs} -filter_complex "${filterChain}" -map "[v]" -c:v libx264 -preset fast -y "${output}"`;

    runCommand(cmd, preview);
    
    if (!preview) {
        console.log(`📁 Output: ${output}`);
        console.log(`📈 Layout: Stacked Vertical (${numVideos} videos, ${width}×${heightPerVideo} each)\n`);
    }
}

// ============================================
// 📊 MAIN EXECUTION
// ============================================

function main() {
    const args = process.argv.slice(2);

    if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
        showHelp();
        process.exit(0);
    }

    // Parse arguments
    const method = args[0];
    let videoFiles = [];
    let output = 'assembled.mp4';
    let duration = 10;
    let transitionDuration = 1;
    let preview = false;
    let userSetDuration = false;

    for (let i = 1; i < args.length; i++) {
        if (args[i] === '--output') {
            output = args[++i];
        } else if (args[i] === '--duration') {
            duration = parseInt(args[++i]);
            userSetDuration = true;
        } else if (args[i] === '--transition') {
            transitionDuration = parseInt(args[++i]);
        } else if (args[i] === '--preview') {
            preview = true;
        } else if (!args[i].startsWith('--')) {
            videoFiles.push(args[i]);
        }
    }

    // Validate
    if (videoFiles.length === 0) {
        console.error('❌ ERROR: No video files specified\n');
        console.error('Usage: node assemble-videos.js [METHOD] [VIDEO FILES]\n');
        console.error('Example: node assemble-videos.js --fade video1.mp4 video2.mp4 video3.mp4\n');
        console.error('Run: node assemble-videos.js --help\n');
        process.exit(1);
    }

    if (!method.startsWith('--')) {
        console.error('❌ ERROR: First argument must be a method (--simple, --fade, etc)\n');
        console.error('Run: node assemble-videos.js --help\n');
        process.exit(1);
    }

    const methodKey = method.slice(2);
    if (!METHODS[methodKey]) {
        console.error(`❌ ERROR: Unknown method: ${method}\n`);
        console.error('Available methods: ' + Object.keys(METHODS).map(m => '--' + m).join(', ') + '\n');
        process.exit(1);
    }

    // Show what we're doing
    console.log(`\n╔════════════════════════════════════════════════════════╗`);
    console.log(`║  🎬 ${METHODS[methodKey].icon} ${METHODS[methodKey].name.padEnd(48)} ║`);
    console.log(`╚════════════════════════════════════════════════════════╝\n`);
    
    console.log(`📹 Input videos: ${videoFiles.length}`);
    videoFiles.forEach((v, i) => console.log(`   ${i + 1}. ${v}`));
    console.log(`\n📁 Output: ${output}`);
    
    if (METHODS[methodKey].fast) {
        console.log(`⚡ This method is FAST (no re-encoding)`);
    }
    
    // Validate videos exist
    validateVideos(videoFiles);

    // Execute
    switch (methodKey) {
        case 'simple':
            assembleSimple(videoFiles, output, preview);
            break;
        case 'fade':
        case 'slideright':
        case 'slideleft':
        case 'slidedown':
        case 'slideup':
        case 'wipeleft':
        case 'wiperight':
        case 'dissolve':
            assembleWithTransition(videoFiles, output, methodKey, duration, transitionDuration, preview, userSetDuration);
            break;
        case 'sidebyside':
            assembleSideBySide(videoFiles, output, preview);
            break;
        case 'stacked':
            assembleStacked(videoFiles, output, preview);
            break;
    }
}

main();
