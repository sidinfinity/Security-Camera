var assert = require('assert')
  , config = require('../config')
  , fixtures = require('../fixtures')
  ,	fs = require('fs')
  , nitrogen = require('../../lib');

describe('blob object', function() {

	it('should be able to save and get a blob', function(done) {
        var service = new nitrogen.Service(config);

        service.connect(fixtures.models.camera, function(err, session) {
            assert(!err);

            var blob = new nitrogen.Blob({
                content_type: 'image/jpeg'
            });

            blob.save(session, fs.createReadStream('test/fixtures/images/image.jpg'), function(err, blob) {
                assert(!err);

                assert(blob.url);
                assert(blob.link);
                assert.equal(blob.url.slice(-(blob.id.length+1)), "/" + blob.id);

                session.get({ url: blob.url }, function(err, resp, blobData) {
                    assert(!err);
                    assert.equal(resp.statusCode, 200);
                    assert.equal(blobData.length, 28014);
                    done();
                });
            });
        });
	});
});
