// Shelf.js

class Item {
  constructor(width, height) {
    this.originalWidth = width; // Store original dimensions
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
    // Only swap width and height, not the original dimensions
    [this.width, this.height] = [this.height, this.width];
  }

  reset() {
    // Reset dimensions to the original values
    this.width = this.originalWidth;
    this.height = this.originalHeight;
  }
}

class Shelf {
  constructor(y, binWidth, bladeThickness) {
    this.y = y;
    this.width = binWidth;
    this.height = 0;
    this.items = [];
    this.bladeThickness = bladeThickness;
    this.currentX = 0;
    this.remainingWidth = binWidth;
  }

  canFit(item) {
    const requiredWidth = item.width + (this.items.length > 0 ? this.bladeThickness : 0);
    return this.remainingWidth >= requiredWidth;
  }

  addItem(item) {
    if (this.items.length > 0) {
      this.currentX += this.bladeThickness;
      this.remainingWidth -= this.bladeThickness;
    }
    item.x = this.currentX;
    item.y = this.y;
    this.items.push(item);
    this.currentX += item.width;
    this.remainingWidth -= item.width;
    this.height = Math.max(this.height, item.height);
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
    let shelfY = this.currentY + (this.shelves.length > 0 ? this.bladeThickness : 0);
    let requiredHeight = shelfY + item.height;

    if (requiredHeight <= this.binHeight) {
      const newShelf = new Shelf(shelfY, this.binWidth, this.bladeThickness);
      newShelf.addItem(item);
      this.shelves.push(newShelf);
      this.items.push(item);
      this.currentY = shelfY + item.height;
      return true;
    }

    if (this.allowRotation) {
      item.rotate();
      shelfY = this.currentY + (this.shelves.length > 0 ? this.bladeThickness : 0);
      requiredHeight = shelfY + item.height;
      if (requiredHeight <= this.binHeight) {
        const newShelf = new Shelf(shelfY, this.binWidth, this.bladeThickness);
        newShelf.addItem(item);
        this.shelves.push(newShelf);
        this.items.push(item);
        this.currentY = shelfY + item.height;
        return true;
      }
      // Rotate back
      item.rotate();
    }

    return false; // Cannot fit
  }

  binStats() {
    const itemsArea = this.items.reduce((acc, item) => acc + item.area, 0);
    const totalArea = this.binWidth * this.binHeight;
    const wasteArea = totalArea - itemsArea;

    return {
      width: this.binWidth,
      height: this.binHeight,
      area: totalArea,
      itemsArea,
      wasteArea,
      items: this.items,
    };
  }
}

// Expose the classes to the global scope
window.Item = Item;
window.ShelfBin = ShelfBin;
