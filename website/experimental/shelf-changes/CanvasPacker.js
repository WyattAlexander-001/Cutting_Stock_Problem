//Wrapper for ShelfPack library to pack rectangles into a canvas of fixed size
class CanvasPacker {
    constructor(width, height, bladeThickness) {
        // Maybe make this array of sprites so multiple boards can be cut
        this.sprite = [new ShelfPack(width, height, { autoResize: false })];
        this.width = width;
        this.height = height;
        this.bladeThickness = bladeThickness;
        this.spriteCount = 0;
    }

    addCut(width, height) {
        let result;
        // Check each sprite if there is room for this cut
        for(let i = 0; i < this.spriteCount; i++) {
            // Manually add cut thickness to each rectangle
            result = this.sprite[i].packOne(width + this.bladeThickness, height + this.bladeThickness);
            if (result) {
                console.log(result);
                console.log("-----------");
                console.log(`Cut added at position (${result.x}, ${result.y}) with dimensions ${result.w}x${result.h}.`);
                //this.checkSpace();
                console.log("-----------");
                return result;
            } else {
                // Move on to next sprite
                console.log("Not enough space to add cut.");
                //return null;
            }
        };

        // If code reaches this point, no sprite in the list had room and a new sprite must be made
        this.spriteCount++;
        console.log(`No sprite with enough space, making sprite ${this.spriteCount}`);
        this.sprite[this.spriteCount] = new ShelfPack(this.width, this.height, { autoResize:false });

        result = this.sprite[this.spriteCount].packOne(width + this.bladeThickness, height + this.bladeThickness);
        if(result) {
            return result;
        }
        else {
            // Something wrong happened and this piece was not able to fit on any sprite
            console.log("Unable to fit this cut on any sprite, something went very wrong :(");
            return null;
        }
    }

    clearCuts() {
        //this.sprite.clear();
        this.sprite = [new ShelfPack(this.width, this.height, { autoResize: false })];
        console.log("Canvas cleared.");
    }

    checkSpace() {
        for(let i = 0; i < this.spriteCount; i++) {
            const stats = this.sprite[i].stats;
            console.log(`Sprite ${i}: Total space: ${this.width * this.height}, Used space: ${stats.used}, Free space: ${this.width * this.height - stats.used}`);
            return stats;    
        }
    }
}

export { CanvasPacker };
