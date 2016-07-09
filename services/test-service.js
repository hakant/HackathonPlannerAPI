"use strict";

class TestService {

    constructor(){
        this._greetingText = "Hello from ES6 class"; 
    }

    get GreetingText() {
        return this._greetingText;
    }

    Greet() {
        return process.version;
    }
}

module.exports = TestService;