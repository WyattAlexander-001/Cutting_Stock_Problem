// testing for script.js

// import functions
const { groupRectanglesBySize, updateQuantity } = require('./script.js');


// groupRectanglesBySize TESTS
describe('groupRectanglesBySize', () => {
    
    test('empty array', () => {
        const rectangles = [];
        const expected = {};
        expect(groupRectanglesBySize(rectangles)).toEqual(expected);
    });

    test('same size rectangles', () => {
        
        const rectangles = [
            { width: 1, height: 1 },
            { width: 1, height: 1 },
            { width: 1, height: 1 }
        ];

        const expected = {
            '1x1': 3
        };

        expect(groupRectanglesBySize(rectangles)).toEqual(expected);
    });

    test('different size rectangles', () => {
        
        const rectangles = [
            { width: 10, height: 5 },
            { width: 1, height: 1 },
            { width: 10, height: 5 },
            { width: 8, height: 4 },
            { width: 10, height: 5 },
            { width: 1, height: 1 }
        ];

        const expected = {
            '10x5': 3,
            '1x1': 2,
            '8x4': 1
        };

        expect(groupRectanglesBySize(rectangles)).toEqual(expected);
    });

    test('negative dimensions', () => {
        
        const rectangles = [
            { width: -1, height: -1 },
            { width: -3, height: -6 },
            { width: -3, height: -6 },
            { width: 4, height: 4 }
        ];
        
        const expected = {
            '-1x-1': 1,
            '-3x-6': 2,
            '4x4': 1
        };
        expect(groupRectanglesBySize(rectangles)).toEqual(expected);
    });

    test('dimension of zero', () => {
        
        const rectangles = [
            { width: 2, height: 0 },
            { width: 0, height: 4 }
        ];
        
        const expected = {
            '2x0': 1,
            '0x4': 1
        };
        expect(groupRectanglesBySize(rectangles)).toEqual(expected);
    });

});

// updateQuantity TESTS

describe('updateQuantity', () => {
    let rectangles;

    beforeEach(() => {
        // Initialize the rectangles array before each test
        rectangles = [
            { width: 10, height: 20 },
            { width: 10, height: 20 },
            { width: 15, height: 25 },
        ];
        global.rectangles = rectangles;
    });

    afterEach(() => {
        rectangles = [];
    });

    test('remove existing entries of the specified size', () => {
        updateQuantity(10, 20, 0);
        expect(global.rectangles).toEqual([{ width: 15, height: 25 }]);
    });

    test('add the correct number of new rectangles', () => {
        updateQuantity(10, 20, 3);
        expect(global.rectangles).toEqual([
            { width: 15, height: 25 },
            { width: 10, height: 20 },
            { width: 10, height: 20 },
            { width: 10, height: 20 },
        ]);
    });
});

// script.js HELPERS TESTS

//import { area, rotate, rotateToLandscape, totalArea } from './script.js';
const { area, rotate, rotateToLandscape, totalArea } = require('./script.js');

// pass in rectangle, calculate area
describe('area', () => {
    test('positive dimensions', () => {
        const rectangle = { width: 5, height: 10 };
        expect(area(rectangle)).toBe(50);
    });

    test('one negative dimension', () => {
        const rectangle = { width: 5, height: -10 };
        expect(area(rectangle)).toBe(-50);
    });

    test('two negative dimensions', () => {
        const rectangle = { width: -5, height: -10 };
        expect(area(rectangle)).toBe(50);
    });

    test('zero dimension', () => {
        const rectangle = { width: 0, height: 10 };
        expect(area(rectangle)).toBe(0);
    });
});

describe('rotate', () => {
    test('positive dimensions', () => {
        const rectangle = { width: 5, height: 10 };
        expect(rotate(rectangle)).toEqual({ height: 5, width: 10 });
    });

    test('one negative dimension', () => {
        const rectangle = { width: 5, height: -10 };
        expect(rotate(rectangle)).toEqual({ height: 5, width: -10 });
    });

    test('zero dimension', () => {
        const rectangle = { width: 0, height: 10 };
        expect(rotate(rectangle)).toEqual({ height: 0, width: 10 });
    });

    test('equal dimensions', () => {
        const rectangle = { width: 5, height: 5 };
        expect(rotate(rectangle)).toEqual({ height: 5, width: 5 });
    });
});

describe('rotateToLandscape', () => {
    test('width is larger', () => {
        const rectangle = { width: 10, height: 5 };
        const rotated = rotateToLandscape(rectangle);
        expect(rotated.width).toBeGreaterThan(rotated.height);
    });

    test('height is larger', () => {
        const rectangle = { width: 5, height: 10 };
        const rotated = rotateToLandscape(rectangle);
        expect(rotated.width).toBeGreaterThan(rotated.height);
    });

    test('equal dimensions', () => {
        const rectangle = { width: 5, height: 5 };
        const rotated = rotateToLandscape(rectangle);
        expect(rotated.width).toEqual(rotated.height);
    });
});

describe('totalArea', () => {
    test('empty array', () => {
        const rectangles = [];
        expect(totalArea(rectangles)).toBe(0);
    });

    test('positive dimensions', () => {
        const rectangles = [
            { width: 5, height: 10 },
            { width: 10, height: 20 },
            { width: 15, height: 25 }
        ];
        expect(totalArea(rectangles)).toBe(625);
    });

    test('negative dimensions', () => {
        const rectangles = [
            { width: -5, height: 10 },
            { width: -10, height: -20 },
            { width: 15, height: -25 }
        ];
        expect(totalArea(rectangles)).toBe(-225);
    });

    test('zero dimensions', () => {
        const rectangles = [
            { width: 3, height: 10 },
            { width: 10, height: 5 },
            { width: 0, height: 9 }
        ];
        expect(totalArea(rectangles)).toBe(80);
    });
});