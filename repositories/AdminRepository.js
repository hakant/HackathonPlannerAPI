"use strict";
const _ = require('underscore');
const nconf = require('nconf');
const businessRules = nconf.get("BusinessRules");
let admins = businessRules.Administrators;
class AdminRepository {
    IsUserAdmin(username) {
        return _.contains(admins, username);
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AdminRepository;
//# sourceMappingURL=AdminRepository.js.map