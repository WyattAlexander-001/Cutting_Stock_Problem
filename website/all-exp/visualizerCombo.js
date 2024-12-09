// visualizerCombo.js

const SCALE = 50; // Adjust this value as needed
let bladeThickness = 0; // Default blade thickness
let allowRotation = true; // Set rotation preference

document.addEventListener('DOMContentLoaded', function() {
  // Reference to the bin container divs
  const shelfBinContainer = document.getElementById('shelfBinContainer');
  const guillotineBinContainer = document.getElementById('guillotineBinContainer');

  // Function to process item data
  function processItemData(data) {
    // Get bin sizes
    const binSizes = [];
    const binSizeDivs = document.querySelectorAll('.bin-size');
    binSizeDivs.forEach(div => {
      const binWidth = parseFloat(div.querySelector('.binWidth').value);
      const binHeight = parseFloat(div.querySelector('.binHeight').value);
      if (binWidth && binHeight) {
        binSizes.push({ binWidth, binHeight, area: binWidth * binHeight });
      }
    });

    if (binSizes.length === 0) {
      alert('Please add at least one bin size.');
      return;
    }

    // Get blade thickness
    const bladeThicknessInput = document.getElementById('bladeThickness');
    if (bladeThicknessInput) {
      bladeThickness = parseFloat(bladeThicknessInput.value) || 0;
    } else {
      bladeThickness = 0;
    }

    // Prepare items
    let items = [];
    data.forEach(itemData => {
      const { width, height, quantity } = itemData;
      for (let i = 0; i < quantity; i++) {
        items.push(new Item(width, height));
      }
    });

    // Clear previous bin visuals
    shelfBinContainer.innerHTML = '';
    guillotineBinContainer.innerHTML = '';

    // Process items with Shelf Algorithm
    processShelfAlgorithm(items.slice(), binSizes, shelfBinContainer);

    // Process items with Guillotine Algorithm
    processGuillotineAlgorithm(items.slice(), binSizes, guillotineBinContainer);
  }

  function processShelfAlgorithm(items, binSizes, binContainer) {
    // Sort items by height descending (could adjust this)
    items.sort((a, b) => b.height - a.height);

    // Initialize total areas
    let totalItemsArea = 0;
    let totalWasteArea = 0;

    const binsUsed = [];

    while (items.length > 0) {
      let bestBinResult = null;

      // Try bins from largest to smallest
      for (const binSize of binSizes) {
        const tempBin = new ShelfBin({
          binWidth: binSize.binWidth,
          binHeight: binSize.binHeight,
          bladeThickness: bladeThickness,
          allowRotation: allowRotation,
        });

        const remainingItems = [];
        const tempItems = items.slice(); // Copy of items

        tempItems.forEach(item => {
          const tempItem = new Item(item.width, item.height);
          const inserted = tempBin.insert(tempItem);
          if (!inserted) {
            remainingItems.push(item);
          }
        });

        const numItemsPacked = tempBin.items.length;
        const wasteArea = tempBin.binStats().wasteArea;

        if (!bestBinResult || numItemsPacked > bestBinResult.numItemsPacked ||
            (numItemsPacked === bestBinResult.numItemsPacked && wasteArea < bestBinResult.wasteArea)) {
          bestBinResult = {
            binSize: binSize,
            numItemsPacked: numItemsPacked,
            wasteArea: wasteArea,
          };
        }
      }

      if (!bestBinResult || bestBinResult.numItemsPacked === 0) {
        alert('Some items could not be placed in any bin using Shelf Algorithm.');
        break;
      }

      // Now, create the actual bin and pack the items
      const selectedBin = new ShelfBin({
        binWidth: bestBinResult.binSize.binWidth,
        binHeight: bestBinResult.binSize.binHeight,
        bladeThickness: bladeThickness,
        allowRotation: allowRotation,
      });

      const remainingItems = [];

      // Reset items to original dimensions before inserting
      items.forEach(item => item.reset());

      items.forEach(item => {
        const inserted = selectedBin.insert(item);
        if (!inserted) {
          remainingItems.push(item);
        }
      });

      const binStats = selectedBin.binStats();
      totalItemsArea += binStats.itemsArea;
      totalWasteArea += binStats.wasteArea;

      binsUsed.push({
        bin: selectedBin,
        binStats: binStats,
      });

      items = remainingItems; // Reassign items for the next iteration
    }

    // Display bins used
    binsUsed.forEach((binData, index) => {
      // Visualize the bin
      const binDiv = createBinDiv(binData.bin, index, binData.binStats);
      binContainer.appendChild(binDiv);
    });

    // Display final tally
    const finalTallyDiv = document.createElement('div');
    finalTallyDiv.innerHTML = `<h2>Final Tally for Shelf Algorithm</h2>
    Total Rectangles Area: ${totalItemsArea.toFixed(2)}<br>
    Total Waste Area: ${totalWasteArea.toFixed(2)}`;
    binContainer.appendChild(finalTallyDiv);
  }

  function processGuillotineAlgorithm(items, binSizes, binContainer) {
    // Sort binSizes by area descending
    binSizes.sort((a, b) => b.area - a.area);

    // Sort items in decreasing order of area (or any other heuristic)
    items.sort((a, b) => b.area - a.area);

    // Initialize total areas
    let totalItemsArea = items.reduce((acc, item) => acc + item.area, 0);
    let totalWasteArea = 0;

    const binsUsed = [];

    while (items.length > 0) {
      // Recalculate totalItemsArea
      totalItemsArea = items.reduce((acc, item) => acc + item.area, 0);

      let bestBinResult = null;

      // Try bins from largest to smallest
      for (const binSize of binSizes) {
        // Check if any item can fit dimension-wise into the bin
        const anyItemCanFit = items.some(item => {
          const canFitWithoutRotation =
            (item.width <= binSize.binWidth && item.height <= binSize.binHeight);
          const canFitWithRotation =
            (item.height <= binSize.binWidth && item.width <= binSize.binHeight);
          return canFitWithoutRotation || (allowRotation && canFitWithRotation);
        });

        if (!anyItemCanFit) {
          continue;
        }

        // Create a new bin with the current bin size
        const tempBin = new GuillotineBin({
          binWidth: binSize.binWidth,
          binHeight: binSize.binHeight,
          bladeThickness: bladeThickness,
          allowRotation: allowRotation,
          heuristic: 'best_shortside',
          rectangleMerge: true,
          splitHeuristic: 'default',
        });

        // Keep track of which items are packed
        const packedItemIndices = [];

        for (let index = 0; index < items.length; index++) {
          const item = items[index];
          const tempItem = new Item(item.width, item.height);
          if (tempBin.insert(tempItem)) {
            packedItemIndices.push(index);
          }
        }

        const numItemsPacked = packedItemIndices.length;
        const wasteArea = tempBin.binStats().wasteArea;

        // Check if this bin size packs more items than previous best
        if (!bestBinResult || numItemsPacked > bestBinResult.numItemsPacked ||
            (numItemsPacked === bestBinResult.numItemsPacked && wasteArea < bestBinResult.wasteArea)) {
          bestBinResult = {
            binSize: binSize,
            bin: tempBin,
            numItemsPacked: numItemsPacked,
            wasteArea: wasteArea,
            packedItemIndices: packedItemIndices,
          };
        }
      }

      if (!bestBinResult) {
        alert('Some items cannot fit into any of the provided bin sizes using Guillotine Algorithm.');
        break;
      }

      // Now, create the actual bin and pack the items
      const selectedBin = new GuillotineBin({
        binWidth: bestBinResult.binSize.binWidth,
        binHeight: bestBinResult.binSize.binHeight,
        bladeThickness: bladeThickness,
        allowRotation: allowRotation,
        heuristic: 'best_shortside',
        rectangleMerge: true,
        splitHeuristic: 'default',
      });

      const remainingItems = [];
      const packedItems = [];

      // Reset items to original dimensions before inserting
      items.forEach(item => item.reset());

      for (let index = 0; index < items.length; index++) {
        const item = items[index];
        if (bestBinResult.packedItemIndices.includes(index)) {
          selectedBin.insert(item);
          packedItems.push(item);
        } else {
          remainingItems.push(item);
        }
      }

      const binStats = selectedBin.binStats();
      binsUsed.push({ bin: selectedBin, binSize: bestBinResult.binSize, binStats });

      // Accumulate areas
      totalWasteArea += binStats.wasteArea;

      // Update items list
      items = remainingItems;
    }

    // Display bins used
    displayBins(binsUsed, binContainer);

    // Display final tally
    const finalTallyDiv = document.createElement('div');
    const totalRectanglesArea = binsUsed.reduce((acc, binData) => acc + binData.binStats.itemsArea, 0);
    finalTallyDiv.innerHTML = `<h2>Final Tally for Guillotine Algorithm</h2>
    Total Rectangles Area: ${totalRectanglesArea.toFixed(2)}<br>
    Total Waste Area: ${totalWasteArea.toFixed(2)}`;
    binContainer.appendChild(finalTallyDiv);
  }

  // Function to create bin visualization
  function createBinDiv(bin, binIndex, binStats) {
    const binContainerDiv = document.createElement('div');
    binContainerDiv.className = 'bin-container';
    binContainerDiv.style.marginBottom = '20px';

    // Create a div to hold the bin number and areas
    const binTitle = document.createElement('div');
    binTitle.innerHTML = `<strong>Bin ${binIndex + 1}</strong><br>
    Total Rectangles Area: ${binStats.itemsArea.toFixed(2)}<br>
    Waste Area: ${binStats.wasteArea.toFixed(2)}`;
    binContainerDiv.appendChild(binTitle);

    const binDiv = document.createElement('div');
    binDiv.className = 'bin';
    binDiv.style.width = `${bin.binWidth * SCALE}px`;
    binDiv.style.height = `${bin.binHeight * SCALE}px`;
    binDiv.style.position = 'relative';
    binDiv.style.border = '1px solid black';
    binDiv.style.margin = '10px 0';
    binDiv.style.backgroundColor = 'red'; // Waste area is red
    binDiv.style.overflow = 'hidden'; // Prevent items from extending beyond the bin

    // Add dimensions inside the bin
    const dimensionsDiv = document.createElement('div');
    dimensionsDiv.style.position = 'absolute';
    dimensionsDiv.style.bottom = '5px';
    dimensionsDiv.style.right = '5px';
    dimensionsDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
    dimensionsDiv.style.padding = '2px 4px';
    dimensionsDiv.style.fontSize = '14px'; // Increased font size
    dimensionsDiv.innerHTML = `${bin.binWidth} x ${bin.binHeight}`;
    binDiv.appendChild(dimensionsDiv);

    // Add items
    bin.items.forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'item';
      itemDiv.style.width = `${item.width * SCALE}px`;
      itemDiv.style.height = `${item.height * SCALE}px`;
      itemDiv.style.backgroundColor = 'green'; // Used wood is green
      itemDiv.style.position = 'absolute';
      itemDiv.style.left = `${item.x * SCALE}px`;
      itemDiv.style.top = `${item.y * SCALE}px`;
      itemDiv.style.boxSizing = 'border-box';

      if (bladeThickness > 0) {
        // Determine which shadows to apply based on item's position
        const shadows = [];

        const bladePx = bladeThickness * SCALE;

        // If item is not at the top edge of the bin, apply top shadow
        if (item.y > 0) {
          shadows.push(`inset 0 ${bladePx}px 0 -${bladePx}px black`);
        }

        // If item is not at the bottom edge of the bin, apply bottom shadow
        if (item.y + item.height + bladeThickness < bin.binHeight) {
          shadows.push(`inset 0 -${bladePx}px 0 -${bladePx}px black`);
        }

        // If item is not at the left edge of the bin, apply left shadow
        if (item.x > 0) {
          shadows.push(`inset ${bladePx}px 0 0 -${bladePx}px black`);
        }

        // If item is not at the right edge of the bin, apply right shadow
        if (item.x + item.width + bladeThickness < bin.binWidth) {
          shadows.push(`inset -${bladePx}px 0 0 -${bladePx}px black`);
        }

        // Apply the box-shadow styles
        itemDiv.style.boxShadow = shadows.join(', ');
      } else {
        // No blade thickness, so no shadows
        itemDiv.style.boxShadow = 'none';
      }

      // Add dimensions inside the item
      const itemDimensionsDiv = document.createElement('div');
      itemDimensionsDiv.style.position = 'absolute';
      itemDimensionsDiv.style.bottom = '2px';
      itemDimensionsDiv.style.right = '2px';
      itemDimensionsDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
      itemDimensionsDiv.style.padding = '1px 2px';
      itemDimensionsDiv.style.fontSize = '12px'; // Increased font size
      itemDimensionsDiv.style.textAlign = 'right';
      itemDimensionsDiv.style.pointerEvents = 'none'; // So it doesn't interfere with any interactions
      itemDimensionsDiv.innerHTML = `${item.originalWidth} x ${item.originalHeight}`;

      itemDiv.appendChild(itemDimensionsDiv);
      binDiv.appendChild(itemDiv);
    });

    binContainerDiv.appendChild(binDiv);

    return binContainerDiv;
  }

  // Function to display bins for Guillotine Algorithm
  function displayBins(bins, binContainer) {
    bins.forEach((binData, index) => {
      const bin = binData.bin;
      const binSize = binData.binSize;
      const binStats = bin.binStats();

      // Create a container for the bin visualization
      const binDiv = document.createElement('div');
      binDiv.className = 'bin-container';
      binDiv.style.marginBottom = '20px';

      const binTitle = document.createElement('div');
      binTitle.innerHTML = `<strong>Bin ${index + 1}</strong><br>
      Total Rectangles Area: ${binStats.itemsArea.toFixed(2)}<br>
      Waste Area: ${binStats.wasteArea.toFixed(2)}`;

      binDiv.appendChild(binTitle);

      // Create a canvas for each bin
      const binCanvas = document.createElement('div');
      binCanvas.className = 'bin';
      binCanvas.style.width = `${bin.binWidth * SCALE}px`;
      binCanvas.style.height = `${bin.binHeight * SCALE}px`;
      binCanvas.style.position = 'relative';
      binCanvas.style.border = '1px solid black';
      binCanvas.style.margin = '10px 0';
      binCanvas.style.backgroundColor = 'red'; // Waste area is red
      binCanvas.style.overflow = 'hidden'; // Prevent items from extending beyond the bin

      // Add dimensions inside the bin
      const dimensionsDiv = document.createElement('div');
      dimensionsDiv.style.position = 'absolute';
      dimensionsDiv.style.bottom = '5px';
      dimensionsDiv.style.right = '5px';
      dimensionsDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
      dimensionsDiv.style.padding = '2px 4px';
      dimensionsDiv.style.fontSize = '14px'; // Increased font size
      dimensionsDiv.innerHTML = `${bin.binWidth} x ${bin.binHeight}`;
      binCanvas.appendChild(dimensionsDiv);

      // Add items
      bin.items.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item';
        itemDiv.style.width = `${item.width * SCALE}px`;
        itemDiv.style.height = `${item.height * SCALE}px`;
        itemDiv.style.backgroundColor = 'green'; // Used wood is green
        itemDiv.style.position = 'absolute';
        itemDiv.style.left = `${item.x * SCALE}px`;
        itemDiv.style.top = `${item.y * SCALE}px`;
        itemDiv.style.boxSizing = 'border-box';

        if (bladeThickness > 0) {
          // Determine which shadows to apply based on item's position
          const shadows = [];

          const bladePx = bladeThickness * SCALE;

          // If item is not at the top edge of the bin, apply top shadow
          if (item.y > 0) {
            shadows.push(`inset 0 ${bladePx}px 0 -${bladePx}px black`);
          }

          // If item is not at the bottom edge of the bin, apply bottom shadow
          if (item.y + item.height + bladeThickness < bin.binHeight) {
            shadows.push(`inset 0 -${bladePx}px 0 -${bladePx}px black`);
          }

          // If item is not at the left edge of the bin, apply left shadow
          if (item.x > 0) {
            shadows.push(`inset ${bladePx}px 0 0 -${bladePx}px black`);
          }

          // If item is not at the right edge of the bin, apply right shadow
          if (item.x + item.width + bladeThickness < bin.binWidth) {
            shadows.push(`inset -${bladePx}px 0 0 -${bladePx}px black`);
          }

          // Apply the box-shadow styles
          itemDiv.style.boxShadow = shadows.join(', ');
        } else {
          // No blade thickness, so no shadows
          itemDiv.style.boxShadow = 'none';
        }

        // Add dimensions inside the item
        const itemDimensionsDiv = document.createElement('div');
        itemDimensionsDiv.style.position = 'absolute';
        itemDimensionsDiv.style.bottom = '2px';
        itemDimensionsDiv.style.right = '2px';
        itemDimensionsDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
        itemDimensionsDiv.style.padding = '1px 2px';
        itemDimensionsDiv.style.fontSize = '12px'; // Increased font size
        itemDimensionsDiv.style.textAlign = 'right';
        itemDimensionsDiv.style.pointerEvents = 'none';
        itemDimensionsDiv.innerHTML = `${item.originalWidth} x ${item.originalHeight}`;

        itemDiv.appendChild(itemDimensionsDiv);
        binCanvas.appendChild(itemDiv);
      });

      binDiv.appendChild(binCanvas);
      binContainer.appendChild(binDiv);
    });
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      processItemData,
      processGuillotineAlgorithm,
      processShelfAlgorithm,
      SCALE,
      bladeThickness,
      allowRotation
    };
  }  

  // Event Listeners:

  // Add event listener to "Add Bin Size" button
  const addBinSizeButton = document.getElementById('addBinSize');
  addBinSizeButton.addEventListener('click', function() {
    const binSizesDiv = document.getElementById('binSizes');
    const newBinSizeDiv = document.createElement('div');
    newBinSizeDiv.className = 'bin-size';
    newBinSizeDiv.innerHTML = `
      <label>Bin Width:</label>
      <input type="number" class="binWidth" value="10" min="1">
      <label>Bin Height:</label>
      <input type="number" class="binHeight" value="10" min="1">
      <button class="removeBinSize">Remove</button>
    `;
    binSizesDiv.appendChild(newBinSizeDiv);

    // Add event listener for the remove button
    const removeButton = newBinSizeDiv.querySelector('.removeBinSize');
    removeButton.addEventListener('click', function() {
      binSizesDiv.removeChild(newBinSizeDiv);
    });
  });

  // Add event listeners to existing remove buttons
  document.querySelectorAll('.removeBinSize').forEach(button => {
    button.addEventListener('click', function() {
      const binSizeDiv = this.parentElement;
      binSizeDiv.parentElement.removeChild(binSizeDiv);
    });
  });

  const addItemButton = document.getElementById('addItemButton');
  addItemButton.addEventListener('click', function() {
    const itemList = document.getElementById('itemList');
    const newItemDiv = document.createElement('div');
    newItemDiv.className = 'item-entry';
    newItemDiv.innerHTML = `
      <label>Width:</label>
      <input type="number" class="itemWidth" min="0.1" step="0.1">
      <label>Height:</label>
      <input type="number" class="itemHeight" min="0.1" step="0.1">
      <label>Quantity:</label>
      <input type="number" class="itemQuantity" value="1" min="1">
      <button class="removeItemButton">Remove</button>
    `;
    itemList.appendChild(newItemDiv);

    // Add event listener for the remove button
    const removeButton = newItemDiv.querySelector('.removeItemButton');
    removeButton.addEventListener('click', function() {
      itemList.removeChild(newItemDiv);
    });
  });

  const loadButton = document.getElementById('loadButton');
  const fileInput = document.getElementById('fileInput');

  loadButton.addEventListener('click', function () {
    const file = fileInput.files[0];
    if (file) {
      // Handle file input
      const reader = new FileReader();

      reader.onload = function (e) {
        try {
          const jsonData = JSON.parse(e.target.result);
          processItemData(jsonData);
        } catch (error) {
          alert('Error parsing JSON file: ' + error.message);
        }
      };

      reader.readAsText(file);
    } else {
      // No file selected, process manual items
      const jsonData = [];

      const itemEntries = document.querySelectorAll('.item-entry');
      itemEntries.forEach(entry => {
        const width = parseFloat(entry.querySelector('.itemWidth').value);
        const height = parseFloat(entry.querySelector('.itemHeight').value);
        const quantity = parseInt(entry.querySelector('.itemQuantity').value) || 1;

        if (width && height) {
          jsonData.push({ width, height, quantity });
        }
      });

      if (jsonData.length === 0) {
        alert('Please enter items manually or select a JSON file.');
        return;
      }

      processItemData(jsonData);
    }
  });

  const saveToJsonButton = document.getElementById('saveToJsonButton');
  saveToJsonButton.addEventListener('click', function() {
    const jsonData = [];

    const itemEntries = document.querySelectorAll('.item-entry');
    itemEntries.forEach(entry => {
      const width = parseFloat(entry.querySelector('.itemWidth').value);
      const height = parseFloat(entry.querySelector('.itemHeight').value);
      const quantity = parseInt(entry.querySelector('.itemQuantity').value) || 1;

      if (width && height) {
        jsonData.push({ width, height, quantity });
      }
    });

    if (jsonData.length === 0) {
      alert('No items to save.');
      return;
    }

    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'items.json';
    link.click();

    // Optionally, revoke the object URL after download
    URL.revokeObjectURL(url);
  });

  // Expose processItemData function to global scope
  window.processItemData = processItemData;
});
