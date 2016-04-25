var inquirer = require('inquirer'),
    scan = require("./scan"),
    find = require("./find"),
    fs = require("fs"),
    clear = require("cli-clear"),
    filename = require("os").homedir() + "/.light_bulb";

module.exports = function(onEnd) {

    var light, ip, config, name, sid;

    try {
        config = JSON.parse(fs.readFileSync(filename).toString()) || {};
    } catch (err) {
        config = {};
    }

    this.set = function(_light, _ip) {
        light = _light;
        ip = _ip;
    }

    var _scan = function() {
        new scan(sid, config.ip, onEnd);
    }

    var color = function() {

        inquirer.prompt([{
            type: 'input',
            name: 'r',
            message: 'Red [0-255] ?'
        }, {
            type: 'input',
            name: 'g',
            message: 'Green [0-255] ?'
        }, {
            type: 'input',
            name: 'b',
            message: 'Blue [0-255] ?'
        }]).then(function(answers) {

            var r = answers.r,
                g = answers.g,
                b = answers.b;

            if (r != "" && g != "" && b != "")
                light.color(parseInt(r), parseInt(g), parseInt(b));

            onEnd(sid, ip);

        });
    }

    var brightness = function() {
        inquirer.prompt({
            type: 'input',
            name: 'lum',
            message: 'Brightness [0-255] ?'
        }).then(function(answers) {
            light.brightness(parseInt(answers.lum));
            onEnd(sid, ip);
        });
    }

    var onAdd = function(devices) {

        clear();
        var array = [];

        for (var key in devices)
            array.push(key + "\t" + devices[key].name);

        console.log("\n > finding light bulbs...\n");

        inquirer.prompt({
            type: 'list',
            name: 'lamp',
            message: 'Add Lamp',
            choices: array
        }).then(function(results) {

            if (!config.lamps) config.lamps = {};

            inquirer.prompt([{
                type: 'input',
                name: 'name',
                message: 'Name ?'
            }]).then(function(answers) {

                var ip = results.lamp.split("\t")[0];

                if (answers.name.trim())
                    config.lamps[answers.name] = devices[ip].sid;

                save();
                menu();

            });

        });

    }

    var add = function() {

        var devices = {};

        new find(config.ip).on("device", function(device) {
            devices[device.ip] = device;
            onAdd(devices);
        });
    }

    var choose = function() {
        var keys = config.lamps ? Object.keys(config.lamps) : [];
        if (keys.length > 0)
            inquirer.prompt({
                type: 'list',
                name: 'lamp',
                message: 'Choose Lamp',
                choices: keys
            }).then(function(answers) {
                name = answers.lamp;
                sid = config.lamps[name];
                _scan();
            });
        else
            add();
    }

    var remove = function() {
        inquirer.prompt({
            type: 'list',
            name: 'lamp',
            message: 'Remove Lamp',
            choices: Object.keys(config.lamps)
        }).then(function(answers) {
            delete config.lamps[answers.lamp];
            save();
            menu();
        });
    }

    var ip = function() {
        inquirer.prompt([{
            type: 'input',
            name: 'ip',
            message: 'Base IP (ex. 192.168.1.100) ?'
        }]).then(function(answers) {
            config.ip = answers.ip;
            save();
            menu();
        });
    }

    var menu = function() {
        clear();
        inquirer.prompt({
            type: 'list',
            name: 'action',
            message: 'Avantek LightBulb CLI',
            choices: [
                new inquirer.Separator(),
                'add lamp',
                'choose lamp',
                'remove lamp',
                new inquirer.Separator(),
                'set base ip',
                'exit',
                new inquirer.Separator()
            ]
        }).then(function(answers) {

            switch (answers.action) {

                case "add lamp":
                    add();
                    break;

                case "choose lamp":
                    choose();
                    break;

                case "remove lamp":
                    remove();
                    break;

                case "set base ip":
                    ip();
                    break;

                case "exit":
                    clear();
                    process.exit(0);
                    break;
            }
        });
    }

    var lamp = function() {
        clear();
        inquirer.prompt({
            type: 'list',
            name: 'action',
            message: 'Lamp [' + name + ']',
            choices: [
                new inquirer.Separator(),
                'turn on',
                'turn off',
                'set color',
                'set brightness',
                new inquirer.Separator(),
                'choose lamp',
                'go back',
                new inquirer.Separator(),

            ]
        }).then(function(answers) {

            var action = answers.action;

            switch (action) {

                case "turn on":
                    light.on();
                    break;

                case "turn off":
                    light.off();
                    break;

                case "set color":
                    color();
                    break;

                case "set brightness":
                    brightness();
                    break;

                case "choose lamp":
                    choose();
                    break;

                case "go back":
                    menu();
                    break;

            }

            if (action.indexOf("turn") >= 0)
                onEnd(sid, ip);

        });

    }

    function save() {
        fs.writeFileSync(filename, JSON.stringify(config, null, 2), "utf-8");
    }

    this.menu = menu;
    this.lamp = lamp;

}