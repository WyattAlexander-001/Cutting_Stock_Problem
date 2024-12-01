// Item.js

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
  
  // Expose the Item class to the global scope
  window.Item = Item;
  