# Banana_Suitability 
## Overview
Using GIS and remote sensing datasets in Google Earth Engine (GEE), this project analyses banana crop suitability across Kenya. The analysis is based on key environmental factors, including rainfall, temperature, wind speed, soil properties, elevation, and land cover.

### Data Sources

Rainfall: Annual precipitation from WorldClim 2.1 dataset.
Temperature: Land Surface Temperature (LST) from MODIS (MOD11A1).
Wind Speed: 100m wind speed from Global Wind Atlas.
Soil Properties: ISRIC SoilGrids for Kenya.
Elevation: Shuttle Radar Topography Mission (SRTM) DEM.
Land Cover: ESA WorldCover 2021.
Administrative Boundaries: FAO GAUL dataset for Kenya.

### Methodology

1. Preprocessing & Clipping

Each dataset was clipped to the Kenya boundary using FAO GAUL administrative data.

2. Reclassification of Suitability Factors

Rainfall (mm/year):

<500 → Unsuitable (Class 1)
500–1000 → Low Suitability (Class 2)
1000–1500 → Moderate Suitability (Class 3)
1500–2000 → Suitable (Class 4)
2000 → Highly Suitable (Class 5)

Temperature (°C):

<10 → Unsuitable (Class 1)
10–15 → Suitable (Class 2)
15–20 → Highly Suitable (Class 3)
20 → Unsuitable (Class 4)

Wind Speed (km/h):
<5 → Unsuitable (Class 1)
5–10 → Highly Suitable (Class 2)
10–15 → Moderately Suitable (Class 3)
15 → Unsuitable (Class 4)

3. Weighted Overlay Analysis

The reclassified layers were combined using a weighted overlay approach with assumptions made:

Rainfall → 30%
Temperature → 25%
Wind Speed → 20%
Soil Properties → 15%
Elevation → 5%
Land Cover → 5%

Higher weights were assigned to more influential factors (e.g., rainfall and temperature).

4. Final Suitability Map: The final suitability index (1–5) was generated based on weighted sum calculations, with higher values indicating better suitability for banana farming.

Outputs

Reclassified Layers: Individual suitability layers for rainfall, temperature, and wind.
Final Suitability Map: A raster showing the best areas for banana cultivation in Kenya.
Statistics & Visualization: Maps and histograms of suitability classifications.

Tools & Platforms
Google Earth Engine (GEE) for remote sensing data processing.
QGIS for additional spatial analysis and visualization.
Python & Pandas (for data wrangling and analysis).

Next Steps
Validation: Compare results with banana production data from the Ministry of Agriculture.
Integration with Yield Models: Predict potential banana yields based on suitability zones.
Climate Change Impact: Assess how future climate scenarios may affect banana suitability.
