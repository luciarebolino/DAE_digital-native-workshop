
<img width="1484" height="548" alt="Screenshot 2025-11-16 at 2 15 44 PM" src="https://github.com/user-attachments/assets/b40169ef-de58-4f55-b3ea-772573612ff5" />

# 🌐 DIGITAL NATIVE WORKSHOP  
### Scraping Street View  
  
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

(Create an account here: …)

GitHub serves mainly as a way to bring the workshop code into your own environment.

### 2. Google Account

A Google account is necessary for two reasons:

A. **Using the Google Street View API**  
B. **Creating and tracing your route in Google My Maps**  
   We will use My Maps to design a path for the camera movement.  
   This path will later be exported and transformed into a list of GPS points for the API to scrape.

<img width="1137" height="802" alt="Screenshot 2025-11-16 at 2 27 31 PM" src="https://github.com/user-attachments/assets/ac44a750-ae39-4d01-a5df-6ade1c7d6e90" />


### QGIS

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

---

### Visual Studio Code

We will use **VS Code** to run the JavaScript scripts that automate scraping.  
Recommended extensions:  
- JavaScript/TypeScript support  
- Prettier (optional but useful)  
- GeoJSON support (optional)

---



