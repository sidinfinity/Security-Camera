var request = require('request')
  , Principal = require('./principal')
  , Session = require('./session')
  , MemoryStore = require('./memoryStore');

/**
 * A Service is a Nitrogen endpoint that a Session is established against for interactions with
 * it.  How that Session is established depends on the Principal type. For device and service
 * principals, authentication is done based on a shared secret between the device and the
 * service.  For user principals, authentication is via email and password. Sessions can also
 * be resumed if the principal has stored an authToken. The Service object is also responsible
 * for querying the headwaiter endpoint to fetch the service endpoints that this Session should
 * use.
 *
 * @class Service
 * @namespace nitrogen
 **/

function Service(config) {
    this.config = config || {};

    if (!this.config.store) this.config.store = new MemoryStore();

    this.config.host = this.config.host || 'api.nitrogen.io';
    this.config.protocol = this.config.protocol || 'https';
    this.config.http_port = this.config.http_port || 443;
    this.config.max_session_lifetime = Service.MAX_SESSION_LIFETIME_DEFAULT;

    this.config.base_url = this.config.protocol + "://" + this.config.host + ":" + this.config.http_port + "/api/v1";

    if (!this.config.endpoints) this.config.endpoints = {};

    for (var key in config.endpoints) {
        this.config.endpoints[key] = config.endpoints[key];
    }

    if (!this.config.endpoints.headwaiter) {
        this.config.endpoints.headwaiter = this.config.base_url + "/headwaiter";
    }

    // Need this for password reset.  Can be overridden by response from headwaiter.
    if (!this.config.endpoints.principals) {
        this.config.endpoints.principals = this.config.base_url + "/principals";
    }

    this.store = config.store;
}

Service.BACKOFF_RATE_MILLIS = 500;
Service.MAXIMUM_BACKOFF_STEPS = 7;

Service.MAX_SESSION_LIFETIME_DEFAULT = 24 * 60 * 60 * 1000; // ms

/**
 * Authenticate this principal with the Nitrogen service.  The mechanism used to authenticate
 * depends on the type of principal. For users, an email and password is used. For other principals
 * public key encryption is verify a signed nonce value for authentication.
 *
 * @method authenticate
 * @async
 * @param {Object} principal The principal to authenticate with this service. The principal should include the email/password for a user principal or the private_key for other principal types.
 * @param {Function} callback Callback function with signature f(err, session, principal).
 **/

Service.prototype.authenticate = function(principal, callback) {
    this.authenticateSession(principal, principal.authenticate, callback);
};

/**
 * Creates the principal with this service.
 *
 * @method create
 * @async
 * @param {Object} principal The principal to create with this service. It should include email/password for user principal types.
 * @param {Function} callback Callback function with signature f(err, session, principal).
 **/

Service.prototype.create = function(principal, callback) {
    this.authenticateSession(principal, principal.create, callback);
};

/**
 * Attempts to resume a session for this principal using a saved accessToken.
 *
 * @method resume
 * @async
 * @param {Object} principal The principal to resume the session with this service.
 * @param {Function} callback Callback function with signature f(err, session, principal).
 **/

Service.prototype.resume = function(principal, callback) {
    if (!this.store) return callback(new Error('No store configured with service.'));

    this.authenticateSession(principal, principal.resume, function(err, session, principal) {
        if (err) return callback(err);

        Principal.findById(session, principal.id, function(err, loadedPrincipal) {
            if (err) return callback(err);

            loadedPrincipal.nickname = principal.nickname;
            return callback(err, session, loadedPrincipal);
        });
    });
};

/**
 * Connect attempts to authenicate the principal with the service. If the principal
 * isn't provisioned with the service, it automatically creates the principal with the
 * service.
 *
 * @method connect
 * @async
 * @param {Object} principal The principal to connect with this service.
 * @param {Function} callback Callback function with signature f(err, session, principal).
 **/

Service.prototype.connect = function(principal, callback) {
    var self = this;

    this.store.get(principal.toStoreId(), function(err, storedPrincipal) {
        if (storedPrincipal) {
            principal.updateAttributes(storedPrincipal);
            self.restartOnFailureAuthWrapper(principal, principal.authenticate, callback);
        } else {
            self.restartOnFailureAuthWrapper(principal, principal.create, callback);
        }
    });
};

function asyncWhilst(test, iterator, callback) {
    if (test()) {
        iterator(function (err) {
            if (err) {
                return callback(err);
            }
            asyncWhilst(test, iterator, callback);
        });
    } else {
        callback();
    }
}

Service.prototype.restartOnFailureAuthWrapper = function(principal, initialOp, sessionCallback) {
    var self = this;
    var authOp = initialOp;

    asyncWhilst(
        function() { return true; },
        function(restartCallback) {
            self.authOpWithRetry(principal, authOp, function(err, session, principal) {
                if (err) return sessionCallback(err);

                session.onFailure(function() {
                    session.log.error('session failure:  restarting');
                    session.stop();

                    authOp = principal.authenticate;
                    return restartCallback();
                });

                return sessionCallback(err, session, principal);
            });
        },
        function(err) {
            // should never get here
        }
    );
};

Service.prototype.authOpWithRetry = function(principal, authOperation, callback) {

    var self = this;
    var failures = 0;
    var successful = false;

    var backoffMillis = 0;

    var err;
    var session;

    asyncWhilst(
        function () { return !successful; },
        function (retryCallback) {

            if (backoffMillis > 0.0)
                console.log('service: retrying auth request after backoff of ' + backoffMillis + ' ms.');

            setTimeout(function() {
                self.authenticateSession(principal, authOperation, function(e, s, p) {
                    successful = !e;
                    err = e;

                    if (!successful) {
                        console.log('service: authentication failed: ' + JSON.stringify(err));

                        failures += 1;
                        console.log('service: ' + failures + ' consecutive auth failures.');

                        var backoffAmount = Math.min(failures, Service.MAXIMUM_BACKOFF_STEPS);

                        backoffMillis = Math.pow(2, backoffAmount) * Service.BACKOFF_RATE_MILLIS * (1 + Math.random());
                        backoffMillis = Math.floor(backoffMillis);
                    } else {
                        session = s;
                        principal = p;
                    }

                    return retryCallback();
                });

            }, backoffMillis);
        },
        function (e) {
            return callback(err, session, principal);
        }
    );
};

/**
 * Internal method to run all the common steps of authentication against a Nitrogen service.
 *
 * @method authenticateSession
 * @async
 * @private
 * @param {Object} principal The principal to connect with this service.
 * @param {Object} authOperation The authorization method on the principal that is used to .
 * @param {Function} callback Callback function with signature f(err, session, principal).
 **/

Service.prototype.authenticateSession = function(principal, authOperation, callback) {
    var self = this;

    this.configure(principal, function(err, config) {
        if (err) return callback(err);

        self.config = config;

        authOperation.bind(principal)(self.config, function(err, principal, accessToken) {
            if (err) return callback(err);

            if (!principal) return callback(new Error("authentication failed: no principal returned"));
            if (!accessToken) return callback(new Error("authentication failed: no accessToken returned"));

            if (self.config.log_levels && self.config.log_levels.indexOf('debug') !== -1) console.log('principal: authenticated.');

            if (principal.claim_code) {
                console.log('This principal (' + principal.id + ') can be claimed using code: ' + principal.claim_code);
            }

            self.store.set(principal.toStoreId(), principal.toStoreObject(), function(err) {
                if (err) return callback(err);

                var session = Session.startSession(self, principal, accessToken);

                if (self.config.max_session_lifetime)
                    setInterval(function() { session.onFailure(); }, config.max_session_lifetime);

                callback(null, session, principal);
            });
        });
    });
};

/**
 * Impersonate a principal using the passed session
 *
 * @method impersonate
 * @async
 * @param {Object} session The session to use to authorize this impersonation
 * @param {Object} principal The principal to impersonate with this service.
 * @param {Function} callback Callback function with signature f(err, session, principal).
 **/

Service.prototype.impersonate = function(session, principalId, callback) {
    var self = this;

    Principal.impersonate(session, principalId, function(err, impersonatedPrincipal, accessToken) {
        if (err) return callback(err);

        impersonatedPrincipal.accessToken = accessToken;

        var impersonatedSession = Session.startSession(self, impersonatedPrincipal, accessToken);

        // configure the impersonatedPrincipal session in case the principal has a different config.
        self.configure(impersonatedPrincipal, function(err, config) {
            if (err) return callback(err);

            impersonatedSession.service.config = config;
            callback(null, impersonatedSession, impersonatedPrincipal);
        });
    });
};

/**
 * Fetch the endpoint configuration for this service for this user. Before authenticating a principal, we first
 * ask the service to return the set of endpoints that we should for this principal to talk to the Nitrogen service.  Note,
 * this might actually not be the same service, as Nitrogen may redirect clients to a different service or different endpoints.
 *
 * @method configure
 * @async
 * @private
 * @param {Object} config The default configuration to use to connect to Nitrogen.
 * @param {Object} principal The principal to use configure this service.
 * @param {Function} callback Callback function with signature f(err, configuration).
 **/

Service.prototype.configure = function(principal, callback) {
    var self = this;
    var headwaiter_url = this.config.endpoints.headwaiter;

    if (principal) {
        if (principal.is('user') && principal.email) {
            headwaiter_url += "?email=" + principal.email;
        } else if (principal.id) {
            headwaiter_url += "?principal_id=" + principal.id;
        }
    }

    request.get({ url: headwaiter_url, json: true }, function(err, resp, body) {
        if (err) return callback(err);
        if (resp.statusCode != 200) return callback(JSON.stringify(body.error) || resp.statusCode);

        for (var key in body.endpoints) {
            self.config.endpoints[key] = body.endpoints[key];
        }

        self.config.nonce = body.nonce;

        callback(null, self.config);
    });
};

/**
 * Clear all of the credentials for a particular principal.
 *
 * @method clearCredentials
 * @private
 * @param {Object} principal The principal to clear credentials for.
 **/

Service.prototype.clearCredentials = function(principal) {
    if (!this.store) return;

    this.store.delete(principal.toStoreId());
};

module.exports = Service;
