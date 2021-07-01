var assert = require('assert')
  , config = require('../config')
  , fixtures = require('../fixtures')
  , nitrogen = require('../../lib');

describe('session', function() {

    var service = new nitrogen.Service(config);

    it('session should be JSON serializable', function(done) {
        service.connect(fixtures.models.camera, function(err, session) {
            assert(!err);

            // serializing a session with open subscriptions or heartbeats is not supported.
            session.socket = null;
            session.heartbeatTimeout = null;

            var sessionJSON = JSON.stringify(session);
            assert(sessionJSON);

            done();
        });
    });

    it('receiving a set-access-token header should update principal and session access token', function(done) {

        service.connect(fixtures.models.camera, function(err, session) {
            var resp = {
                headers: {
                    "x-n2-set-access-token": JSON.stringify({
                        token: session.accessToken.token,
                        expires_at: new Date(2050, 1, 1),
                        created_at: new Date(),
                        id: '5250453b83dce2433d000008'
                    })
                }
            };

            session.accessToken.token = 'notupdated';

            session.afterRequest(null, resp, null, function(err, resp, body) {
                assert.notEqual(session.accessToken.token, 'notupdated');

                done();
            });
        });
    });

    it('can establish permanent subscription and receive deferred messages', function(done) {

        service.connect(fixtures.models.camera, function(err, session) {
            assert(!err);

            // establish named subscription
            session.on({
                type: 'message',
                filter: { type: '_permSubTest' },
                name: 'permTest'
            }, function(message) {
                // session should be stopped and message should not be received here.
                assert(false);
            });

            setTimeout(function() {

                for (var id in session.subscriptions)
                    session.disconnectSubscription(id);

                setTimeout(function() {
                    service.connect(fixtures.models.camera, function(err, newSession) {
                        assert(!err);

                        // send message while we are disconnected.
                        new nitrogen.Message({
                            type: '_permSubTest'
                        }).send(newSession);

                        setTimeout(function() {
                            // re-establish permanent subscription
                            newSession.on({
                                type: 'message',
                                filter: { type: '_permSubTest' },
                                name: 'permTest'
                            }, function(message) {
                                console.log("got message: " + JSON.stringify(message));
                                // we should receive queued messages from when we were disconnected.
                                if (message.type === '_permSubTest') {
                                    done();
                                }
                            });
                        }, 200);
                    });
                }, 200);
            }, 200);
        });
    });
});
