var dgram = require('dgram');

module.exports = function(sid, base, onEnd) {

    var scan = true,

        ipBase = base.substr(0, base.lastIndexOf(".")) + ".",
        buffer = new Buffer(JSON.stringify({
            cmd: 'status',
            uid: '0',
            sid: sid
        }));

    function recall(i) {

        if (!scan)
            return;

        var ip = ipBase + (100 + i);

        var client = dgram.createSocket('udp4');

        client.on('message', function(data) {
            if (scan)
                onEnd(sid, ip);
            scan = false;
        });

        client.send(buffer, 0, buffer.length, 14580, ip, function(err, bytes) {
            setTimeout(function() {
                client.close();
                recall(++i);
            }, 250);
        });

    }

    recall(0);

}