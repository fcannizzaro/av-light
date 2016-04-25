#!/usr/bin/env node

var bulb = require("./bulb"),
    questions = require("./questions");

questions = new questions(onEnd);
questions.menu();

function onEnd(sid, ip) {
    var light = new bulb(sid, ip);
    questions.set(light, ip);
    questions.lamp();
}