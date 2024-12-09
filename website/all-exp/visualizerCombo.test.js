//import functions
const { processItemData, processGuillotineAlgorithm, processShelfAlgorithm } = require('./visualizerCombo.js');

//define datasets for testing
const testCases = [
    {
        items: [
            { width: 10, height: 20 },
            { width: 10, height: 20 },
            { width: 15, height: 20 },
            { width: 15, height: 25 }
        ],
        binSizes: [
            { binWidth: 50, binHeight: 50, area: 2500 }
        ],
        expected: 'expected result 1' // if there is an expected result
    },

    {
        items: [
            { width: 8, height: 15 },
            { width: 8, height: 15 },
            { width: 20, height: 12 },
            { width: 20, height: 12 },
            { width: 10, height: 30 },
            { width: 25, height: 25 },
            { width: 25, height: 25 }
        ],
        binSizes: [
            { binWidth: 100, binHeight: 150, area: 15000 }
        ],
        expected: 'expected result 2'
    },

    {
        items: [
            { width: 10, height: 20 },
            { width: 10, height: 20 },
            { width: 10, height: 20 },
            { width: 10, height: 20 },
            { width: 16, height: 20 },
            { width: 16, height: 20 },
            { width: 16, height: 25 },
            { width: 16, height: 25 },
            { width: 30, height: 25 },
            { width: 40, height: 40 },
            { width: 40, height: 40 }
        ],
        binSizes: [
            { binWidth: 200, binHeight: 300, area: 60000 }
        ],
        expected: 'expected result 1' // if there is an expected result
    },
];


describe('processGuillotineAlgorithm', () => {
    test.each(testCases)('should process items and bin sizes correctly', ({ items, binSizes }) => {
        const result = processGuillotineAlgorithm(items, binSizes);
        expect(result).toBeDefined();
        console.log('Guillotine ' + result);
    });
});

describe('processShelfAlgorithm', () => {
    test.each(testCases)('should process items and bin sizes correctly', ({ items, binSizes }) => {
        const result = processShelfAlgorithm(items, binSizes);
        expect(result).toBeDefined();
        console.log('Shelf ' + result);
    });
});