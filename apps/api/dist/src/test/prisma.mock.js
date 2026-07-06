"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPrismaMock = createPrismaMock;
exports.resetPrismaMock = resetPrismaMock;
const jest_mock_extended_1 = require("jest-mock-extended");
function createPrismaMock() {
    return (0, jest_mock_extended_1.mockDeep)();
}
function resetPrismaMock(mock) {
    (0, jest_mock_extended_1.mockReset)(mock);
}
//# sourceMappingURL=prisma.mock.js.map