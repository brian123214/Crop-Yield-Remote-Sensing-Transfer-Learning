# Crop-Yield-Remote-Sensing-Transfer-Learning

This code trains a CNN, 3D CNN, and CNN-LSTM on US remote sensing data using MODIS products recording surface reflectance, land surface temperature, and a cropland mask. Then, the trained models were used for transfer learning on models training on Shandong, China and Ukraine data (two seperate models). 

# Results

### US Model Trained 2008-2015, Evaluated 2016-2018 (RMSE)

<img src="https://user-images.githubusercontent.com/58054213/206606070-b9f28394-65e3-497d-a6d6-8a3f849f18c0.png" width="900">

### China Models Trained 2008-2015, Evaluated 2016-2018 (RMSE)

<img src="https://user-images.githubusercontent.com/58054213/206607118-09bc32c8-8597-4bc0-89b7-a56c391faeed.png" width="900">

### Ukraine Models Trained 2016-2017, Evaluated 2018 (RMSE)

<img src="https://user-images.githubusercontent.com/58054213/206607272-7732bdb2-780c-45f7-b0cc-f60b09901e4e.png" width="900">



