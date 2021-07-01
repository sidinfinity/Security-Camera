var spawn = require('child_process').spawn
  , nitrogen = require('nitrogen');

function FSWebCamCamera(config) {
    nitrogen.Device.apply(this, arguments);
    this.tags = ['executes:cameraCommand', 'sends:image'];

    if (!config) config = {};

    this.config = config;

    this.config.width = this.config.width || 640;
    this.config.height = this.config.height || 480;
    this.config.skip = this.config.skip || 30;
    this.config.delay = this.config.delay || 6;
    this.config.quality = this.config.quality || 85;
}

FSWebCamCamera.prototype = Object.create(nitrogen.Device.prototype);
FSWebCamCamera.prototype.constructor = FSWebCamCamera;

FSWebCamCamera.prototype.snapshot = function(options, callback) {
    options.path = options.path || new Date().getTime() + ".jpg";
    options.width = options.width || this.config.width;
    options.height = options.height || this.config.height;
    options.delay = options.delay || this.config.delay;
    options.skip = options.skip || this.config.skip;
    options.quality = options.quality || this.config.quality;

    var process = spawn('fswebcam', ['-r', options.width + 'x' + options.height, '--no-banner', '--no-timestamp', '--jpeg', options.quality, '-D', options.delay, '-S', options.skip, '-']);

    return callback(process.stdout, options);
};

FSWebCamCamera.prototype.status = function(callback) {
    callback(false, {});
};

module.exports = FSWebCamCamera;
