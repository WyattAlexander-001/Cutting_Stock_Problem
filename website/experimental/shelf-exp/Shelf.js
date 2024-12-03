// Shelf.js
alert('Shelf.js loaded');

class Item {
  constructor(width, height) {
    this.originalWidth = width;  // Store the original dimensions for display
    this.originalHeight = height;
    this.width = width;
    this.height = height;
    this.x = null;
    this.y = null;
  }

  get area() {
    return this.width * this.height;
  }

  rotate() {
    [this.width, this.height] = [this.height, this.width];
    [this.originalWidth, this.originalHeight] = [this.originalHeight, this.originalWidth];
  }
}

class Shelf {
  constructor(y, binWidth, bladeThickness) {
    this.y = y;
    this.width = binWidth;
    this.height = 0;
    this.items = [];
    this.remainingWidth = binWidth;
    this.bladeThickness = bladeThickness;
  }

  canFit(item) {
    // Need to account for blade thickness between items
    const requiredWidth = this.items.length === 0 ? item.width : item.width + this.bladeThickness;
    return requiredWidth <= this.remainingWidth;
  }

  addItem(item) {
    // Adjust item position considering blade thickness
    item.x = this.width - this.remainingWidth + (this.items.length === 0 ? 0 : this.bladeThickness);
    item.y = this.y;
    this.items.push(item);
    this.height = Math.max(this.height, item.height);
    this.remainingWidth -= item.width + (this.items.length === 0 ? 0 : this.bladeThickness);
  }
}

class ShelfBin {
  constructor({
    binWidth = 8,
    binHeight = 4,
    bladeThickness = 0.125,
    allowRotation = true,
  } = {}) {
    this.binWidth = binWidth;
    this.binHeight = binHeight;
    this.bladeThickness = bladeThickness;
    this.allowRotation = allowRotation;

    this.items = [];
    this.shelves = [];
    this.currentY = 0;
  }

  insert(item) {
    // Try to fit into existing shelves
    for (let shelf of this.shelves) {
      if (shelf.canFit(item)) {
        shelf.addItem(item);
        this.items.push(item);
        return true;
      }
      if (this.allowRotation) {
        item.rotate();
        if (shelf.canFit(item)) {
          shelf.addItem(item);
          this.items.push(item);
          return true;
        }
        // Rotate back
        item.rotate();
      }
    }

    // Try to create a new shelf
    let shelfHeightWithBlade = item.height + (this.shelves.length === 0 ? 0 : this.bladeThickness);

    if (this.currentY + shelfHeightWithBlade <= this.binHeight) {
      const newShelf = new Shelf(this.currentY + (this.shelves.length === 0 ? 0 : this.bladeThickness), this.binWidth, this.bladeThickness);
      newShelf.addItem(item);
      this.shelves.push(newShelf);
      this.items.push(item);
      this.currentY += shelfHeightWithBlade;
      return true;
    }

    if (this.allowRotation) {
      item.rotate();
      shelfHeightWithBlade = item.height + (this.shelves.length === 0 ? 0 : this.bladeThickness);
      if (this.currentY + shelfHeightWithBlade <= this.binHeight) {
        const newShelf = new Shelf(this.currentY + (this.shelves.length === 0 ? 0 : this.bladeThickness), this.binWidth, this.bladeThickness);
        newShelf.addItem(item);
        this.shelves.push(newShelf);
        this.items.push(item);
        this.currentY += shelfHeightWithBlade;
        return true;
      }
      // Rotate back
      item.rotate();
    }

    return false; // Cannot fit
  }

  binStats() {
    const usedArea = this.items.reduce((acc, item) => acc + item.area, 0);
    const bladeAreaHorizontal = this.shelves.reduce((acc, shelf) => acc + (shelf.items.length - 1) * this.bladeThickness * shelf.height, 0);
    const bladeAreaVertical = (this.shelves.length - 1) * this.bladeThickness * this.binWidth;
    const bladeArea = bladeAreaHorizontal + bladeAreaVertical;
    const totalArea = this.binWidth * this.binHeight;
    const efficiency = (usedArea + bladeArea) / totalArea;
    const wasteArea = totalArea - usedArea - bladeArea;
    const wastePercentage = ((wasteArea / totalArea) * 100).toFixed(2);
    const efficiencyPercentage = ((efficiency) * 100).toFixed(2);

    return {
      width: this.binWidth,
      height: this.binHeight,
      area: totalArea,
      efficiency,
      efficiencyPercentage,
      wasteArea,
      wastePercentage,
      items: this.items,
    };
  }
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

// Expose the classes to the global scope
window.Item = Item;
window.ShelfBin = ShelfBin;
