// Function to calculate the area of a rectangle
function area(rectangle) {
    return rectangle.width * rectangle.height;
}

// Function to rotate a rectangle (swap its dimensions)
function rotate(rectangle) {
    return { width: rectangle.height, height: rectangle.width };
}

// Function to rotate a rectangle to ensure width > height
function rotateToLandscape(rectangle) {
    if (rectangle.height > rectangle.width) {
        return rotate(rectangle);
    }
    return rectangle;
}

// Function to calculate the total area of multiple rectangles
function totalArea(rectangles) {
    return rectangles.reduce((sum, rectangle) => sum + area(rectangle), 0);
}

// Example use (you would replace the exampleRectangles with your JSON data)
const exampleRectangles = [
    { width: 4, height: 3 },
    { width: 6, height: 7 },
    { width: 8, height: 2 },
    { width: 5, height: 5 }
];

console.log("Total Area:", totalArea(exampleRectangles));
console.log("Rotated to Landscape:", exampleRectangles.map(rotateToLandscape));

