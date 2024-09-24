//-----------------------------------

// UI ELEMENTS

//-----------------------------------


let rectangles = [];

function addRectangle() {
    const width = document.getElementById('width').value;
    const height = document.getElementById('height').value;
    const quantity = parseInt(document.getElementById('quantity').value);
    for (let i = 0; i < quantity; i++) {
        rectangles.push({ width: parseInt(width), height: parseInt(height) });
    }
    updateRectangleList();
}

function updateRectangleList() {
    const list = document.getElementById('rectangleList');
    list.innerHTML = ''; // Clear existing list
    rectangles.forEach((rect, index) => {
        const rectElement = document.createElement('div');
        rectElement.textContent = `Width: ${rect.width}, Height: ${rect.height}`;
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => {
            rectangles.splice(index, 1);
            updateRectangleList();
        };
        rectElement.appendChild(deleteButton);
        list.appendChild(rectElement);
    });
}

function clearAllRectangles() {
    rectangles = []; // Clear the internal state array
    updateRectangleList(); // Update the UI to reflect the empty list
}


function loadJSON() {
    const fileInput = document.getElementById('fileInput');
    fileInput.click();
    fileInput.onchange = e => {
        const fileReader = new FileReader();
        fileReader.onload = event => {
            rectangles = JSON.parse(event.target.result);
            updateRectangleList();
        };
        fileReader.readAsText(e.target.files[0]);
    };
}

function calculateTotalArea() {
    const totalAreaValue = totalArea(rectangles); 
    console.log('Total Area:', totalAreaValue);
}


document.getElementById('rectangleForm').onsubmit = e => e.preventDefault(); // Prevent form from submitting

document.addEventListener('DOMContentLoaded', function() {
    // Listen for keypress events on the width, height, and quantity inputs specifically
    ['width', 'height', 'quantity'].forEach(id => {
        document.getElementById(id).addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault(); // Prevent the default form submission
                addRectangle();  // Call to add a rectangle when Enter is pressed
            }
        });
    });
});






//-----------------------------------

// HELPERS

//-----------------------------------




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


//-----------------------------------

// One-Dimensional Algo

//-----------------------------------

function performOneDCutting() {
    const woodLengthsInput = document.getElementById('woodLengths').value;
    const cutSize = parseFloat(document.getElementById('cutSize').value);
    const bladeThicknessInches = parseFloat(document.getElementById('bladeThickness').value);
    const bladeThickness = bladeThicknessInches / 12; // Convert inches to feet

    // Convert the comma-separated string of lengths into an array of numbers
    const woodLengths = woodLengthsInput.split(',').map(length => parseFloat(length.trim()));

    // Perform the cutting operation
    const results = oneDCutSorted(woodLengths, cutSize, bladeThickness);

    // Display results
    const resultsDiv = document.getElementById('cutResults');
    resultsDiv.innerHTML = `Total Pieces: ${results.totalPieces}, Total Waste: ${results.waste.toFixed(2)} feet`;
}

function oneDCutSorted(lengths, targetLength, bladeThickness) {
    lengths.sort((a, b) => b - a); // Sort in descending order
    let totalPieces = 0;
    let waste = 0;

    lengths.forEach(length => {
        while (length >= targetLength) {
            length -= targetLength + bladeThickness;
            totalPieces++;
        }
        waste += length;
    });

    return { totalPieces, totalPieces, waste };
}

