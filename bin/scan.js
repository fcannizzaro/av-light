var dgram = require('dgram'),
    utils = require('./utils');

module.exports = function(sid, base, onEnd) {

    var scan = true,
        i = 0,
        info = utils.getInfo(base),
        buffer = new Buffer(JSON.stringify({
            cmd: 'status',
            uid: '0',
            sid: sid
        }));

    var fn = function(i) {

        if (!scan)
            return;

        var ip = info.ipBase + (info.startPort + i);

        var client = dgram.createSocket('udp4');

        client.on('message', function(data) {
            if (scan)
                onEnd(sid, ip);
            scan = false;
        });

        client.send(buffer, 0, buffer.length, 14580, ip, function(err, bytes) {});

    }

    while (scan && i < 200) {
        fn(i++);
    }

}