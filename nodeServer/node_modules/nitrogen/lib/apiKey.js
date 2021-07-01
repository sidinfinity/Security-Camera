/**
 * An ApiKey in Nitrogen is a key that enables non-user principals to be created in the system.
 *
 * A permission has the following properties:
 *     owner: The principal id that owns this api key.
 *     key: The opaque key that should be used by the client as the api_key on requests
 * @class ApiKey
 * @namespace nitrogen
 **/

function ApiKey(json) {
    for(var key in json) {
        if(json.hasOwnProperty(key)) {
            this[key] = json[key];
        }
    }
}

/**
 * Find all the api_keys for the authenticated user.
 *
 * @method index
 * @async
 * @param {Object} session An open session with a Nitrogen service. Only user principals will return results.
 * @param {Object} query A query filter for the apiKeys defined using MongoDB's query format.  (reserved: currently ignored)
 * @param {Object} options Options for the query (reserved, currently ignored):  'limit': maximum number of results to be returned. 'sort': The field that the results should be sorted on, 'dir': The direction that the results  should be sorted. 'skip': The number of results that should be skipped before pulling results.
 * @param {Function} callback Callback function of the form f(err, permissions).
 **/

ApiKey.find = function(session, query, options, callback) {
    if (!session) return callback(new Error("Session required for ApiKey.index."));
    if (!callback || typeof callback !== 'function') return callback(new Error('Callback required for ApiKey.index.'));

    session.get({
        url: session.service.config.endpoints.api_keys,
        json: true
    }, function(err, resp, body) {
        if (err) return callback(err);

        var apiKeys = body.api_keys.map(function(apiKey) {
            return new ApiKey(apiKey);
        });

        callback(null, apiKeys);
    });
};

/**
 * Create an API key.
 *
 * @method create
 * @param {Object} session An open session with a Nitrogen service.
 * @param {Function} callback Callback function of the form f(err, apiKey).
 **/

ApiKey.prototype.create = function(session, callback) {
    var self = this;

    session.post({ url: session.service.config.endpoints.api_keys, json: this }, function(err, resp, body) {
        if (err) return callback(err);
        if (resp.statusCode != 200) return callback(body.error || resp.statusCode);

        return callback(null, new ApiKey(body.api_key));
    });
};

module.exports = ApiKey;