//-----------------------------------

// Dynamic Desired Cuts Handling

//-----------------------------------

// Function to add a new desired cut input set
function addDesiredCut() {
    const container = document.getElementById('desiredCutsContainer');
    const cutCount = container.getElementsByClassName('desired-cut').length + 1;

    const cutDiv = document.createElement('div');
    cutDiv.classList.add('desired-cut');

    cutDiv.innerHTML = `
        <label for="cutSize${cutCount}">Cut Size (feet):</label>
        <input type="number" name="cutSizes" class="cutSize" step="0.01" required>

        <label for="cutQuantity${cutCount}">Quantity:</label>
        <input type="number" name="cutQuantities" class="cutQuantity" min="1" required>

        <button type="button" class="removeCut">Remove</button>
    `;

    container.appendChild(cutDiv);
}

// Function to remove a desired cut input set
function removeDesiredCut(event) {
    if (event.target.classList.contains('removeCut')) {
        const cutDiv = event.target.parentElement;
        cutDiv.remove();
    }
}

// Event Listener for Adding Cuts
document.getElementById('addCut').addEventListener('click', addDesiredCut);

// Event Listener for Removing Cuts
document.getElementById('desiredCutsContainer').addEventListener('click', removeDesiredCut);

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
            try {
                const data = JSON.parse(event.target.result);
                if(Array.isArray(data)){
                    rectangles = data;
                    updateRectangleList();
                } else {
                    alert('Invalid JSON format for rectangles.');
                }
            } catch (err) {
                alert('Error parsing JSON file.');
            }
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
    const bladeThicknessInches = parseFloat(document.getElementById('bladeThickness').value);
    const bladeThickness = bladeThicknessInches / 12; // Convert inches to feet

    // Retrieve desired cuts
    const cutSizeElements = document.getElementsByName('cutSizes');
    const cutQuantityElements = document.getElementsByName('cutQuantities');

    const desiredCuts = [];
    for (let i = 0; i < cutSizeElements.length; i++) {
        const size = parseFloat(cutSizeElements[i].value);
        const quantity = parseInt(cutQuantityElements[i].value);
        if (isNaN(size) || size <= 0 || isNaN(quantity) || quantity <= 0) {
            alert('Please enter valid cut sizes and quantities.');
            return;
        }
        desiredCuts.push({ size, quantity });
    }

    // Sort desired cuts by size descending for better optimization
    desiredCuts.sort((a, b) => b.size - a.size);

    // Convert the comma-separated string of lengths into an array of numbers
    let woodLengths = woodLengthsInput.split(',').map(length => parseFloat(length.trim()));
    woodLengths = woodLengths.filter(length => !isNaN(length) && length > 0); // Validate lengths

    if (woodLengths.length === 0) {
        alert('Please enter valid wood lengths.');
        return; // Stop execution if no valid lengths
    }

    // Perform the cutting operation
    const results = multiCutSorted(woodLengths, desiredCuts, bladeThickness);

    // Display results
    const resultsDiv = document.getElementById('cutResults');
    resultsDiv.innerHTML = '';

    desiredCuts.forEach(desired => {
        const achieved = results.cuts[desired.size] || 0;
        resultsDiv.innerHTML += `<p>Desired: ${desired.quantity} x ${desired.size} ft | Achieved: ${achieved} pieces</p>`;
    });

    resultsDiv.innerHTML += `<p>Total Waste: ${results.totalWaste.toFixed(2)} feet</p>`;

    // Generate visualization
    generateOneDVisualization(results.cutDetails, desiredCuts, bladeThickness);
}

function multiCutSorted(lengths, desiredCuts, bladeThickness) {
    // Initialize results
    let totalWaste = 0;
    const cutDetails = [];
    const cuts = {}; // To track achieved cuts per desired size

    // Clone desiredCuts to keep track of remaining quantities
    const remainingCuts = desiredCuts.map(cut => ({ ...cut }));

    // Sort wood lengths descending
    lengths.sort((a, b) => b - a);

    for (let i = 0; i < lengths.length; i++) {
        let length = lengths[i];
        const originalLength = length;
        const currentCuts = [];

        for (let j = 0; j < remainingCuts.length; j++) {
            const desired = remainingCuts[j];
            while (desired.quantity > 0 && length >= desired.size + bladeThickness) {
                currentCuts.push(desired.size);
                length -= (desired.size + bladeThickness);
                desired.quantity--;
                // Track achieved cuts
                cuts[desired.size] = (cuts[desired.size] || 0) + 1;
            }
        }

        // Any remaining length is waste
        if (length > 0) {
            currentCuts.push(length); // Remaining waste
            totalWaste += length;
        }

        cutDetails.push({ originalLength: originalLength, cuts: currentCuts });

        // If all desired cuts are fulfilled, break
        if (remainingCuts.every(cut => cut.quantity === 0)) {
            break;
        }
    }

    // Calculate total achieved pieces
    // Already tracked in 'cuts' object

    return { cuts, totalWaste, cutDetails };
}

function generateOneDVisualization(cutDetails, desiredCuts, bladeThickness) {
    const container = document.getElementById('oneDVisualization');
    container.innerHTML = ''; // Clear previous visualization

    // Prepare green color mapping for different cut sizes
    const colors = generateGreenShades(desiredCuts.length);
    const sizeColorMap = {};
    desiredCuts.forEach((cut, index) => {
        sizeColorMap[cut.size] = colors[index];
    });
    const wasteColor = '#e0e0e0'; // Light gray for waste

    // Calculate the maximum plank length for scaling
    const maxLength = Math.max(...cutDetails.map(d => d.originalLength));

    cutDetails.forEach(detail => {
        // Create a container for the plank and label
        const plankContainer = document.createElement('div');
        plankContainer.classList.add('plank-container');

        const plankDiv = document.createElement('div');
        plankDiv.classList.add('plank');

        const totalLength = detail.originalLength;
        const scaleFactor = 300 / maxLength; // Adjusted for better visualization

        // Set the height of the plankDiv
        plankDiv.style.height = `${totalLength * scaleFactor}px`;

        detail.cuts.forEach((cut, index) => {
            const sectionDiv = document.createElement('div');
            const heightPercentage = (cut / totalLength) * 100;

            sectionDiv.style.height = `${heightPercentage}%`;
            sectionDiv.style.width = '100%';
            sectionDiv.style.position = 'relative'; // For label positioning

            // Determine the color based on cut size
            if (sizeColorMap[cut]) {
                sectionDiv.style.backgroundColor = sizeColorMap[cut];
                // Add label
                const label = document.createElement('span');
                label.classList.add('cut-label');
                label.innerText = `${cut} ft`;
                sectionDiv.appendChild(label);
            } else {
                // Waste
                sectionDiv.style.backgroundColor = wasteColor;
                // Add label
                const label = document.createElement('span');
                label.classList.add('cut-label');
                label.innerText = `Waste: ${cut.toFixed(2)} ft`;
                sectionDiv.appendChild(label);
            }

            plankDiv.appendChild(sectionDiv);

            if (index < detail.cuts.length - 1) {
                // Add a single dark green cut line
                const cutLine = document.createElement('div');
                cutLine.classList.add('cut-line');
                plankDiv.appendChild(cutLine);
            }
        });

        // Append the plankDiv to the plankContainer
        plankContainer.appendChild(plankDiv);

        // Create a label for the plank length
        const lengthLabel = document.createElement('div');
        lengthLabel.classList.add('length-label');
        lengthLabel.innerText = `${totalLength} ft`;

        // Append the label to the plankContainer
        plankContainer.appendChild(lengthLabel);

        // Append the plankContainer to the main container
        container.appendChild(plankContainer);
    });
}

// Helper function to generate green shades
function generateGreenShades(count) {
    const colors = [];
    const hue = 120; // Green hue in HSL
    const saturation = 60; // Percentage
    const lightnessStart = 40; // Starting lightness
    const lightnessEnd = 70; // Ending lightness
    const step = (lightnessEnd - lightnessStart) / (count > 1 ? count - 1 : 1);

    for (let i = 0; i < count; i++) {
        const lightness = lightnessStart + step * i;
        colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }

    return colors;
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
                const data = JSON.parse(event.target.result);
                if (
                    Array.isArray(data.woodLengths) &&
                    Array.isArray(data.desiredCuts) &&
                    typeof data.bladeThickness === 'number'
                ) {
                    // Set the woodLengths input field value
                    document.getElementById('woodLengths').value = data.woodLengths.join(', ');

                    // Clear existing desired cuts
                    const container = document.getElementById('desiredCutsContainer');
                    container.innerHTML = '<h3>Desired Cuts:</h3>';

                    // Populate desired cuts from JSON
                    data.desiredCuts.forEach(cut => {
                        if (typeof cut.size === 'number' && typeof cut.quantity === 'number') {
                            const cutDiv = document.createElement('div');
                            cutDiv.classList.add('desired-cut');

                            cutDiv.innerHTML = `
                                <label>Cut Size (feet):</label>
                                <input type="number" name="cutSizes" class="cutSize" step="0.01" value="${cut.size}" required>

                                <label>Quantity:</label>
                                <input type="number" name="cutQuantities" class="cutQuantity" min="1" value="${cut.quantity}" required>

                                <button type="button" class="removeCut">Remove</button>
                            `;
                            container.appendChild(cutDiv);
                        }
                    });

                    // Set blade thickness
                    document.getElementById('bladeThickness').value = data.bladeThickness;

                } else {
                    alert('Invalid JSON format. Please provide woodLengths, desiredCuts, and bladeThickness.');
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

    if(specifyDesiredPiecesCheckbox && desiredPiecesContainer){
        specifyDesiredPiecesCheckbox.addEventListener('change', function() {
            if (this.checked) {
                desiredPiecesContainer.style.display = 'block';
            } else {
                desiredPiecesContainer.style.display = 'none';
                // Clear the input value when hidden
                const desiredPiecesInput = document.getElementById('desiredPieces');
                if(desiredPiecesInput){
                    desiredPiecesInput.value = '';
                }
            }
        });
    }
});

// Prevent form submission on Enter key press for rectangleForm
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
