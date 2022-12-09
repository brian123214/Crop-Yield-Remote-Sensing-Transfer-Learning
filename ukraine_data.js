

// table is from https://geodata.lib.utexas.edu/catalog/stanford-gg870xt4706. Ukraine oblast boundary shape files
// must import the table
// Imports (1 entry)
// var table: Table projects/ /assests/UKR_adm1 

// maize 2016 and up are different


// remove 11 4 20. Up to 27
var cities = [
  1,
  2,
  3,
  5,
  6,
  7,
  8,
  9,
  10,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  21,
  22,
  23,
  24,
  25,
  26,
  27
]

var modis_dates = [
  ['2016-04-01', '2016-10-31'], 
  ['2017-04-01', '2017-10-31'], 
  ['2018-04-01', '2018-10-31']
  ];
  
var mask_dates = [
  '2016-01-01',
  '2017-01-01',
  '2018-01-01',
]
print(table)
var cropland = ee.ImageCollection('MODIS/006/MCD12Q1').select('LC_Type1');

function getLstSr(regionName) {
  var region = table.filterMetadata('ID_1', 'equals', regionName).geometry();
  print(region)
  Map.addLayer(region)
  
  for (var i=0, modis_len=modis_dates.length; i<modis_len; i++) {
    
    var start_modis_date = modis_dates[i][0];
    var end_modis_date = modis_dates[i][1];
    var mask_date = mask_dates[i];
    var year = start_modis_date.substring(0,4);
    
    // print(start_modis_date)
    // print(end_modis_date)
    // print(mask_date)
    
    var temp_cropland = cropland.filter(ee.Filter.date(mask_date)).map(function(image){return image.eq(12)});
    // .map(function(image){return image.clip(region)})
    var lst = ee.ImageCollection('MODIS/061/MOD11A2')
                  .filter(ee.Filter.date(start_modis_date, end_modis_date))
                  .select(['LST_Day_1km', 'LST_Night_1km'])
                  .map(function(image){return image.clip(region)})
                  .map(function(image){return image.updateMask(temp_cropland.min().eq(1))});
    var sr = ee.ImageCollection('MODIS/006/MOD09A1')
                  .filter(ee.Filter.date(start_modis_date, end_modis_date))
                  .select(['sur_refl_b01', 'sur_refl_b02', 'sur_refl_b03', 'sur_refl_b04', 'sur_refl_b05', 'sur_refl_b06', 'sur_refl_b07'])
                  .map(function(image){return image.clip(region)})
                  .map(function(image){return image.updateMask(temp_cropland.min().eq(1))});
    var sr_lst = sr.merge(lst);
    var Hist_featureCollection = ee.FeatureCollection(sr_lst.map(function(image){
      var stats = image.reduceRegion({
      reducer: ee.Reducer.frequencyHistogram(),
      geometry: region,
      scale: 500,
      maxPixels: 1e15});
      var featurestats = ee.Feature(null, {'pixelCount': stats});
      return featurestats; 
    }));
    Export.table.toDrive({
      collection: Hist_featureCollection,
      folder: 'ukraine_hist_new5',
      description: regionName + '_' + year,
      selectors: ['system:index','DATE_ACQUIRED', 'pixelCount'],
      fileFormat: 'CSV'
    });
    return

  }
}



for (var i=0, city_len=cities.length; i<city_len; i++) {
  var regionName = cities[i];
  getLstSr(regionName);
}
