// document.addEventListener('DOMContentLoaded', function() {
//     var sprite = new ShelfPack(500, 500, { autoResize: true });
//     var container = document.getElementById('container');
//     var fileInput = document.getElementById('fileInput');

//     fileInput.addEventListener('change', function(e) {
//         var file = e.target.files[0];
//         if (file && file.type === "application/json") {
//             var reader = new FileReader();
//             reader.onload = function(e) {
//                 var bins;
//                 try {
//                     bins = JSON.parse(e.target.result);
//                     visualizeBins(bins, sprite, container);
//                 } catch (error) {
//                     console.error("Error parsing JSON:", error);
//                 }
//             };
//             reader.readAsText(file);
//         }
//     });
// });

// function visualizeBins(bins, sprite, container) {
//     container.innerHTML = ''; // Clear previous contents
//     sprite.clear(); // Clear the sprite to start fresh

//     var results = sprite.pack(bins);
//     results.forEach(bin => {
//         var div = document.createElement('div');
//         div.className = 'bin';
//         div.style.width = `${bin.w}px`;
//         div.style.height = `${bin.h}px`;
//         div.style.left = `${bin.x}px`;
//         div.style.top = `${bin.y}px`;
//         div.textContent = bin.id;
//         container.appendChild(div);
//     });
// }

import { CanvasPacker } from "./CanvasPacker.js";

document.addEventListener("DOMContentLoaded", function () {
  // Maybe list of containers?
  var container = document.getElementById("container");
  var fileInput = document.getElementById("fileInput");
  // Params: width, height, blade thickness
  var packer = new CanvasPacker(800, 400, 0.125); // Modify dimensions as needed

  fileInput.addEventListener("change", function (e) {
    var file = e.target.files[0];
    if (file && file.type === "application/json") {
      var reader = new FileReader();
      reader.onload = function (e) {
        try {
          var bins = JSON.parse(e.target.result);

          for (var key in bins[0]) {
            console.log(key);
          }

          visualizeBins(bins);
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      };
      reader.readAsText(file);
    }
  });

  // TODO: modify this function so it works similarly to
  // displayBins() in visualizerGuillotine.js
  //
  // CanvasPacker is set up to use multiple sprites to hold
  // extra bins, so create a new container for each sprite and draw items to it
  function visualizeBins(bins) {
    container.innerHTML = "";
    packer.clearCuts();
    bins.forEach((bin) => {
      // Scale each measurement by 100 so the 800x400 pixels translate
      // to 8x4 feet (1 foot = 100 pixels)
      for (let i = 0; i < bin.quantity; i++) {
        var result = packer.addCut(bin.width * 100, bin.height * 100);
        // If result rectangle exists, create a new div to display it
        if (result) {
          var div = document.createElement("div");
          div.className = "bin";
          div.style.width = `${result.w}px`;
          div.style.height = `${result.h}px`;
          div.style.left = `${result.x}px`;
          div.style.top = `${result.y}px`;
          div.textContent = result.id || "unnamed";
          container.appendChild(div);
        }
      }
    });
  }

  // Load items from manual user input to visualize
  const loadItemsButton = document.getElementById("loadItemsButton");
  loadItemsButton.addEventListener("click", function () {
    const bins = [];
    const itemEntries = document.querySelectorAll(".item-entry");
    itemEntries.forEach((entry) => {
      const width = parseFloat(entry.querySelector(".itemWidth").value);
      const height = parseFloat(entry.querySelector(".itemHeight").value);
      const quantity =
        parseInt(entry.querySelector(".itemQuantity").value) || 1;

      // Empty if statement here to make it easier for me to read :)
      if (width && height) {
        // Everything is good, continue
      } else {
        // Improper input, oops
        alert("An item was not entered correctly, items need width and height");
        return;
      }

      // Create bin object for item to cut
      const bin = {};
      bin.width = width;
      bin.height = height;
      bin.quantity = quantity;

      // Add bin to list of bins to pass to visualizeBins()
      bins.push(bin);
    });

    // Visualize bins here
    visualizeBins(bins);
  });
});

// Event listener for "Add Item" button to add/remove pieces of
// wood that need to be cut
const addItemButton = document.getElementById("addItemButton");
addItemButton.addEventListener("click", function () {
  const itemList = document.getElementById("itemList");
  const newItemDiv = document.createElement("div");
  newItemDiv.className = "item-entry";
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
  const removeButton = newItemDiv.querySelector(".removeItemButton");
  removeButton.addEventListener("click", function () {
    itemList.removeChild(newItemDiv);
  });
});

// Save current values to JSON for use later
const saveToJsonButton = document.getElementById("saveToJsonButton");
saveToJsonButton.addEventListener("click", function () {
  const jsonData = [];

  const itemEntries = document.querySelectorAll(".item-entry");
  itemEntries.forEach((entry) => {
    const width = parseFloat(entry.querySelector(".itemWidth").value);
    const height = parseFloat(entry.querySelector(".itemHeight").value);
    const quantity = parseInt(entry.querySelector(".itemQuantity").value) || 1;

    if (width && height) {
      jsonData.push({ width, height, quantity });
    }
  });

  if (jsonData.length === 0) {
    alert("No items to save.");
    return;
  }

  const jsonString = JSON.stringify(jsonData, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "items.json";
  link.click();

  // Optionally, revoke the object URL after download
  URL.revokeObjectURL(url);
});
