
// 2003-2015
// var start_date = '2003-04-01';
// var end_date = '2003-12-31';
var start_date = '2018-04-01';
var end_date = '2018-06-01';
var iowa = ee.FeatureCollection('TIGER/2018/States').filterMetadata('NAME', 'equals', 'Iowa').geometry();

// var lst = ee.ImageCollection('MODIS/061/MOD11A2').filter(ee.Filter.date(start_date, end_date)).select(['LST_Night_1km', 'LST_Day_1km'])
var lst = ee.ImageCollection('MODIS/006/MOD09GA').filter(ee.Filter.date(start_date, end_date)).select(['sur_refl_b01', 'sur_refl_b04', 'sur_refl_b03']);

var trueColor143Vis = {
  min: -100.0,
  max: 8000.0,
};

var mod = lst.map(function(img) {return img.clip(iowa)})

Map.addLayer(mod, trueColor143Vis, 'True Color (143)');



var dataset = ee.ImageCollection('USDA/NASS/CDL')
                  .filter(ee.Filter.date('2018-01-01', '2019-12-31'))
                  .first();
var cropLandcover = dataset.select('cropland').eq(1);
Map.setCenter(-100.55, 40.71, 4);
Map.addLayer(cropLandcover, {}, 'Crop Landcover');

var masked = mod.map(function(img) {
                   return img.updateMask(cropLandcover)
                   })
Map.addLayer(masked, null, 'Masked');




