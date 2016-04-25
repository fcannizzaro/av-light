var dgram = require('dgram');

module.exports = function(sid, ip) {

    var request = {
        uid: '0',
        sid: sid
    };

    send = function(cmd, arg) {

        var config = JSON.parse(JSON.stringify(request));
        config.cmd = cmd;
        if (arg) config.arg = arg;

        var buffer = new Buffer(JSON.stringify(config)),
            client = dgram.createSocket('udp4');

        client.send(buffer, 0, buffer.length, 14580, ip, function(err, bytes) {
            client.close();
        });

    }

    this.on = function() {
        send("switch", {
            on: 1
        });
    }

    this.off = function() {
        send("switch", {
            on: 0
        });
    }

    this.color = function(r, g, b) {
        send("color", {
            r: r,
            g: g,
            b: b
        });
    }

    this.brightness = function(lum) {

        if (lum > 255)
            luminosity = 255;

        else if (lum < 0)
            lum = 0;

        send("white", {
            "lum": lum,
            "color-temp": 0
        });
    }

}