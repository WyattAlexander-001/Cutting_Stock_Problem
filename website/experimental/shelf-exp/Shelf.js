// Shelf.js
alert('Shelf.js loaded');

class Item {
  constructor(width, height) {
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
  }
}

class Shelf {
  constructor(y, binWidth) {
    this.y = y;
    this.width = binWidth;
    this.height = 0;
    this.items = [];
    this.remainingWidth = binWidth;
  }

  canFit(item) {
    return item.width <= this.remainingWidth;
  }

  addItem(item) {
    item.x = this.width - this.remainingWidth;
    item.y = this.y;
    this.items.push(item);
    this.height = Math.max(this.height, item.height);
    this.remainingWidth -= item.width;
  }
}

class ShelfBin {
  constructor({
    binWidth = 8,
    binHeight = 4,
    allowRotation = true,
  } = {}) {
    this.binWidth = binWidth;
    this.binHeight = binHeight;
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
    if (this.currentY + item.height <= this.binHeight) {
      const newShelf = new Shelf(this.currentY, this.binWidth);
      newShelf.addItem(item);
      this.shelves.push(newShelf);
      this.items.push(item);
      this.currentY += newShelf.height;
      return true;
    }
    if (this.allowRotation) {
      item.rotate();
      if (this.currentY + item.height <= this.binHeight) {
        const newShelf = new Shelf(this.currentY, this.binWidth);
        newShelf.addItem(item);
        this.shelves.push(newShelf);
        this.items.push(item);
        this.currentY += newShelf.height;
        return true;
      }
      // Rotate back
      item.rotate();
    }
    return false; // Cannot fit
  }

  binStats() {
    const usedArea = this.items.reduce((acc, item) => acc + item.area, 0);
    const totalArea = this.binWidth * this.binHeight;
    return {
      width: this.binWidth,
      height: this.binHeight,
      area: totalArea,
      efficiency: usedArea / totalArea,
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
    <input type="number" class="itemWidth" min="1">
    <label>Height:</label>
    <input type="number" class="itemHeight" min="1">
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

// Expose the classes to the global scope
window.Item = Item;
window.ShelfBin = ShelfBin;
