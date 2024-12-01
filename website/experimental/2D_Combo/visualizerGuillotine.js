// visualizerGuillotine.js

const SCALE = 50; // Adjust this value as needed
let bladeThickness = 0; // Default blade thickness

document.addEventListener('DOMContentLoaded', function() {
  // Reference to the bin container div
  const binContainer = document.getElementById('binContainer');

  // Function to process item data
  function processItemData(jsonData) {
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
    const bladeThicknessInput = document.getElementById('bladeThickness');
    if (bladeThicknessInput) {
      bladeThickness = parseFloat(bladeThicknessInput.value) || 0;
    } else {
      bladeThickness = 0;
    }

    // Prepare items
    let items = [];
    for (const itemData of jsonData) {
      const width = itemData.width;
      const height = itemData.height;
      const quantity = itemData.quantity || 1;
      for (let i = 0; i < quantity; i++) {
        items.push(new Item(width, height));
      }
    }

    // Sort items in decreasing order of area (or any other heuristic)
    items.sort((a, b) => b.area - a.area);

    const binsUsed = [];
    while (items.length > 0) {
      let bestBin = null;
      let bestPackedItems = [];
      let bestBinSize = null;
      let bestEfficiency = 0;

      // Try each bin size
      for (const binSize of binSizes) {
        // Clone items for this attempt
        const itemsToPack = items.slice();
        const bin = new Guillotine({
          binWidth: binSize.binWidth,
          binHeight: binSize.binHeight,
          bladeThickness: bladeThickness,
          allowRotation: false,
          heuristic: 'best_shortside',
          rectangleMerge: true,
          splitHeuristic: 'default',
        });

        const packedItems = [];
        for (let i = 0; i < itemsToPack.length; ) {
          const item = itemsToPack[i];
          if (bin.insert(item)) {
            packedItems.push(item);
            itemsToPack.splice(i, 1); // Remove packed item
          } else {
            i++;
          }
        }

        const efficiency = bin.binStats().efficiency;

        if (packedItems.length > 0 && efficiency > bestEfficiency) {
          bestBin = bin;
          bestPackedItems = packedItems;
          bestBinSize = binSize;
          bestEfficiency = efficiency;
        }
      }

      if (bestBin) {
        binsUsed.push({ bin: bestBin, binSize: bestBinSize, efficiency: bestEfficiency });
        // Remove the packed items from the main items list
        items = items.filter(item => !bestPackedItems.includes(item));
      } else {
        // No bin could fit any of the remaining items
        alert('Some items could not be packed into any bin.');
        break;
      }
    }

    // Display bins used
    displayBins(binsUsed);
  }

  function displayBins(bins) {
    // Clear existing bins
    binContainer.innerHTML = '';

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
      Efficiency: ${(binStats.efficiencyPercentage)}%<br>
      Waste: ${(binStats.wastePercentage)}%`;

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

  // Expose processItemData function to global scope
  window.processItemData = processItemData;
});
