// Guillotine.js

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
    [this.width, this.height] = [this.height, this.width];
    [this.originalWidth, this.originalHeight] = [this.originalHeight, this.originalWidth];
  }
}

class FreeRectangle {
  constructor(width, height, x, y) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
  }

  get area() {
    return this.width * this.height;
  }
}

class Guillotine {
  constructor({
    binWidth = 8,
    binHeight = 4,
    bladeThickness = 0.125,
    allowRotation = true,
    heuristic = 'best_area',
    rectangleMerge = true,
    splitHeuristic = 'default',
  } = {}) {
    this.binWidth = binWidth;
    this.binHeight = binHeight;
    this.bladeThickness = bladeThickness;
    this.allowRotation = allowRotation;
    this.doRectangleMerge = rectangleMerge;
    this.splitHeuristic = splitHeuristic;

    this.items = [];
    this.freeRectangles = [];

    if (binWidth === 0 || binHeight === 0) {
      this.freeRectangles = [];
    } else {
      this.freeRectangles = [new FreeRectangle(binWidth, binHeight, 0, 0)];
    }

    // Choose scoring function based on heuristic
    const heuristics = {
      best_area: this.scoreBAF.bind(this),
      best_shortside: this.scoreBSSF.bind(this),
      best_longside: this.scoreBLSF.bind(this),
      worst_area: this.scoreWAF.bind(this),
      worst_shortside: this.scoreWSSF.bind(this),
      worst_longside: this.scoreWLSF.bind(this),
    };

    this.scoringFunction = heuristics[heuristic];
    if (!this.scoringFunction) {
      throw new Error('No such heuristic!');
    }
  }

  // Scoring functions
  scoreBAF(rect, item) {
    return [rect.area - item.area, Math.min(rect.width - item.width, rect.height - item.height)];
  }

  scoreBSSF(rect, item) {
    return [
      Math.min(rect.width - item.width, rect.height - item.height),
      Math.max(rect.width - item.width, rect.height - item.height),
    ];
  }

  scoreBLSF(rect, item) {
    return [
      Math.max(rect.width - item.width, rect.height - item.height),
      Math.min(rect.width - item.width, rect.height - item.height),
    ];
  }

  scoreWAF(rect, item) {
    return [
      -1 * (rect.area - item.area),
      -1 * Math.min(rect.width - item.width, rect.height - item.height),
    ];
  }

  scoreWSSF(rect, item) {
    return [
      -1 * Math.min(rect.width - item.width, rect.height - item.height),
      -1 * Math.max(rect.width - item.width, rect.height - item.height),
    ];
  }

  scoreWLSF(rect, item) {
    return [
      -1 * Math.max(rect.width - item.width, rect.height - item.height),
      -1 * Math.min(rect.width - item.width, rect.height - item.height),
    ];
  }

  itemFitsRect(item, rect, rotation = false) {
    const blade = this.bladeThickness;
    if (!rotation) {
      const requiredWidth = item.width + blade;
      const requiredHeight = item.height + blade;
      return requiredWidth <= rect.width && requiredHeight <= rect.height;
    } else {
      const requiredWidth = item.height + blade;
      const requiredHeight = item.width + blade;
      return requiredWidth <= rect.width && requiredHeight <= rect.height;
    }
  }

  splitAlongAxis(freeRect, item, split) {
    const result = [];
    const blade = this.bladeThickness;

    if (split) {
      // Horizontal split
      const topX = freeRect.x;
      const topY = freeRect.y + item.height + blade;
      const topW = freeRect.width;
      const topH = freeRect.height - item.height - blade;

      const rightX = freeRect.x + item.width + blade;
      const rightY = freeRect.y;
      const rightW = freeRect.width - item.width - blade;
      const rightH = item.height;

      if (rightW > 0 && rightH > 0) {
        result.push(new FreeRectangle(rightW, rightH, rightX, rightY));
      }

      if (topW > 0 && topH > 0) {
        result.push(new FreeRectangle(topW, topH, topX, topY));
      }
    } else {
      // Vertical split
      const rightX = freeRect.x + item.width + blade;
      const rightY = freeRect.y;
      const rightW = freeRect.width - item.width - blade;
      const rightH = freeRect.height;

      const bottomX = freeRect.x;
      const bottomY = freeRect.y + item.height + blade;
      const bottomW = item.width;
      const bottomH = freeRect.height - item.height - blade;

      if (rightW > 0 && rightH > 0) {
        result.push(new FreeRectangle(rightW, rightH, rightX, rightY));
      }

      if (bottomW > 0 && bottomH > 0) {
        result.push(new FreeRectangle(bottomW, bottomH, bottomX, bottomY));
      }
    }

    return result;
  }

  splitFreeRect(item, freeRect) {
    // Leftover lengths
    const w = freeRect.width - item.width - this.bladeThickness;
    const h = freeRect.height - item.height - this.bladeThickness;

    let split;
    switch (this.splitHeuristic) {
      case 'SplitShorterLeftoverAxis':
        split = w <= h;
        break;
      case 'SplitLongerLeftoverAxis':
        split = w > h;
        break;
      case 'SplitMinimizeArea':
        split = item.width * h > w * item.height;
        break;
      case 'SplitMaximizeArea':
        split = item.width * h <= w * item.height;
        break;
      case 'SplitShorterAxis':
        split = freeRect.width <= freeRect.height;
        break;
      case 'SplitLongerAxis':
        split = freeRect.width > freeRect.height;
        break;
      default:
        split = true; // Default to horizontal split
    }

    return this.splitAlongAxis(freeRect, item, split);
  }

  addItem(item, x, y, rotate = false) {
    if (rotate) {
      item.rotate();
    }
    item.x = x;
    item.y = y;
    this.items.push(item);
  }

  rectangleMerge() {
    // Optional optimization to merge adjacent free rectangles
    let didMerge;
    let mergeAttempts = 0; // Limit the number of merge attempts to prevent infinite loops
    do {
      didMerge = false;
      outer: for (let i = 0; i < this.freeRectangles.length; i++) {
        const rect1 = this.freeRectangles[i];
        for (let j = i + 1; j < this.freeRectangles.length; j++) {
          const rect2 = this.freeRectangles[j];
          // Check if rectangles are adjacent and can be merged
          if (rect1.x === rect2.x && rect1.width === rect2.width) {
            if (
              rect1.y + rect1.height === rect2.y ||
              rect2.y + rect2.height === rect1.y
            ) {
              // Merge vertically
              const mergedRect = new FreeRectangle(
                rect1.width,
                rect1.height + rect2.height,
                rect1.x,
                Math.min(rect1.y, rect2.y)
              );
              this.freeRectangles.splice(j, 1);
              this.freeRectangles.splice(i, 1);
              this.freeRectangles.push(mergedRect);
              didMerge = true;
              break outer;
            }
          } else if (rect1.y === rect2.y && rect1.height === rect2.height) {
            if (
              rect1.x + rect1.width === rect2.x ||
              rect2.x + rect2.width === rect1.x
            ) {
              // Merge horizontally
              const mergedRect = new FreeRectangle(
                rect1.width + rect2.width,
                rect1.height,
                Math.min(rect1.x, rect2.x),
                rect1.y
              );
              this.freeRectangles.splice(j, 1);
              this.freeRectangles.splice(i, 1);
              this.freeRectangles.push(mergedRect);
              didMerge = true;
              break outer;
            }
          }
        }
      }
      mergeAttempts++;
    } while (didMerge && mergeAttempts < 1000); // Prevent infinite loop
  }

  findBestScore(item) {
    const rects = [];
    for (const rect of this.freeRectangles) {
      if (this.itemFitsRect(item, rect)) {
        rects.push({
          score: this.scoringFunction(rect, item),
          rect: rect,
          rotated: false,
        });
      }
      if (this.allowRotation && this.itemFitsRect(item, rect, true)) {
        rects.push({
          score: this.scoringFunction(rect, item),
          rect: rect,
          rotated: true,
        });
      }
    }
    if (rects.length === 0) {
      return null;
    }
    // Find the best score
    rects.sort((a, b) => {
      if (a.score[0] !== b.score[0]) {
        return a.score[0] - b.score[0];
      } else {
        return a.score[1] - b.score[1];
      }
    });
    return rects[0];
  }

  insert(item) {
    const best = this.findBestScore(item);
    if (best) {
      const blade = this.bladeThickness;

      if (best.rotated) {
        item.rotate();
      }
      item.x = best.rect.x;
      item.y = best.rect.y;
      this.items.push(item);

      // Remove used free rectangle
      const index = this.freeRectangles.indexOf(best.rect);
      if (index !== -1) {
        this.freeRectangles.splice(index, 1);
      }
      // Add new free rectangles
      const splits = this.splitFreeRect(item, best.rect);
      this.freeRectangles.push(...splits);
      if (this.doRectangleMerge) {
        this.rectangleMerge();
      }
      return true;
    }
    return false;
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
window.Guillotine = Guillotine;
