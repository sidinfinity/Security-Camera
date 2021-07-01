var assert = require('assert')
  , config = require('../config')
  , fixtures = require('../fixtures')
  , nitrogen = require('../../lib');

describe('device', function() {

    it('should be able to create a device', function(done) {
        var service = new nitrogen.Service(config);

        var device = new nitrogen.Device({
            nickname: "camera",
            api_key: fixtures.models.userApiKey.key
        });

        service.connect(device, function(err, session, principal) {
            assert(!err);

            assert(principal.id);
            assert(principal.nickname);

            done();
        });
    });

});
