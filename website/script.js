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

document.getElementById('width').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent the default form submission
        addRectangle();
    }
});

document.getElementById('height').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent the default form submission
        addRectangle();
    }
});

document.getElementById('quantity').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent the default form submission
        addRectangle();
    }
});

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('rectangleForm').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent the default form submission
            addRectangle();
        }
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

