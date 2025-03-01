// Load the MODIS Land Surface Temperature dataset
var dataset = ee.ImageCollection('MODIS/061/MOD11A1')  
                  .filter(ee.Filter.date('2020-01-01', '2020-01-31')); // Time period

// Select the daytime surface temperature (LST_Day_1km) band
var temperature = dataset.select('LST_Day_1km')
                          .mean() // Calculate mean temperature over the period
                          .multiply(0.02) // Scale factor for MODIS LST
                          .subtract(273.15); // Convert from Kelvin to Celsius

// Load Kenya boundary
var kenya = ee.FeatureCollection('FAO/GAUL/2015/level0')
                .filter(ee.Filter.eq('ADM0_NAME', 'Kenya'));

// Clip temperature data to Kenya's boundary
var temperatureKenya = temperature.clip(kenya);

// ✅ Reclassify temperature for banana suitability (optimal between 18°C and 26°C)
var reclassifiedTemperature = temperatureKenya.expression(
  "(b(0) < 10) ? 1 :" +   // Unsuitable (too cold)
  "(b(0) >= 10 && b(0) < 18) ? 2 :" +  // Marginally Suitable
  "(b(0) >= 18 && b(0) < 26) ? 4 :" +  // Highly Suitable (optimal range)
  "3",  // Moderately Suitable (too hot)
  {'b(0)': temperatureKenya}
).toInt(); // Ensure integer output

// ✅ Clip reclassified temperature to Kenya
var clippedReclassifiedTemperature = reclassifiedTemperature.clip(kenya);

// ✅ Fixed Visualization Parameters
var temperatureVis = {
  min: 10,
  max: 40,
  palette: ['blue', 'cyan', 'green', 'yellow', 'orange', 'red', 'darkred'] 
};

var reclassifiedTemperatureVis = {
  min: 1,
  max: 4,
  palette: ['red', 'orange', 'yellow', 'green'],  // Red (Unsuitable) → Green (Suitable)
  opacity: 0.8
};

// ✅ Add layers to the map
Map.centerObject(kenya, 6);
Map.addLayer(temperatureKenya, temperatureVis, 'Mean Temperature for Kenya');
Map.addLayer(clippedReclassifiedTemperature, reclassifiedTemperatureVis, 'Reclassified Temperature for Bananas (10°C - 20°C)');

// ✅ Display Suitability Stats
var temperatureStats = clippedReclassifiedTemperature.reduceRegion({
  reducer: ee.Reducer.minMax(),
  geometry: kenya.geometry(),
  scale: 1000, 
  maxPixels: 1e13
});
print('Banana Temperature Suitability Stats:', temperatureStats);

// ✅ Export reclassified temperature
Export.image.toDrive({
  image: clippedReclassifiedTemperature,
  description: 'Reclassified_Temperature_4class',
  folder: 'Banana_reclassified_V2',
  fileNamePrefix: 'reclassified_temperature_bananas',
  region: kenya.geometry(),
  scale: 100, 
  crs: 'EPSG:4326',
  maxPixels: 1e13
});

