var assert = require('assert')
  ,	config = require('../config')
  ,	nitrogen = require('../../lib');

describe('user', function() {
    var service = new nitrogen.Service(config);

    it('should be able to create and save a user', function(done) {
        var user = new nitrogen.User({
            nickname: "user",
            password: "sEcReT44"
        });

        user.email = "user" + Math.random() * 1000000 + "@gmail.com";
        user.name = "Joe Smith";

        assert.equal(user.nickname, 'user');
        assert.equal(user.type, 'user');

        // clear the principal first so we are not just testing loading from it.
        service.store.set('principal.user', null);
        service.create(user, function(err, session, principal) {
            assert.equal(err, null);

            assert(principal.api_key);
            assert(principal.id);
            assert(principal.email);
            assert(principal.nickname);

            principal.name = "Jane Smith";
            principal.save(session, function(err, p) {
                assert(!err);

                assert.equal(p.name, "Jane Smith");

                session.service.clearCredentials(session.principal);
                session.service.store.get(session.principal.toStoreId(), function(err, value) {
                    assert(!err);
                    assert.equal(value, null);
                    done();

                });
            });

        });

    });
});
