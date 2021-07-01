var assert = require('assert')
  , nitrogen = require('../../lib');

function MockManager() {
    nitrogen.CommandManager.apply(this, arguments);

    this.executedCount = 0;
}

MockManager.prototype = Object.create(nitrogen.CommandManager.prototype);
MockManager.prototype.constructor = nitrogen.CameraManager;

MockManager.prototype.executeCommand = function() {
    this.executedCount += 1;
    this.executing = false;
};

MockManager.prototype.isCommand = function(message) {
    return (message.is('cameraCommand'));
};

MockManager.prototype.isRelevant = function(message) {
    return message.is('cameraCommand') || message.is('image');
};

MockManager.prototype.obsoletes = function(downstreamMsg, upstreamMsg) {
    if (nitrogen.CommandManager.obsoletes(downstreamMsg, upstreamMsg)) return true;
};

describe('commandManager', function() {
    it('should collapse obsolete messages', function(done) {
        var commandManager = new MockManager();

        var messages = [
            new nitrogen.Message({
                id: '1',
                type: 'cameraCommand',
                expires: new Date(2012,6,09,0,0,0),
                body: {
                    command: 'snapshot'
                }
            }),

            new nitrogen.Message({
                id: '2',
                type: 'cameraCommand',
                expires: new Date(new Date().getTime() + 2 * 3600 * 1000),
                body: {
                    command: 'snapshot',
                    message: {
                        tags: ['timeElapsed'],
                        expires: 'never'
                    }
                }
            })
        ];

	    messages.forEach(function(message) { commandManager.process(message); });

        commandManager.collapse();

        assert.equal(commandManager.messageQueue.length, 1);
        assert.equal(commandManager.messageQueue[0].id, '2');

        done();
    });
});
