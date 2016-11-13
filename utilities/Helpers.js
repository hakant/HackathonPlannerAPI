"use strict";
class Helpers {
    ReplacePropertyValuesOf(object, sourceValue, destinationValue) {
        for (var property in object) {
            if (object.hasOwnProperty(property)) {
                if (object[property] !== null && typeof object[property] == "object") {
                    this.ReplacePropertyValuesOf(object[property], sourceValue, destinationValue);
                }
                else {
                    if (object[property] === sourceValue) {
                        object[property] = destinationValue;
                    }
                }
            }
        }
        return object;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Helpers;
//# sourceMappingURL=Helpers.js.map