"use strict";

const _ = require('underscore');
const admins = ['joukevandermaas', 'DorisNipo', 'rutger-de-jong', 'hakant'];

class AdminRepository {
    IsUserAdmin(username){
        return _.contains(admins, username);
    }
}

module.exports = new AdminRepository();