"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const command_handler_container_1 = require("./command-handler-container");
class Application {
    Execute(request) {
        let handler = command_handler_container_1.default.ResolveHandler(request);
        return handler.Handle(request);
    }
    ExecuteAsync(request) {
        return __awaiter(this, void 0, void 0, function* () {
            let handler = command_handler_container_1.default.ResolveAsyncHandler(request);
            return yield handler.HandleAsync(request);
        });
    }
}
let application = new Application();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = application;
//# sourceMappingURL=application.js.map