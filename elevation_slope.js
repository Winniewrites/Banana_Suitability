// Load DEM dataset
var dataset = ee.Image('USGS/SRTMGL1_003');
var elevation = dataset.select('elevation');
var slope = ee.Terrain.slope(elevation);

// Load Kenya boundary
var kenya = ee.FeatureCollection('FAO/GAUL/2015/level0')
                .filter(ee.Filter.eq('ADM0_NAME', 'Kenya'));

// Clip elevation and slope data to Kenya's boundary
var elevationKenya = elevation.clip(kenya);
var slopeKenya = slope.clip(kenya);

// Map Center
Map.setCenter(37.9062, 0.0236, 6);

// ✅ Reclassify Elevation for Banana Suitability (4 Classes)
var reclassifiedElevation = elevationKenya.expression(
  "(b(0) < 500) ? 1 :" +   // Unsuitable
  "(b(0) >= 500 && b(0) < 1000) ? 2 :" +  // Marginally Suitable
  "(b(0) >= 1000 && b(0) < 1500) ? 3 :" + // Moderately Suitable
  "4",  // Suitable (≥1800m)
  {'b(0)': elevationKenya}
).toInt(); // Ensure integer output

// ✅ Reclassify Slope for Banana Suitability (4 Classes)
var reclassifiedSlope = slopeKenya.expression(
  "(b(0) < 2) ? 4 :" +   // Suitable (Flat)
  "(b(0) >= 2 && b(0) < 5) ? 3 :" +  // Moderately Suitable
  "(b(0) >= 5 && b(0) < 8) ? 2 :" +  // Marginally Suitable
  "1",  // Unsuitable (Steep)
  {'b(0)': slopeKenya}
).toInt(); // Ensure integer output

// ✅ Clip the reclassified data to Kenya's boundary
var clippedReclassifiedElevation = reclassifiedElevation.clip(kenya);
var clippedReclassifiedSlope = reclassifiedSlope.clip(kenya);

// ✅ Fixed Visualization Parameters
var elevationVis = {
  min: 1, 
  max: 4, 
  palette: ['red', 'orange', 'yellow', 'green']  // Red (Unsuitable) → Green (Suitable)
};

var slopeVis = {
  min: 1, 
  max: 4, 
  palette: ['red', 'orange', 'yellow', 'green']  // Red (Unsuitable) → Green (Suitable)
};

// ✅ Add Layers to the Map
Map.addLayer(clippedReclassifiedElevation, elevationVis, 'Reclassified Elevation for Bananas');
Map.addLayer(clippedReclassifiedSlope, slopeVis, 'Reclassified Slope for Bananas');

// ✅ Display Suitability Stats
var elevationStats = clippedReclassifiedElevation.reduceRegion({
  reducer: ee.Reducer.minMax(),
  geometry: kenya.geometry(),
  scale: 1000,
  maxPixels: 1e13
});
var slopeStats = clippedReclassifiedSlope.reduceRegion({
  reducer: ee.Reducer.minMax(),
  geometry: kenya.geometry(),
  scale: 1000,
  maxPixels: 1e13
});

print('Elevation Suitability Stats:', elevationStats);
print('Slope Suitability Stats:', slopeStats);

// ✅ Export reclassified elevation
Export.image.toDrive({
  image: clippedReclassifiedElevation,
  description: 'Reclassified_Elevation_4class',
  folder: 'Banana_reclassified_V2',
  fileNamePrefix: 'reclassified_elevation_4class',
  region: kenya.geometry(),
  scale: 100, 
  crs: 'EPSG:4326',
  maxPixels: 1e13
});

// ✅ Export reclassified slope
Export.image.toDrive({
  image: clippedReclassifiedSlope,
  description: 'Reclassified_Slope_4class',
  folder: 'Banana_reclassified_V2',
  fileNamePrefix: 'reclassified_slope_4class',
  region: kenya.geometry(),
  scale: 100, 
  crs: 'EPSG:4326',
  maxPixels: 1e13
});
