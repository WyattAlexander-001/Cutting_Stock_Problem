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
// One-Dimensional Cutting Stock Algorithm
//-----------------------------------

//Adding functionality for singling out existing cuts

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

    // Sort desired cuts by size descending
    desiredCuts.sort((a, b) => b.size - a.size);

    let woodLengths = woodLengthsInput.split(',').map(length => parseFloat(length.trim()));
    woodLengths = woodLengths.filter(length => !isNaN(length) && length > 0);

    if (woodLengths.length === 0) {
        alert('Please enter valid wood lengths.');
        return;
    }

    // ---------------------------------------
    // Track exact matches
    const exactMatchesCount = {};
    const exactCutDetails = [];

    // Check for exact matches
    const originalDesiredCuts = desiredCuts.map(dc => ({ ...dc })); // Keep a copy for final display reference

    for (let i = 0; i < desiredCuts.length; i++) {
        let desiredSize = desiredCuts[i].size;
        let qty = desiredCuts[i].quantity;

        for (let j = woodLengths.length - 1; j >= 0 && qty > 0; j--) {
            if (Math.abs(woodLengths[j] - desiredSize) < 0.0001) {
                // Found an exact match piece
                woodLengths.splice(j, 1);
                qty--;

                // Record this exact match
                exactMatchesCount[desiredSize] = (exactMatchesCount[desiredSize] || 0) + 1;
            }
        }

        desiredCuts[i].quantity = qty;
    }

    // Remove cuts fully satisfied by exact matches
    for (let i = desiredCuts.length - 1; i >= 0; i--) {
        if (desiredCuts[i].quantity === 0) {
            desiredCuts.splice(i, 1);
        }
    }

    // Create virtual planks for exact matches
    for (const size in exactMatchesCount) {
        const count = exactMatchesCount[size];
        for (let k = 0; k < count; k++) {
            exactCutDetails.push({
                originalLength: parseFloat(size),
                cuts: [parseFloat(size)] // The whole plank is the cut
            });
        }
    }

    // Now call the original multiCutSorted logic
    const results = multiCutSorted(woodLengths, desiredCuts, bladeThickness);

    // Incorporate exact matches into the results
    // 1. Add the exact match cut details to the front
    results.cutDetails = exactCutDetails.concat(results.cutDetails);

    // 2. Update results.cuts with exact matches
    for (const size in exactMatchesCount) {
        results.cuts[size] = (results.cuts[size] || 0) + exactMatchesCount[size];
    }

    // Display results
    const resultsDiv = document.getElementById('cutResults');
    resultsDiv.innerHTML = '';

    // Combine current desiredCuts with original so we can show all
    const allDesired = {};
    for (const dc of originalDesiredCuts) {
        allDesired[dc.size] = dc.quantity;
    }
    // If we removed any cuts due to exact matches, add them back with original quantity
    for (const size in exactMatchesCount) {
        if (!allDesired[size]) {
            // This means it was fully satisfied by exact matches originally
            allDesired[size] = exactMatchesCount[size]; 
        }
    }

    // Now display each desired size
    for (const size in allDesired) {
        const desiredQty = allDesired[size];
        const achieved = results.cuts[size] || 0;

        if (achieved < desiredQty) {
            // Not enough wood
            const neededMore = (desiredQty - achieved) * parseFloat(size);
            resultsDiv.innerHTML += `<p style="color:red;">Desired: ${desiredQty} x ${size} ft | Achieved: ${achieved} pieces | Need more wood: ~${neededMore.toFixed(2)} ft required!</p>`;
        } else {
            // Enough or exact
            // If these were exact matches only, add a note
            const wasExactOnly = exactMatchesCount[size] && !desiredCuts.find(d => d.size === parseFloat(size));
            const extraNote = wasExactOnly ? ' (exact matches)' : '';
            resultsDiv.innerHTML += `<p>Desired: ${desiredQty} x ${size} ft${extraNote} | Achieved: ${achieved} pieces</p>`;
        }
    }

    resultsDiv.innerHTML += `<p>Total Waste: ${results.totalWaste.toFixed(2)} feet</p>`;

    // Generate visualization with combined details (exact matches + cuts)
    // For visualization, reconstruct "desiredCuts" for input into generateOneDVisualization
    const finalDesired = [];
    for (const size in allDesired) {
        finalDesired.push({size: parseFloat(size), quantity: allDesired[size]});
    }

    generateOneDVisualization(results.cutDetails, finalDesired, bladeThickness);
}




function multiCutSorted(lengths, desiredCuts, bladeThickness) {
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

        // Attempt to fulfill desired cuts from this plank
        for (let j = 0; j < remainingCuts.length; j++) {
            const desired = remainingCuts[j];
            while (desired.quantity > 0 && length >= desired.size + bladeThickness) {
                currentCuts.push(desired.size);
                length -= (desired.size + bladeThickness);
                desired.quantity--;
                cuts[desired.size] = (cuts[desired.size] || 0) + 1;
            }
        }

        // Only add this plank to details and count waste if we actually made cuts
        if (currentCuts.length > 0) {
            // Any remaining length in this plank is waste
            if (length > 0) {
                currentCuts.push(length); // This is leftover waste
                totalWaste += length;
            }

            cutDetails.push({ originalLength: originalLength, cuts: currentCuts });
        }

        // If all desired cuts are fulfilled, break early
        if (remainingCuts.every(cut => cut.quantity === 0)) {
            break;
        }
    }

    return { cuts, totalWaste, cutDetails };
}




// function performOneDCutting() {
//     const woodLengthsInput = document.getElementById('woodLengths').value;
//     const bladeThicknessInches = parseFloat(document.getElementById('bladeThickness').value);
//     const bladeThickness = bladeThicknessInches / 12; // Convert inches to feet

//     // Retrieve desired cuts
//     const cutSizeElements = document.getElementsByName('cutSizes');
//     const cutQuantityElements = document.getElementsByName('cutQuantities');

//     const desiredCuts = [];
//     for (let i = 0; i < cutSizeElements.length; i++) {
//         const size = parseFloat(cutSizeElements[i].value);
//         const quantity = parseInt(cutQuantityElements[i].value);
//         if (isNaN(size) || size <= 0 || isNaN(quantity) || quantity <= 0) {
//             alert('Please enter valid cut sizes and quantities.');
//             return;
//         }
//         desiredCuts.push({ size, quantity });
//     }

//     // Sort desired cuts by size descending for better optimization
//     desiredCuts.sort((a, b) => b.size - a.size);

//     // Convert the comma-separated string of lengths into an array of numbers
//     let woodLengths = woodLengthsInput.split(',').map(length => parseFloat(length.trim()));
//     woodLengths = woodLengths.filter(length => !isNaN(length) && length > 0); // Validate lengths

//     if (woodLengths.length === 0) {
//         alert('Please enter valid wood lengths.');
//         return; // Stop execution if no valid lengths
//     }

//     // Perform the cutting operation
//     const results = multiCutSorted(woodLengths, desiredCuts, bladeThickness);

//     // Display results
//     const resultsDiv = document.getElementById('cutResults');
//     resultsDiv.innerHTML = '';

//     desiredCuts.forEach(desired => {
//         const achieved = results.cuts[desired.size] || 0;
//         resultsDiv.innerHTML += `<p>Desired: ${desired.quantity} x ${desired.size} ft | Achieved: ${achieved} pieces</p>`;
//     });

//     resultsDiv.innerHTML += `<p>Total Waste: ${results.totalWaste.toFixed(2)} feet</p>`;

//     // Generate visualization
//     generateOneDVisualization(results.cutDetails, desiredCuts, bladeThickness);
// }

// function multiCutSorted(lengths, desiredCuts, bladeThickness) {
//     // Initialize results
//     let totalWaste = 0;
//     const cutDetails = [];
//     const cuts = {}; // To track achieved cuts per desired size

//     // Clone desiredCuts to keep track of remaining quantities
//     const remainingCuts = desiredCuts.map(cut => ({ ...cut }));

//     // Sort wood lengths descending
//     lengths.sort((a, b) => b - a);

//     for (let i = 0; i < lengths.length; i++) {
//         let length = lengths[i];
//         const originalLength = length;
//         const currentCuts = [];

//         for (let j = 0; j < remainingCuts.length; j++) {
//             const desired = remainingCuts[j];
//             while (desired.quantity > 0 && length >= desired.size + bladeThickness) {
//                 currentCuts.push(desired.size);
//                 length -= (desired.size + bladeThickness);
//                 desired.quantity--;
//                 // Track achieved cuts
//                 cuts[desired.size] = (cuts[desired.size] || 0) + 1;
//             }
//         }

//         // Any remaining length is waste
//         if (length > 0) {
//             currentCuts.push(length); // Remaining waste
//             totalWaste += length;
//         }

//         cutDetails.push({ originalLength: originalLength, cuts: currentCuts });

//         // If all desired cuts are fulfilled, break
//         if (remainingCuts.every(cut => cut.quantity === 0)) {
//             break;
//         }
//     }

//     // Calculate total achieved pieces
//     // Already tracked in 'cuts' object

//     return { cuts, totalWaste, cutDetails };
// }

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

//-----------------------------------
// JSON Parsing for 1D Cutting Stock
//-----------------------------------

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
                console.error(err);
                alert('Error parsing JSON file.');
            }
        };
        fileReader.readAsText(file);
    };
}


//-----------------------------------
// Event Handlers/Listeners
//-----------------------------------

// Prevent form submission on Enter key press for 1D Cutting Stock Form
document.getElementById('oneDCutForm').onsubmit = e => e.preventDefault(); // Prevent form from submitting

// Event listener for 1D Cutting Stock Form submission
document.getElementById('oneDCutForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission
    performOneDCutting();   // Call your function
});
