// extract

var aoi = table.filter(ee.Filter.eq("DISTRICT","MORANG"))
Map.addLayer(aoi,{},"aoi")

var collection = ee.ImageCollection("COPERNICUS/S1_GRD")
.filterBounds(aoi)
.filter(ee.Filter.listContains("transmitterReceiverPolarisation","VV"))
.select("VV")

// filter before and after flood imagery

var before = collection.filterDate("2021-05-01","2021-05-15").mosaic()
var after = collection.filterDate("2021-10-01","2021-10-30").mosaic()

var before_clip = before.clip(aoi)
var after_clip = after.clip(aoi)

// apply smoothening filter
var before_s = before_clip.focal_median(30,"circle","meters")
var after_s = after_clip.focal_median(30,"circle","meters")

// difference of images
var difference = after_s.subtract(before_s);

var flood_extent = difference.lt(-3); // 
var flood = flood_extent.updateMask(flood_extent);


// Display maps
Map.addLayer(before_clip,{min:-30,max:0}, "Before flood");
Map.addLayer(after_clip,{min:-30,max:0}, "After flood");
Map.addLayer(difference,{},"Difference");
Map.addLayer(flood,{},"Flood");



// Each pixel in Sentinel-1 is 10m x 10m = 100 m² = 0.01 hectares
var hectareImage = ee.Image.pixelArea().divide(10000); // convert m² to hectares

// Multiply binary flood mask by pixel area to get the flooded area
var floodAreaImage = flood.multiply(hectareImage);

// Reduce the image to get the total flooded area in hectares
var totalFloodedHectares = floodAreaImage.reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: aoi.geometry(),
  scale: 10,
  maxPixels: 1e10
});

print("Total Flooded Area in hectares:", totalFloodedHectares);

