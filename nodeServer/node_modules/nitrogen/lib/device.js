var Principal = require('./principal');

/**
 * Device is a subclass of principal that houses all device specific principal functionality.
 *
 * @class Device
 * @namespace nitrogen
 */

function Device() {
    Principal.apply(this, arguments);

    this.type = 'device';
}

Device.prototype = Object.create(Principal.prototype);
Device.prototype.constructor = Device;

module.exports = Device;