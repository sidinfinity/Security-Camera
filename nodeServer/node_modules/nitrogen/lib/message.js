/**
 * The Message object is the core of the Nitrogen framework.  Applications, devices, and
 * services use Messages to communicate with and issue commands to each other. All messages
 * that don't begin with an unscore are checked against a schema chosen by the messages 'type'
 * and 'schema_version' fields such that a message of a given type is known to conform to a
 * particular structure.   This enables sharing between differing devices and applications.  For
 * custom message types, an application may use an unscore prefix (eg. '_myMessage') with any
 * schema that they'd like.  This supports communication between principals of the same
 * organization over a private schema.  That said, it is strongly encouraged to use standard
 * schemas wherever possible.
 *
 * Messages have a sender principal (referred to as 'from') and a receiver principal (referred
 * to as 'to'). These fields are used to route messages to their receiver.
 *
 * Message types are divided into two main classes: data and commands.  Data messages carry
 * information, typically the output of a device's operation.  For example, a message typed
 * 'image' contains an image url in its body in its 'url' property.
 *
 * The second class of messages are commands. Command messages are sent from one principal to
 * another to request an operation on the receiving principal.  For example, a message of the
 * type 'cameraCommand' contains a command that directs the operation of a camera principal.
 *
 * @class Message
 * @namespace nitrogen
 */

function Message(json) {
    this.ts = new Date();
    this.body = {};

    for(var key in json) {
        if(json.hasOwnProperty(key)) {
            if (key === 'ts' || key === 'expires' || key === 'index_until')
                this[key] = new Date(Date.parse(json[key]));
            else
                this[key] = json[key];
        }
    }
}

/**
 * Find messages filtered by the passed query and limited to and sorted by the passed options.
 *
 * @method find
 * @async
 * @param {Object} session The session with a Nitrogen service to make this request under.
 * @param {Object} query A query filter for the messages you want to find defined using MongoDB query format.
 * @param {Object} options Options for the query:  'limit': maximum number of results to be returned. 'sort': The field that the results should be sorted on, 'dir': The direction that the results  should be sorted. 'skip': The number of results that should be skipped before pulling results.
 * @param {Function} callback Callback function of the form f(err, messages).
 **/

Message.find = function(session, query, options, callback) {
    if (!session) return callback('no session passed to Message.find');
    if (!callback || typeof(callback) !== 'function') return callback('no callback passed to Message.find.');
    if (!query) query = {};
    if (!options) options = {};

    var messageUrl = session.service.config.endpoints.messages;
    session.get({
        url: messageUrl,
        query: query,
        queryOptions: options,
        json: true
    }, function(err, resp, body) {
        if (err) return callback(err);

        var messages = body.messages.map(function(message) {
            return new Message(message);
        });

        callback(null, messages);
    });
};

/**
 * Returns true if the message is of the passed type.
 *
 * @method is
 * @param {String} type Message type to compare against.
 * @returns {Boolean} Returns true if the message is of the passed type.
 **/

Message.prototype.is = function(type) {
    return this.type === type;
};

/**
 * Returns true if the message is from the passed principal.
 *
 * @method isFrom
 * @param {String} principalId Principal id to compare against.
 * @returns {Boolean} Returns true if the message is from the passed principal id.
 **/

Message.prototype.isFrom = function(principal) {
    return this.from === principal.id;
};

/**
 * Returns true if the message is in response to the passed message.
 *
 * @method isResponseTo
 * @param {String} type Message to compare against.
 * @returns {Boolean} Returns true if the message is in response to the passed message.
 **/

Message.prototype.isResponseTo = function(otherMessage) {
    return otherMessage.id && this.response_to && this.response_to.indexOf(otherMessage.id) !== -1;
};

/**
 * Returns true if the message is of the passed type.
 *
 * @method isTo
 * @param {String} principalId Principal id to compare against.
 * @returns {Boolean} Returns true if the message is of the passed type.
 **/

Message.prototype.isTo = function(principal) {
    return this.to === principal.id;
};

/**
 * Removes a set of messages specified by passed filter. Used by the internal service principal to
 * to cleanup expired messages etc.
 *
 * @method remove
 * @async
 * @static
 * @private
 * @param {Object} session An open session with a Nitrogen service.
 * @param {Object} query A query filter for the messages you want to remove.
 * @param {Function} callback Callback function of the form f(err, removedCount).
 */

Message.remove = function(session, query, callback) {
    session.remove({
        url: session.service.config.endpoints.messages,
        query: query,
        json: true
    }, function(err, resp, body) {
        if (err) return callback(err);
        if (resp.statusCode != 200) return callback(resp.statusCode);

        callback(null, body.removed);
    });
};

/**
 * Remove this message. Used by the internal service principal for cleanup.
 *
 * @method remove
 * @async
 * @private
 * @param {Object} session An open session with a Nitrogen service.
 * @param {Function} callback Callback function of the form f(err, removedCount).
 **/

Message.prototype.remove = function(session, callback) {
    Message.remove(session, { "_id": this.id }, callback || function() {});
};

/**
 * Send this message.
 *
 * @method send
 * @async
 * @param {Object} session An open session with a Nitrogen service.
 * @param {Function} callback Callback function of the form f(err, sentMessages).
 **/

Message.prototype.send = function(session, callback) {
    Message.sendMany(session, [this], callback || function() {});
};

/**
 * Send multiple messages.
 *
 * @method sendMany
 * @async
 * @param {Object} session An open session with a Nitrogen service.
 * @param {Array} messages An array of messages to send.
 * @param {Function} callback Callback function of the form f(err, sentMessages).
 **/

Message.sendMany = function(session, messages, callback) {
    if (!session) return callback('session required for Message.sendMany');

    var self = this;

    Message.queuedMessages.push({
        session: session,
        messages: messages,
        callback: callback
    });

    Message.setupSendTimeout();
};

// TODO: there is an efficiency opportunity here to combine messages sent over the same session into one request.
//
// Challenges:
//          - Would need to do accounting around callbacks to make sure they are all called with the right messages.
//          - How do you handle the case where there is a 400 in one of the blocks but not in another.

Message.backoffMillis = 1;

Message.sendQueue = function() {
    Message.sendTimeout = null;

    var context = Message.queuedMessages[0];
    Message.queuedMessages = Message.queuedMessages.slice(1);

    context.session.post({ url: context.session.service.config.endpoints.messages, json: context.messages }, function(err, resp, body) {
        if (resp && resp.statusCode !== 200) {
            err = err || body.message || resp.statusCode;

            // bad request responses are fatal, otherwise requeue and try again.
            if (resp.statusCode !== 400)
                Message.queuedMessages.unshift(context);
        }

        if (err) {
            Message.backoffMillis *= 4;
            Message.backoffMillis = Math.min((64 + Math.random()) * 1000, Message.backoffMillis)
        } else {
            Message.backoffMillis = 1;
        }

        // if we still have messages in the queue after all of this, set up the next process.
        if (Message.queuedMessages.length) {
            Message.setupSendTimeout();
        }

        if (err) {
            context.session.log.error('sending message failed with error: ' + JSON.stringify(err));
            if (context.callback) context.callback(err);
            return;
        }

        var sentMessages = [];
        body.messages.forEach(function(messageJson) {
            sentMessages.push(new Message(messageJson));
        });

        if (context.callback) context.callback(null, sentMessages);
    });
};

Message.setupSendTimeout = function() {
    var self = this;

    if (!Message.sendTimeout) {
        Message.sendTimeout = setTimeout(function() { self.sendQueue(); }, Message.backoffMillis);
    }
};

Message.queuedMessages = [];
Message.sendTimeout = null;

/**
 * Returns true if the message expired.
 *
 * @method expired
 * @returns {Boolean} Returns true if the message is expired.
 **/

Message.prototype.expired = function() {
    return this.millisToExpiration() < 0;
};

/**
 * Returns the number of milliseconds before this message expires.
 *
 * @method millisToExpiration
 * @returns {Number} Number of milliseconds before this message expires.
 **/

Message.prototype.millisToExpiration = function() {
    return this.expires - new Date().getTime();
};

/**
 * Returns the number of milliseconds before the timestamp for this message.  Used to calculate
 * time to execution for command messages.
 *
 * @method millisToTimestamp
 * @returns {Number} Number of milliseconds before the timestamp for this message.
 **/

Message.prototype.millisToTimestamp = function() {
    return this.ts - new Date().getTime();
};

Message.NEVER_EXPIRE  = new Date(Date.UTC(2500, 0, 1));
Message.INDEX_FOREVER = new Date(Date.UTC(2500, 0, 1));

module.exports = Message;
