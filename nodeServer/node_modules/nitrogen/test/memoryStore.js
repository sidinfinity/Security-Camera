function MemoryStore() {
    this.clear();
}

MemoryStore.prototype.clear = function(callback) {
    this.store = {};
};

MemoryStore.prototype.get = function(key, callback) {
    return callback(null, this.store[key]);
};

MemoryStore.prototype.set = function(key, value, callback) {
    this.store[key] = value;
    if (callback) callback();
};

MemoryStore.prototype.delete = function(key, callback) {
    delete this.store[key];
};

module.exports = MemoryStore;