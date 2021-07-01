# fswebcam 

This module allows you to use the Linux package fswebcam as a Nitrogen camera device.

## How to use in your project

1. Clone the [camera](https://github.com/nitrogenjs/camera) project if you do not already have a camera project to start from.

2. Add 'nitrogen-fswebcam' to your packages.json.
3. Add a FSWebCamCamera to your cameras in config.js:

```
var config = {
    cameras: [
        new FSWebCamCamera({
            width: 640,
            height: 480 
        })
    ]
};
```
