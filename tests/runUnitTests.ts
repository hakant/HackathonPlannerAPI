var Jasmine = require('jasmine');
var jas = new Jasmine();

jas.loadConfigFile('./tests/unit/jasmine.json');
jas.execute();