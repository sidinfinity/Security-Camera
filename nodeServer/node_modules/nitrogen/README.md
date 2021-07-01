# Nitrogen Client

Nitrogen is a platform for building connected devices.  Nitrogen provides the authentication, authorization, and real time message passing framework so that you can focus on your device and application.  All with a consistent development platform that leverages the ubiquity of Javascript.

This is the client library for developing applications and devices that communicate to the Nitrogen service.

## Device Development Model

Nitrogen at its heart uses messaging between principals (devices and users).  Principals in the system can create and consume messages.  Messages can follow a well known schema to enable interoperability between applications or use their own private custom message types.

For example, a thermometer that measures temperature once every 15 minutes could be implemented in Nitrogen like this:

``` javascript
var thermometer = new nitrogen.Device({
    tags: ['sends:temperature'],
    nickname: 'thermometer'
});

var service = new nitrogen.Service(config);
service.connect(thermometer, function(err, session, thermometer) {

    // take temperature every 15 minutes.

    setInterval(function() {
        var message = new Nitrogen.Message({
            type: 'temperature',
            body: {
                temperature: getTemp()
            }
        });

        message.save(session);
    }, 15 * 60 * 1000);

});
```

You can find a complete example for a device application of Nitrogen in the [camera](https://github.com/nitrogenjs/camera) project.

## Listening to a device's message stream

An application that displays these temperatures in real time as they are received would look like this.  In this case,
we're using a user principal, and a filter with onMessage to only notify us of temperature updates.

``` javascript
var user = new nitrogen.User({...});

var service = new nitrogen.Service(config);
service.connect(user, function(err, session, user) {
    session.onMessage({ type: 'temperature' }, function(message) {
        console.log("The temperature is now: " + message.body.temperature);

        // update the UI
    });
});
```

## Getting Started

To get started with a Nitrogen client:

### Node.js application

1. `npm install nitrogen`

### Browser application

1. Add `<script src="https://api.nitrogen.io/client/nitrogen-min.js" />` to your application.

### Documentation

Documentation for the Nitrogen client library can be found online at the [Nitrogen project](http://nitrogen.io).

### Contributing to the project.

1. Clone or fork this repo: `https://github.com/nitrogenjs/client`
2. If you are building on Windows, make sure to fetch all of the node-gyp dependencies as explained here: https://github.com/TooTallNate/node-gyp#installation
2. Fetch and install its node.js dependencies: `npm install`
3. Run a [Nitrogen server](https://github.com/nitrogenjs/service) locally that the tests can run against in test mode (NODE_ENV=test).
4. Run the tests to make sure everything is setup correctly: `npm test`
5. Make your change as a clean commit for a pull request.
6. Make sure there is a test to cover new functionality so nobody can break it in the future without us knowing.
7. Submit it as a pull request to the project.

## How to contribute

1.  Feedback:  We'd love feedback on what problems you are using Nitrogen to solve.  Obviously, we'd also like to hear about where you ran into sharp edges and dead ends.   Drop me a message at timfpark@gmail.com or file an issue with us above.
2.  Pull requests:  If you'd like to tackle an issue, fork the repo, create a clean commit for the fix or enhancement with tests if necessary, and send us a pull request. This is also the path to becoming a core committer for the project for folks that are interested in contributing in more depth.
3.  Documentation:  Better technical documentation is key to broadening the use of the platform.   We'd love to have more help and this is one of the most valuable contributions you can make.

## Running on Windows

On Windows, you'll need to install some dependencies first:
 - [node-gyp](https://github.com/TooTallNate/node-gyp/) (`npm install -g node-gyp`)
   - [Python 2.7](http://www.python.org/download/releases/2.7.3#download) (not 3.3)
   - Visual Studio 2010 or higher (including Express editions)
     - Windows XP/Vista/7:
       - Microsoft Visual Studio C++ 2010 ([Express](http://go.microsoft.com/?linkid=9709949) version works well)
       - Also install [Microsoft Visual Studio 2010 Service Pack 1](http://www.microsoft.com/en-us/download/details.aspx?displaylang=en&id=23691)
       - For 64-bit builds of node and native modules you will _**also**_ need the [Windows 7 64-bit SDK](http://www.microsoft.com/en-us/download/details.aspx?id=8279)
       - If you get errors that the 64-bit compilers are not installed you may also need the [compiler update for the Windows SDK 7.1](http://www.microsoft.com/en-us/download/details.aspx?id=4422)
     - Windows 8:
       - Microsoft Visual Studio C++ 2012 for Windows Desktop ([Express](http://go.microsoft.com/?linkid=9816758) version works well)
 - [OpenSSL](http://slproweb.com/products/Win32OpenSSL.html) (normal, not light)
   in the same bitness as your Node.js installation.
   - The build script looks for OpenSSL in the default install directory  (`C:\OpenSSL-Win32` or `C:\OpenSSL-Win64`)
   - If you get `Error: The specified module could not be found.`, copy `libeay32.dll` from the OpenSSL bin directory to this module's bin directory, or to Windows\System3.

## Nitrogen Project

The Nitrogen project is housed in a set of GitHub projects:

1. [service](https://github.com/nitrogenjs/service): Core platform responsible for managing principals, security, and messaging.
2. [client](https://github.com/nitrogenjs/client): JavaScript client library for building Nitrogen devices and applications.
3. [admin](https://github.com/nitrogenjs/admin): Administrative tool for managing the Nitrogen service.
4. [device](https://github.com/nitrogenjs/devices): Adaptors for common pieces of hardware.
5. [commands](https://github.com/nitrogenjs/commands): CommandManagers and schemas for well known command types.
6. [cli](https://github.com/nitrogenjs/cli): Command line interface for working with a Nitrogen service.