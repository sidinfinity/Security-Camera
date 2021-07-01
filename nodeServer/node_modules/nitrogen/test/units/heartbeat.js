var assert = require('assert')
  , config = require('../config')
  , fixtures = require('../fixtures')
  , nitrogen = require('../../lib');

describe('heartbeat', function() {

    it('should be able to send a heartbeat', function(done) {
        var service = new nitrogen.Service(config);

        service.connect(fixtures.models.camera, function(err, session, principal) {
            assert(!err);

            session.onMessage({ type: 'heartbeat' }, function(message) {
                if (message.from === session.principal.id) {
                    done();
                }
            });

            setTimeout(function() {
                session.sendHeartbeat(function(err) {
                    assert(!err);
                });
            }, 200);
        });
    });

});