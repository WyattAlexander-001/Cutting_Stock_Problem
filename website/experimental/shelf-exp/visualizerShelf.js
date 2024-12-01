// visualizerShelf.js

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
        const bin = new ShelfBin({ binWidth, binHeight });
  
        let remainingItems = [];
  
        items.forEach(item => {
          const inserted = bin.insert(item);
          if (!inserted) {
            remainingItems.push(item);
          }
        });
  
        items.length = 0;
        items.push(...remainingItems);
  
        // Visualize the bin
        const binDiv = createBinDiv(bin, binIndex);
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
    function createBinDiv(bin, binIndex) {
      const binDiv = document.createElement('div');
      binDiv.className = 'bin';
      binDiv.style.width = `${bin.binWidth * 10}px`;
      binDiv.style.height = `${bin.binHeight * 10}px`;
      binDiv.style.position = 'relative';
      binDiv.style.border = '1px solid black';
      binDiv.style.margin = '10px';
      binDiv.innerHTML = `<strong>Bin ${binIndex + 1}</strong>`;
  
      // Add items
      bin.items.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item';
        itemDiv.style.width = `${item.width * 10}px`;
        itemDiv.style.height = `${item.height * 10}px`;
        itemDiv.style.backgroundColor = getRandomColor();
        itemDiv.style.position = 'absolute';
        itemDiv.style.left = `${item.x * 10}px`;
        itemDiv.style.top = `${item.y * 10}px`;
        itemDiv.style.boxSizing = 'border-box';
        itemDiv.style.border = '1px solid #333';
        binDiv.appendChild(itemDiv);
      });
  
      return binDiv;
    }
  
    // Function to generate random colors
    function getRandomColor() {
      const letters = '789ABCD';
      let color = '#';
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * letters.length)];
      }
      return color;
    }
  
    // Expose processItemData function to global scope
    window.processItemData = processItemData;
  });
  