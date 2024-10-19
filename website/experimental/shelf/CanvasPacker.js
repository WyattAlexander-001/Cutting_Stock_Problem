//Wrapper for ShelfPack library to pack rectangles into a canvas of fixed size
class CanvasPacker {
    constructor(width, height) {
        this.sprite = new ShelfPack(width, height, { autoResize: false });
        this.width = width;
        this.height = height;
    }

    addCut(width, height) {
        const result = this.sprite.packOne(width, height);
        if (result) {
            console.log(`Cut added at position (${result.x}, ${result.y}) with dimensions ${result.w}x${result.h}.`);
            return result;
        } else {
            console.log("Not enough space to add cut.");
            return null;
        }
    }

    clearCuts() {
        this.sprite.clear();
        console.log("Canvas cleared.");
    }

    checkSpace() {
        const stats = this.sprite.stats();
        console.log(`Total space: ${this.width * this.height}, Used space: ${stats.used}, Free space: ${this.width * this.height - stats.used}`);
        return stats;
    }
}

export { CanvasPacker };
