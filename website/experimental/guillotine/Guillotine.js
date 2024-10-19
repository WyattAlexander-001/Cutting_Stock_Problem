// Guillotine.js
alert('Guillotine.js loaded');
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
      allowRotation = true,
      heuristic = 'best_area',
      rectangleMerge = true, // This remains the same
      splitHeuristic = 'default',
    } = {}) {
      this.binWidth = binWidth;
      this.binHeight = binHeight;
      this.allowRotation = allowRotation;
      this.doRectangleMerge = rectangleMerge; // Renamed property
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
      if (
        (!rotation && item.width <= rect.width && item.height <= rect.height) ||
        (rotation && item.height <= rect.width && item.width <= rect.height)
      ) {
        return true;
      }
      return false;
    }
  
    splitAlongAxis(freeRect, item, split) {
      const result = [];
  
      const topX = freeRect.x;
      const topY = freeRect.y + item.height;
      let topW, topH;
  
      const rightX = freeRect.x + item.width;
      const rightY = freeRect.y;
      let rightW, rightH;
  
      if (split) {
        // Horizontal split
        topW = freeRect.width;
        topH = freeRect.height - item.height;
        rightW = freeRect.width - item.width;
        rightH = item.height;
      } else {
        // Vertical split
        topW = item.width;
        topH = freeRect.height - item.height;
        rightW = freeRect.width - item.width;
        rightH = freeRect.height;
      }
  
      if (rightW > 0 && rightH > 0) {
        result.push(new FreeRectangle(rightW, rightH, rightX, rightY));
      }
  
      if (topW > 0 && topH > 0) {
        result.push(new FreeRectangle(topW, topH, topX, topY));
      }
  
      return result;
    }
  
    splitFreeRect(item, freeRect) {
      // Leftover lengths
      const w = freeRect.width - item.width;
      const h = freeRect.height - item.height;
  
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
      do {
        didMerge = false;
        outer: for (let i = 0; i < this.freeRectangles.length; i++) {
          const rect1 = this.freeRectangles[i];
          for (let j = 0; j < this.freeRectangles.length; j++) {
            if (i === j) continue;
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
      } while (didMerge);
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
          this.addItem(item, best.rect.x, best.rect.y, best.rotated);
          // Remove used free rectangle
          const index = this.freeRectangles.indexOf(best.rect);
          if (index !== -1) {
            this.freeRectangles.splice(index, 1);
          }
          // Add new free rectangles
          const splits = this.splitFreeRect(item, best.rect);
          this.freeRectangles.push(...splits);
          if (this.doRectangleMerge) { // Use the renamed property
            this.rectangleMerge(); // Call the method
          }
          return true;
        }
        return false;
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
  // Expose the classes to the global scope
  window.Item = Item;
  window.Guillotine = Guillotine;
  