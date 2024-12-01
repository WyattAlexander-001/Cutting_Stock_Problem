// visualizerShelf.js

const SCALE = 50; // Adjust this value as needed
let bladeThickness = 0; // Default blade thickness

document.addEventListener('DOMContentLoaded', function() {
  // Reference to the bin container div
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
    const bladeThicknessInput = document.getElementById('bladeThickness');
    if (bladeThicknessInput) {
      bladeThickness = parseFloat(bladeThicknessInput.value) || 0;
    } else {
      bladeThickness = 0;
    }

    // Prepare items
    const items = [];
    data.forEach(itemData => {
      const { width, height, quantity } = itemData;
      for (let i = 0; i < quantity; i++) {
        items.push(new Item(width, height));
      }
    });

    // Sort items by height descending (could adjust this)
    items.sort((a, b) => b.height - a.height);

    // Clear previous bin visuals
    binContainer.innerHTML = '';

    // Pack items into bins
    let binIndex = 0;
    let currentBinSizeIndex = 0;
    while (items.length > 0) {
      const { binWidth, binHeight } = binSizes[currentBinSizeIndex];
      const bin = new ShelfBin({ binWidth, binHeight, bladeThickness });

      let remainingItems = [];

      items.forEach(item => {
        const inserted = bin.insert(item);
        if (!inserted) {
          remainingItems.push(item);
        }
      });

      items.length = 0;
      items.push(...remainingItems);

      const binStats = bin.binStats();

      // Visualize the bin
      const binDiv = createBinDiv(bin, binIndex, binStats);
      binContainer.appendChild(binDiv);
      binIndex++;

      // Move to next bin size
      currentBinSizeIndex = (currentBinSizeIndex + 1) % binSizes.length;

      // Break if no items could be placed in the bin
      if (bin.items.length === 0) {
        alert('Some items could not be placed in any bin.');
        break;
      }
    }
  }

  // Function to create bin visualization
  function createBinDiv(bin, binIndex, binStats) {
    const binContainerDiv = document.createElement('div');
    binContainerDiv.className = 'bin-container';
    binContainerDiv.style.marginBottom = '20px';

    // Create a div to hold the bin number and percentages
    const binTitle = document.createElement('div');
    binTitle.innerHTML = `<strong>Bin ${binIndex + 1}</strong><br>
    Efficiency: ${binStats.efficiencyPercentage}%<br>
    Waste: ${binStats.wastePercentage}%`;
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
        if (item.y + item.height < bin.binHeight) {
          shadows.push(`inset 0 -${bladePx}px 0 -${bladePx}px black`);
        }

        // If item is not at the left edge of the bin, apply left shadow
        if (item.x > 0) {
          shadows.push(`inset ${bladePx}px 0 0 -${bladePx}px black`);
        }

        // If item is not at the right edge of the bin, apply right shadow
        if (item.x + item.width < bin.binWidth) {
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

  // Expose processItemData function to global scope
  window.processItemData = processItemData;
});
