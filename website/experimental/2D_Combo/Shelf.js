// Shelf.js

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

// Expose the ShelfBin class to the global scope
window.ShelfBin = ShelfBin;
