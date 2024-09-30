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

    let desiredPieces = Infinity; // Default to cutting as many as possible

    // Check if the user wants to specify the desired number of pieces
    const specifyDesiredPieces = document.getElementById('specifyDesiredPieces').checked;
    if (specifyDesiredPieces) {
        const desiredPiecesInput = document.getElementById('desiredPieces').value;
        desiredPieces = parseInt(desiredPiecesInput);
        if (isNaN(desiredPieces) || desiredPieces <= 0) {
            alert('Please enter a valid number of desired pieces.');
            return; // Stop execution if invalid input
        }
    }

    // Convert the comma-separated string of lengths into an array of numbers
    let woodLengths = woodLengthsInput.split(',').map(length => parseFloat(length.trim()));
    woodLengths = woodLengths.filter(length => !isNaN(length) && length > 0); // Validate lengths

    if (woodLengths.length === 0) {
        alert('Please enter valid wood lengths.');
        return; // Stop execution if no valid lengths
    }

    if (isNaN(cutSize) || cutSize <= 0) {
        alert('Please enter a valid cut size.');
        return; // Stop execution if invalid cut size
    }

    // Perform the cutting operation
    const results = oneDCutSorted(woodLengths, cutSize, bladeThickness, desiredPieces);

    // Display results
    const resultsDiv = document.getElementById('cutResults');
    resultsDiv.innerHTML = `Total Pieces: ${results.totalPieces}, Total Waste: ${results.totalWaste.toFixed(2)} feet`;

    if (specifyDesiredPieces && results.totalPieces < desiredPieces) {
        resultsDiv.innerHTML += `<br>Note: Only ${results.totalPieces} pieces could be cut due to insufficient material.`;
    }

    // Generate visualization
    generateOneDVisualization(results.cutDetails, cutSize, bladeThickness);
}


function oneDCutSorted(lengths, targetLength, bladeThickness, desiredPieces) {
    lengths.sort((a, b) => b - a);
    let totalPieces = 0;
    let totalWaste = 0;
    const cutDetails = [];
    const piecesNeeded = desiredPieces || Infinity;

    for (let i = 0; i < lengths.length; i++) {
        let length = lengths[i];
        const originalLength = length;
        const cuts = [];

        while (length >= targetLength && totalPieces < piecesNeeded) {
            cuts.push(targetLength);
            length -= targetLength + bladeThickness;
            totalPieces++;
        }

        if (length > 0) {
            cuts.push(length); // Remaining waste
            totalWaste += length;
        }

        cutDetails.push({ originalLength: originalLength, cuts: cuts });

        if (totalPieces >= piecesNeeded) {
            break;
        }
    }

    return { totalPieces, totalWaste, cutDetails };
}

function generateOneDVisualization(cutDetails, targetLength, bladeThickness) {
    const container = document.getElementById('oneDVisualization');
    container.innerHTML = ''; // Clear previous visualization

    // Calculate the maximum plank length for scaling
    const maxLength = Math.max(...cutDetails.map(d => d.originalLength));

    cutDetails.forEach(detail => {
        const plankDiv = document.createElement('div');
        plankDiv.classList.add('plank');

        const totalLength = detail.originalLength;
        const scaleFactor = 200 / maxLength; // Scale to 200px max height

        // Set the height of the plankDiv
        plankDiv.style.height = `${totalLength * scaleFactor}px`;

        detail.cuts.forEach((cut, index) => {
            const sectionDiv = document.createElement('div');
            const heightPercentage = (cut / totalLength) * 100;

            sectionDiv.style.height = `${heightPercentage}%`;

            // Use tolerance in comparison
            if (Math.abs(cut - targetLength) < 0.0001) {
                sectionDiv.classList.add('usable-section');
            } else {
                sectionDiv.classList.add('waste-section');
            }

            plankDiv.appendChild(sectionDiv);

            if (index < detail.cuts.length - 1) {
                // Add a cut line
                const cutLine = document.createElement('div');
                cutLine.classList.add('cut-line');
                plankDiv.appendChild(cutLine);
            }
        });

        container.appendChild(plankDiv);
    });
}
function loadJSON1D() {
    const fileInput = document.getElementById('fileInput1D');
    fileInput.click();
    fileInput.onchange = e => {
        const file = e.target.files[0];
        if (!file) {
            return;
        }
        const fileReader = new FileReader();
        fileReader.onload = event => {
            try {
                const woodLengthsArray = JSON.parse(event.target.result);
                if (Array.isArray(woodLengthsArray) && woodLengthsArray.every(item => typeof item === 'number')) {
                    // Set the woodLengths input field value
                    document.getElementById('woodLengths').value = woodLengthsArray.join(', ');
                } else {
                    alert('Invalid JSON format. Please provide an array of numbers.');
                }
            } catch (err) {
                alert('Error parsing JSON file.');
            }
        };
        fileReader.readAsText(file);
    };
}


//-----------------------------------

// Event Handlers/Listeners

//-----------------------------------

// Event listener to show/hide desiredPieces input field based on checkbox state
document.addEventListener('DOMContentLoaded', function() {
    const specifyDesiredPiecesCheckbox = document.getElementById('specifyDesiredPieces');
    const desiredPiecesContainer = document.getElementById('desiredPiecesContainer');

    specifyDesiredPiecesCheckbox.addEventListener('change', function() {
        if (this.checked) {
            desiredPiecesContainer.style.display = 'block';
        } else {
            desiredPiecesContainer.style.display = 'none';
            // Clear the input value when hidden
            document.getElementById('desiredPieces').value = '';
        }
    });
});

// Prevent form submission on Enter key press
document.getElementById('rectangleForm').onsubmit = e => e.preventDefault(); // Prevent form from submitting

// Event listener for 1D Cutting Stock Form
document.getElementById('oneDCutForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission
    performOneDCutting();   // Call your function
});

// Event listener for 2D Cutting Stock Form
document.getElementById('rectangleForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission
    addRectangle();         // Call your function
});







