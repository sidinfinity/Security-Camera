var nitrogen = require('../lib'),
    MemoryStore = require('./memoryStore');
   
var config = { 
    host: "localhost",
    protocol: "http",
    http_port: 3050
};

config.store = new MemoryStore(config);

module.exports = config;
