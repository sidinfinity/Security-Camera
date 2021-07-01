var Principal = require('./principal')
  , request = require('request');

/**
 * User is a subclass of principal that houses all user specific principal functionality.
 *
 * @class User
 * @namespace nitrogen
 */

function User() {
    Principal.apply(this, arguments);

    this.type = 'user';
}

User.prototype = Object.create(Principal.prototype);
User.prototype.constructor = User;

module.exports = User;