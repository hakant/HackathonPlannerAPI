"use strict";
class CommandHandlerContainer {
    constructor() {
        this.kernel = {};
    }
    RegisterHandler(request, handler) {
        let requestKey = this.GetTypeName(new request());
        this.kernel[`${requestKey}`] = handler;
    }
    RegisterAsyncHandler(request, handler) {
        let requestKey = this.GetTypeName(new request());
        this.kernel[`async-${requestKey}`] = handler;
    }
    ResolveHandler(request) {
        let requestKey = this.GetTypeName(request);
        return this.kernel[`${requestKey}`];
    }
    ResolveAsyncHandler(request) {
        let requestKey = this.GetTypeName(request);
        return this.kernel[`async-${requestKey}`];
    }
    GetTypeName(request) {
        return request.constructor['name'].toLowerCase();
    }
}
let singletonContainer = new CommandHandlerContainer();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = singletonContainer;
//# sourceMappingURL=command-handler-container.js.map