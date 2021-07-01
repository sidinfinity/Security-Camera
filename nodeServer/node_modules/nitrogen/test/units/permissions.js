var assert = require('assert')
  , config = require('../config')
  , fixtures = require('../fixtures')
  , nitrogen = require('../../lib');

describe('permission', function() {

    it('should be able to create, find, and remove permissions', function(done) {
        var service = new nitrogen.Service(config);
        service.connect(fixtures.models.camera, function(err, session) {
            var permission = new nitrogen.Permission({
                issued_to:     fixtures.models.camera.id,
                principal_for: fixtures.models.camera.id,
                priority:      100000000,
                authorized:    true
            });

            permission.create(session, function(err, permission) {
                assert(!err);
                assert.notEqual(permission.id, undefined);

                nitrogen.Permission.find(session, { issued_to: fixtures.models.camera.id }, {}, function(err, permissions) {
                    assert(!err);
                    var startingLength = permissions.length;

                    assert.equal(startingLength, 2);

                    permission.remove(session, function(err) {
                        assert(!err);

                        nitrogen.Permission.find(session, { issued_to: fixtures.models.camera.id }, {}, function(err, newPermissions) {
                            assert(!err);
                            var endingLength = newPermissions.length;

                            assert.equal(endingLength, startingLength - 1);
                            done();
                        });
                    });
                });
            });
        });
    });
});
