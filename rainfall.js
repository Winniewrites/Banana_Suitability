// Load WorldClim 2.1 dataset for precipitation (Annual Precipitation - BIO12)
var worldclim = ee.Image("WORLDCLIM/V1/BIO").select('bio12'); 

// Load Kenya boundary
var kenya = ee.FeatureCollection('FAO/GAUL/2015/level0')
                .filter(ee.Filter.eq('ADM0_NAME', 'Kenya'));

// Clip precipitation to Kenya
var precipitationKenya = worldclim.clip(kenya);

// ✅ Reclassify annual precipitation for banana suitability (4 Classes)
var reclassifiedPrecipitation = precipitationKenya.expression(
  "(b(0) < 1000) ? 1 :" +   // Unsuitable
  "(b(0) >= 1000 && b(0) < 1400) ? 2 :" +  // Marginally Suitable
  "(b(0) >= 1400 && b(0) < 1800) ? 3 :" + // Moderately Suitable
  "4",  // Suitable (≥1800 mm)
  {'b(0)': precipitationKenya}
).toInt(); // Ensure integer output

// ✅ Clip reclassified precipitation to Kenya
var clippedReclassifiedPrecipitation = reclassifiedPrecipitation.clip(kenya);

// ✅ Fixed Visualization Parameters
var precipitationVis = {
  min: 500,
  max: 2500, 
  palette: ['orange', 'yellow', 'green', 'cyan', 'blue']
};

var reclassifiedVis = {
  min: 1,
  max: 4,
  palette: ['red', 'orange', 'yellow', 'green'],  // Red (Unsuitable) → Green (Suitable)
  opacity: 0.8
};

// ✅ Add layers to the map
Map.centerObject(kenya, 6);
Map.addLayer(precipitationKenya, precipitationVis, 'Annual Precipitation for Kenya');
Map.addLayer(clippedReclassifiedPrecipitation, reclassifiedVis, 'Reclassified Rainfall for Bananas');

// ✅ Display Suitability Stats
var precipitationStats = clippedReclassifiedPrecipitation.reduceRegion({
  reducer: ee.Reducer.minMax(),
  geometry: kenya.geometry(),
  scale: 1000, 
  maxPixels: 1e13
});
print('Banana Rainfall Suitability Stats:', precipitationStats);

// ✅ Export reclassified precipitation
Export.image.toDrive({
  image: clippedReclassifiedPrecipitation,
  description: 'Reclassified_Rainfall_4class',
  folder: 'Banana_reclassified_V2',
  fileNamePrefix: 'reclassified_rainfall_4class',
  region: kenya.geometry(),
  scale: 100, 
  crs: 'EPSG:4326',
  maxPixels: 1e13
});
