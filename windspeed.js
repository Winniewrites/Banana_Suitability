// Load Kenya Wind Speed Dataset (100m from Global Wind Atlas)
var windKenya = ee.Image('projects/ee-wonyancha22/assets/KEN_wind-speed_100m');

// Load Kenya boundary
var kenya = ee.FeatureCollection('FAO/GAUL/2015/level0')
              .filter(ee.Filter.eq('ADM0_NAME', 'Kenya'));

// Clip wind speed data to Kenya boundary
var windKenyaClipped = windKenya.clip(kenya);

// ✅ Wind Speed Visualization Parameters
var windVis = {
  min: 0,
  max: 20,  // Adjust if necessary
  palette: ['blue', 'green', 'yellow', 'orange', 'red']
};

// Add wind speed layer to the map
Map.setCenter(37.9062, 0.0236, 6); // Centering on Kenya
Map.addLayer(windKenyaClipped, windVis, 'Mean Wind Speed (100m)');

// ✅ Reclassify wind speed for banana suitability (4 classes)
var reclassifiedWind = windKenyaClipped.expression(
  "(b(0) < 5) ? 3 : " +    // Moderately Suitable (<5 m/s)
  "(b(0) >= 5 && b(0) < 10) ? 4 : " + // Highly Suitable (5-10 m/s)
  "(b(0) >= 10 && b(0) < 15) ? 2 : " + // Marginally Suitable (10-15 m/s)
  "1",  // Unsuitable (≥15 m/s)
  {'b(0)': windKenyaClipped}
).toInt();

// ✅ Clip the reclassified wind suitability map to Kenya boundary
var reclassifiedWindClipped = reclassifiedWind.clip(kenya);

// ✅ Reclassified Wind Suitability Visualization
var reclassifiedWindVis = {
  min: 1,
  max: 4,
  palette: ['red', 'orange', 'yellow', 'green'], // red = Unsuitable, green = Highly Suitable
  opacity: 0.8
};

// ✅ Add the reclassified wind suitability layer to the map
Map.addLayer(reclassifiedWindClipped, reclassifiedWindVis, 'Wind Suitability for Bananas');

// ✅ Calculate statistics to verify classification
var windStats = reclassifiedWindClipped.reduceRegion({
  reducer: ee.Reducer.minMax(),
  geometry: kenya.geometry(),
  scale: 1000,
  maxPixels: 1e13
});
print('Reclassified Wind Suitability Stats:', windStats);

// ✅ Export the reclassified wind suitability raster
Export.image.toDrive({
  image: reclassifiedWindClipped,
  description: 'Reclassified_Wind_4class',
  folder: 'Banana_reclassified_V2',
  fileNamePrefix: 'reclassified_wind_4class',
  region: kenya.geometry(),
  scale: 100, // Adjust resolution as needed
  crs: 'EPSG:4326',
  maxPixels: 1e13
});
