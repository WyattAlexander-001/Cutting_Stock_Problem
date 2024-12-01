// main.js

document.addEventListener('DOMContentLoaded', function() {
    const SCALE = 50; // Adjust as needed
    const binContainer = document.getElementById('binContainer');
  
    // Function to process item data
    function processItemData(data) {
      // Get bin sizes
      const binSizes = [];
      const binSizeDivs = document.querySelectorAll('.bin-size');
      binSizeDivs.forEach(div => {
        const binWidth = parseFloat(div.querySelector('.binWidth').value);
        const binHeight = parseFloat(div.querySelector('.binHeight').value);
        if (binWidth && binHeight) {
          binSizes.push({ binWidth, binHeight });
        }
      });
  
      if (binSizes.length === 0) {
        alert('Please add at least one bin size.');
        return;
      }
  
      // Get blade thickness
      let bladeThickness = 0; // Default value
      const bladeThicknessInput = document.getElementById('bladeThickness');
      if (bladeThicknessInput) {
        bladeThickness = parseFloat(bladeThicknessInput.value) || 0;
      }
  
      // Prepare items
      const items = [];
      data.forEach(itemData => {
        const { width, height, quantity } = itemData;
        for (let i = 0; i < quantity; i++) {
          items.push(new Item(width, height));
        }
      });
  
      // Sort items as needed
      items.sort((a, b) => b.area - a.area);
  
      // Run both algorithms
      const shelfResult = runShelfAlgorithm(items, binSizes, bladeThickness);
      const guillotineResult = runGuillotineAlgorithm(items, binSizes, bladeThickness);
  
      // Compare results
      let betterResult;
      let algorithmUsed;
      if (shelfResult.totalWasteArea < guillotineResult.totalWasteArea) {
        betterResult = shelfResult;
        algorithmUsed = 'Shelf Algorithm';
      } else {
        betterResult = guillotineResult;
        algorithmUsed = 'Guillotine Algorithm';
      }
  
      // Display the result
      binContainer.innerHTML = `<h2>Best Result Using ${algorithmUsed}</h2>`;
      visualizeBins(betterResult.bins, SCALE, bladeThickness);
    }
  
    function runShelfAlgorithm(items, binSizes, bladeThickness) {
      // Clone items to avoid modifying original
      const itemsCopy = items.map(item => new Item(item.originalWidth, item.originalHeight));
  
      let bins = [];
      let itemsToPack = itemsCopy.slice();
      let binIndex = 0;
      let currentBinSizeIndex = 0;
  
      while (itemsToPack.length > 0) {
        const { binWidth, binHeight } = binSizes[currentBinSizeIndex];
        const bin = new ShelfBin({ binWidth, binHeight, bladeThickness });
  
        let remainingItems = [];
  
        itemsToPack.forEach(item => {
          const inserted = bin.insert(item);
          if (!inserted) {
            remainingItems.push(item);
          }
        });
  
        itemsToPack = remainingItems;
        bins.push(bin);
  
        binIndex++;
  
        // Move to next bin size
        currentBinSizeIndex = (currentBinSizeIndex + 1) % binSizes.length;
  
        // Break if no items could be placed in the bin
        if (bin.items.length === 0) {
          alert('Some items could not be placed in any bin using Shelf Algorithm.');
          break;
        }
      }
  
      // Calculate total waste area
      let totalWasteArea = 0;
      bins.forEach(bin => {
        const binStats = bin.binStats();
        totalWasteArea += binStats.wasteArea;
      });
  
      return { bins, totalWasteArea };
    }
  
    function runGuillotineAlgorithm(items, binSizes, bladeThickness) {
      // Clone items to avoid modifying original
      const itemsCopy = items.map(item => new Item(item.originalWidth, item.originalHeight));
  
      let bins = [];
      let itemsToPack = itemsCopy.slice();
  
      const heuristic = 'best_shortside'; // Adjust as needed
  
      while (itemsToPack.length > 0) {
        let bestBin = null;
        let bestPackedItems = [];
        let bestBinSize = null;
        let bestWasteArea = Infinity;
  
        // Try each bin size
        for (const binSize of binSizes) {
          // Clone items for this attempt
          const attemptItems = itemsToPack.slice();
          const bin = new Guillotine({
            binWidth: binSize.binWidth,
            binHeight: binSize.binHeight,
            bladeThickness: bladeThickness,
            allowRotation: false,
            heuristic: heuristic,
            rectangleMerge: true,
            splitHeuristic: 'default',
          });
  
          const packedItems = [];
          for (let i = 0; i < attemptItems.length; ) {
            const item = attemptItems[i];
            if (bin.insert(item)) {
              packedItems.push(item);
              attemptItems.splice(i, 1); // Remove packed item
            } else {
              i++;
            }
          }
  
          const binStats = bin.binStats();
          const wasteArea = binStats.wasteArea;
  
          if (packedItems.length > 0 && wasteArea < bestWasteArea) {
            bestBin = bin;
            bestPackedItems = packedItems;
            bestBinSize = binSize;
            bestWasteArea = wasteArea;
          }
        }
  
        if (bestBin) {
          bins.push(bestBin);
          // Remove the packed items from the main items list
          itemsToPack = itemsToPack.filter(item => !bestPackedItems.includes(item));
        } else {
          // No bin could fit any of the remaining items
          alert('Some items could not be packed into any bin using Guillotine Algorithm.');
          break;
        }
      }
  
      // Calculate total waste area
      let totalWasteArea = 0;
      bins.forEach(bin => {
        const binStats = bin.binStats();
        totalWasteArea += binStats.wasteArea;
      });
  
      return { bins, totalWasteArea };
    }
  
    function visualizeBins(bins, scale, bladeThickness) {
      // Clear the bin container
      binContainer.innerHTML = '';
  
      bins.forEach((bin, index) => {
        const binStats = bin.binStats();
  
        // Create a container for the bin visualization
        const binDiv = document.createElement('div');
        binDiv.className = 'bin-container';
        binDiv.style.marginBottom = '20px';
  
        const binTitle = document.createElement('div');
        binTitle.innerHTML = `<strong>Bin ${index + 1}</strong><br>
        Efficiency: ${(binStats.efficiencyPercentage)}%<br>
        Waste: ${(binStats.wastePercentage)}%`;
  
        binDiv.appendChild(binTitle);
  
        // Create a canvas for each bin
        const binCanvas = document.createElement('div');
        binCanvas.className = 'bin';
        binCanvas.style.width = `${bin.binWidth * scale}px`;
        binCanvas.style.height = `${bin.binHeight * scale}px`;
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
          itemDiv.style.width = `${item.width * scale}px`;
          itemDiv.style.height = `${item.height * scale}px`;
          itemDiv.style.backgroundColor = 'green'; // Used wood is green
          itemDiv.style.position = 'absolute';
          itemDiv.style.left = `${item.x * scale}px`;
          itemDiv.style.top = `${item.y * scale}px`;
          itemDiv.style.boxSizing = 'border-box';
  
          if (bladeThickness > 0) {
            // Determine which shadows to apply based on item's position
            const shadows = [];
  
            const bladePx = bladeThickness * scale;
  
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
  
    // Event listeners for UI elements
  
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
  });
  