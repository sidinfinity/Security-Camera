var assert = require('assert'),
    FSWebCamCamera = require('../../lib');

describe('FSWebCamCamera', function() {

    it('should be able to take a photo.', function(done) {
	var camera = new FSWebCamCamera();
	camera.snapshot({ path: "test.jpg" }, function(err) {
	    assert.ifError(err);
	    done();
        });	
    });

});
