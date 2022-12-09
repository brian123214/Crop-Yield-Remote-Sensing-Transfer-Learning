

// for table import shape files from https://earthworks.stanford.edu/catalog.html?f%5Baccess%5D%5B%5D=available&f%5Bdc_format_s%5D%5B%5D=Shapefile&f%5Bdct_provenance_s%5D%5B%5D=Stanford&f%5Bdct_spatial_sm%5D%5B%5D=Shandong+Sheng+%28China%29&sort=dc_title_sort+asc
// get shandong data

// maize 2016 and up are different
var cities = [
    'Jinan', 
    'Qingdao',
    'Zibo',
    'Zaochuang',
    'Dongying',
    'Yantai',
    'Weifang',
    'Jining',
    "Tai'an",
    'Weihai',
    'Rizhao',
    'Laiwu',
    'Linyi',
    'Dezhou',
    'Liaocheng',
    'Binzhou',
    'Heze'
]

var modis_dates = [
  ['2008-04-01', '2008-10-31'],
  ['2009-04-01', '2009-10-31'], 
  ['2010-04-01', '2010-10-31'], 
  ['2011-04-01', '2011-10-31'], 
  ['2012-04-01', '2012-10-31'], 
  ['2013-04-01', '2013-10-31'], 
  ['2014-04-01', '2014-10-31'], 
  ['2015-04-01', '2015-10-31'], 
  ['2016-04-01', '2016-10-31'], 
  ['2017-04-01', '2017-10-31'], 
  ['2018-04-01', '2018-10-31']
  ];
  
var mask_dates = [
  '2009-01-01',
  '2010-01-01',
  '2011-01-01',
  '2012-01-01',
  '2013-01-01',
  '2014-01-01',
  '2015-01-01',
  '2016-01-01',
  '2017-01-01',
  '2018-01-01',
  '2019-01-01'
]
  
var cropland = ee.ImageCollection('MODIS/006/MCD12Q1').select('LC_Type1');

function getLstSr(regionName) {
  var region = table2.filterMetadata('name_2', 'equals', regionName).geometry();
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
      folder: 'china_hist_new2',
      description: regionName + '_' + year,
      selectors: ['system:index','DATE_ACQUIRED', 'pixelCount'],
      fileFormat: 'CSV'
    });

  }
}



for (var i=0, city_len=cities.length; i<city_len; i++) {
  var regionName = cities[i];
  getLstSr(regionName);
}

// var cropland = ee.ImageCollection('MODIS/006/MCD12Q1').select('LC_Type1');
// var temp_cropland = cropland.filter(ee.Filter.date('2009-01-01')).map(function(image){return image.eq(12)});
// Map.addLayer(temp_cropland)

// print(temp_cropland)

// var region = table2.filterMetadata('name_2', 'equals', 'Jinan').geometry();

                  
// var temp_lst_sr = sr.merge(lst)

// Map.addLayer(lst)
// Map.addLayer(region)

// var Hist_featureCollection = ee.FeatureCollection(temp_lst_sr.map(function(image){
//   var stats = image.reduceRegion({
//   reducer: ee.Reducer.frequencyHistogram(),
//   geometry: region,
//   scale: 500,
//   maxPixels: 1e15});
//   var featurestats = ee.Feature(null, {'pixelCount': stats});
//   return featurestats; 
// }));
// Export.table.toDrive({
//   collection: Hist_featureCollection,
//   folder: 'china_hist_new',
//   description: 'hhhhh' + '_' + '1111',
//   selectors: ['system:index','DATE_ACQUIRED', 'pixelCount'],
//   fileFormat: 'CSV'
// });




// // // regions
// var jilin = table2.filterMetadata('name_2', 'equals', 'Jilin').geometry();

// for (var i = 0, len = cities.length; i < len; i++) {
//     var name = cities[i];
//     var region = table2.filterMetadata('name_2', 'equals', name).geometry();

//     var op = image.select('b1').lt(65535)
    
    // var lst = ee.ImageCollection('MODIS/061/MOD11A2')
    //                   .filter(ee.Filter.date('2018-01-01', '2018-05-01'))
    //                   .select(['LST_Day_1km', 'LST_Night_1km'])
    //                   .map(function(image){return image.clip(region)})
    //                   .map(function(image){return image.updateMask(op)});
    // var sr = ee.ImageCollection('MODIS/006/MOD09A1')
    //                   .filter(ee.Filter.date('2018-01-01', '2018-05-01'))
    //                   .select(['sur_refl_b01', 'sur_refl_b02', 'sur_refl_b03', 'sur_refl_b04', 'sur_refl_b05', 'sur_refl_b06', 'sur_refl_b07'])
    //                   .map(function(image){return image.clip(region)})
    //                   .map(function(image){return image.updateMask(op)});
                      
//     var sr_lst = sr.merge(lst);
    
//     Map.addLayer(op)
//     Map.addLayer(lst)
//     break;
    
    // var Hist_featureCollection = ee.FeatureCollection(sr_lst.map(function(image){
    //   var stats = image.reduceRegion({
    //   reducer: ee.Reducer.frequencyHistogram(),
    //   geometry: region,
    //   scale: 30,
    //   maxPixels: 1e15});
    //   //var image_Stats = image.set('pixelCount', stats) 
    //   var featurestats = ee.Feature(null, {'pixelCount': stats});
    //   //var FeatStats = ee.FeatureCollection([featurestats]);
    //   return featurestats; // if i return FeatStats and export, the data table is empty
    // }));
    
    // // Get a list of the dates.
    // Export.table.toDrive({
    //   collection: Hist_featureCollection,
    //   folder: '/content/drive/MyDrive/china_hist',
    //   description: name,
    //   selectors: ['system:index','DATE_ACQUIRED', 'pixelCount'],
    //   fileFormat: 'CSV'
    // });

