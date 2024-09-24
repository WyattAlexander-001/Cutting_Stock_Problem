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
    showModal();
}

function showModal() {
    const modal = document.getElementById('rectangleModal');
    const modalList = document.getElementById('modalRectangleList');
    modalList.innerHTML = ''; // Clear previous entries

    // Group by width and height
    const grouped = groupRectanglesBySize(rectangles);
    Object.keys(grouped).forEach(size => {
        const entry = document.createElement('div');
        entry.classList.add('modal-entry');
        const [width, height] = size.split('x');
        entry.innerHTML = `
            <span>[Width: ${width}, Height: ${height}] x ${grouped[size]}</span>
            <button onclick="editEntry(${width}, ${height})">Edit</button>
            <button onclick="removeEntry(${width}, ${height})">Delete</button>
        `;
        modalList.appendChild(entry);
    });

    modal.style.display = "block";
}

function editEntry(width, height) {
    // This function prompts user to enter new quantity, similar to updateQuantity but with prompt
    const newQuantity = prompt(`Enter new quantity for [Width: ${width}, Height: ${height}]:`, '');
    if(newQuantity !== null) {
        updateQuantity(width, height, parseInt(newQuantity));
    }
}

function updateQuantity(width, height, newQuantity) {
    // Filter out existing entries for this size
    rectangles = rectangles.filter(rect => !(rect.width == width && rect.height == height));

    // Add the new quantity of rectangles
    for (let i = 0; i < newQuantity; i++) {
        rectangles.push({ width: parseInt(width), height: parseInt(height) });
    }
    showModal(); // Refresh the modal to show updated quantities
}

function removeEntry(width, height) {
    rectangles = rectangles.filter(rect => !(rect.width == width && rect.height == height));
    showModal(); // Refresh the modal to show updated list
}


function confirmRectangles() {
    const modal = document.getElementById('rectangleModal');
    modal.style.display = "none";
    updateRectangleList(); // Update the main list with grouped quantities
}


function groupRectanglesBySize(rectangles) {
    const grouping = {};
    rectangles.forEach(rect => {
        const key = `${rect.width}x${rect.height}`;
        if (grouping[key]) {
            grouping[key]++;
        } else {
            grouping[key] = 1;
        }
    });
    return grouping;
}

function confirmRectangles() {
    const modal = document.getElementById('rectangleModal');
    modal.style.display = "none";
    updateRectangleList();
}

// Close the modal when the user clicks on <span> (x)
document.getElementsByClassName("close")[0].onclick = function() {
    const modal = document.getElementById('rectangleModal');
    modal.style.display = "none";
}

// Close the modal if the user clicks outside of it
window.onclick = function(event) {
    const modal = document.getElementById('rectangleModal');
    if (event.target === modal) {
        modal.style.display = "none";
    }
}

function updateRectangleList() {
    const list = document.getElementById('rectangleList');
    list.innerHTML = ''; // Clear existing list

    // Group rectangles by size
    const grouped = groupRectanglesBySize(rectangles);
    Object.keys(grouped).forEach(size => {
        const entry = document.createElement('div');
        const [width, height] = size.split('x');
        const quantity = grouped[size];
        entry.innerHTML = `<span>[Width: ${width}, Height: ${height}] x ${quantity}</span>`;
        
        // Create Edit button
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.onclick = () => editEntry(width, height, quantity);
        
        // Create Delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => removeEntry(width, height);

        entry.appendChild(editButton);
        entry.appendChild(deleteButton);

        list.appendChild(entry);
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

