// CODE FOR NDFI
var aoi = table.filter(ee.Filter.eq("DISTRICT", "MORANG"));
Map.addLayer(aoi, {}, "aoi");

var collection = ee.ImageCollection("COPERNICUS/S1_GRD")
  .filterBounds(aoi)
  .filter(ee.Filter.listContains("transmitterReceiverPolarisation", "VV"))
  .select("VV");

// filter before and after flood imagery
var before = collection.filterDate("2021-05-01", "2021-05-15").mosaic();
var after = collection.filterDate("2021-10-01", "2021-10-30").mosaic();

var before_clip = before.clip(aoi);
var after_clip = after.clip(aoi);

// apply smoothening filter
var before_s = before_clip.focal_median(30, "circle", "meters");
var after_s = after_clip.focal_median(30, "circle", "meters");

// Calculate NDFI
var ndfi = after_s.subtract(before_s).divide(after_s.add(before_s));

// Set a threshold for flooded areas (adjust as needed)
var flood_threshold = -0.2; // Example threshold, you can change this value

// Identify flooded areas
var flooded_areas = ndfi.lt(flood_threshold);
var flooded_masked = flooded_areas.updateMask(flooded_areas);

// Display maps
Map.addLayer(before_clip, { min: -30, max: 0 }, "Before flood");
Map.addLayer(after_clip, { min: -30, max: 0 }, "After flood");
Map.addLayer(ndfi, { min: -1, max: 1, palette: ['blue', 'white', 'green'] }, "NDFI");
Map.addLayer(flooded_masked, { palette: 'blue' }, "Flooded Areas");