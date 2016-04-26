var dgram = require('dgram'),
    utils = require('./utils'),
    emitter = require('events');

module.exports = function(base) {

    var ev = new emitter(),
        devices = {},
        buffer = new utils.toBuffer({
            cmd: 'devfind'
        }),
        info = utils.getInfo(base);

    var fn = function(i) {

        var ip = info.ipBase + (info.startPort + i),
            client = dgram.createSocket('udp4');

        client.on('message', function(data) {
            var json = JSON.parse(data.toString());
            ev.emit("device", {
                ip: ip,
                name: json.arg.devname,
                sid: json.arg.sid
            });
        });

        client.send(buffer, 0, buffer.length, 14580, ip, function(err, bytes) {});
    }

    for (var i = 0; i < 100; i++)
        fn(i);

    return ev;
}