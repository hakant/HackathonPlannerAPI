"use strict";

const _ = require('underscore');
const nconf = require("nconf");

const businessRules = nconf.get("BusinessRules");
let admins = businessRules.Administrators; 

class AdminRepository {
    IsUserAdmin(username){
        return _.contains(admins, username);
    }
}

module.exports = new AdminRepository();