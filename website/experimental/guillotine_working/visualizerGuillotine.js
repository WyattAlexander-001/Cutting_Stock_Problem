// Ensure the code runs after the DOM is loaded
window.onload = function () {
    // Optional: Set initial canvas background to red
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  // Handle file input
  const fileInput = document.getElementById('fileInput');
  const loadButton = document.getElementById('loadButton');

  loadButton.addEventListener('click', function () {
    const file = fileInput.files[0];
    if (!file) {
      alert('Please select a JSON file first.');
      return;
    }

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
  });

  function processItemData(jsonData) {
    // Get all bin sizes
    const binSizeElements = document.querySelectorAll('.bin-size');
    const binSizes = [];
  
    binSizeElements.forEach((binElement) => {
      const binWidthInput = binElement.querySelector('.binWidth');
      const binHeightInput = binElement.querySelector('.binHeight');
  
      const binWidth = parseFloat(binWidthInput.value) || 10;
      const binHeight = parseFloat(binHeightInput.value) || 6;
  
      binSizes.push({ binWidth, binHeight });
    });
  
    // Create items according to quantities
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
  
  function drawBin(bin) {
    // Visualization
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set the canvas background to red
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Scale factor to fit the canvas
    const scaleX = canvas.width / bin.binWidth;
    const scaleY = canvas.height / bin.binHeight;

    // Draw the bin outline
    ctx.strokeStyle = 'black';
    ctx.strokeRect(0, 0, bin.binWidth * scaleX, bin.binHeight * scaleY);

    // Set the item color to green
    ctx.fillStyle = 'green';

    // Draw items
    for (const item of bin.items) {
      ctx.fillRect(
        item.x * scaleX,
        item.y * scaleY,
        item.width * scaleX,
        item.height * scaleY
      );
      ctx.strokeRect(
        item.x * scaleX,
        item.y * scaleY,
        item.width * scaleX,
        item.height * scaleY
      );
    }
  }

  function displayBins(bins) {
    // Clear existing canvases
    const binContainer = document.getElementById('binContainer');
    binContainer.innerHTML = '';
  
    bins.forEach((binData, index) => {
      const bin = binData.bin;
      const binSize = binData.binSize;
      const efficiency = binData.efficiency;
  
      // Create a container for the bin visualization
      const binDiv = document.createElement('div');
      binDiv.className = 'bin-visualization';
  
      const binTitle = document.createElement('h3');
      binTitle.textContent = `Bin ${index + 1}: ${binSize.binWidth}x${binSize.binHeight} (Efficiency: ${(efficiency * 100).toFixed(2)}%)`;
  
      binDiv.appendChild(binTitle);
  
      // Create a canvas for each bin
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400 * (bin.binHeight / bin.binWidth); // Adjust height based on bin aspect ratio
  
      binDiv.appendChild(canvas);
      binContainer.appendChild(binDiv);
  
      // Draw the bin on the canvas
      drawBinOnCanvas(bin, canvas);
    });
  }
  

  function drawBinOnCanvas(bin, canvas) {
    const ctx = canvas.getContext('2d');
  
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    // Set the canvas background to red
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  
    // Scale factor to fit the canvas
    const scaleX = canvas.width / bin.binWidth;
    const scaleY = canvas.height / bin.binHeight;
  
    // Draw the bin outline
    ctx.strokeStyle = 'black';
    ctx.strokeRect(0, 0, bin.binWidth * scaleX, bin.binHeight * scaleY);
  
    // Set the item color to green
    ctx.fillStyle = 'green';
  
    // Draw items
    for (const item of bin.items) {
      ctx.fillRect(
        item.x * scaleX,
        item.y * scaleY,
        item.width * scaleX,
        item.height * scaleY
      );
      ctx.strokeRect(
        item.x * scaleX,
        item.y * scaleY,
        item.width * scaleX,
        item.height * scaleY
      );
    }
  }