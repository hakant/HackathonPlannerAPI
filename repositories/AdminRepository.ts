"use strict";

import * as _ from 'underscore';
import * as nconf from 'nconf';

const businessRules = nconf.get("BusinessRules");
let admins = businessRules.Administrators; 

export default class AdminRepository implements IAdminRepository {

    IsUserAdmin(username){
        return _.contains(admins, username);
    }

}