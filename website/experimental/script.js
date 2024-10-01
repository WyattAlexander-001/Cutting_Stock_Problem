document.addEventListener('DOMContentLoaded', function() {
    var sprite = new ShelfPack(500, 500, { autoResize: true });
    var container = document.getElementById('container');
    var fileInput = document.getElementById('fileInput');

    fileInput.addEventListener('change', function(e) {
        var file = e.target.files[0];
        if (file && file.type === "application/json") {
            var reader = new FileReader();
            reader.onload = function(e) {
                var bins;
                try {
                    bins = JSON.parse(e.target.result);
                    visualizeBins(bins, sprite, container);
                } catch (error) {
                    console.error("Error parsing JSON:", error);
                }
            };
            reader.readAsText(file);
        }
    });
});

function visualizeBins(bins, sprite, container) {
    container.innerHTML = ''; // Clear previous contents
    sprite.clear(); // Clear the sprite to start fresh

    var results = sprite.pack(bins);
    results.forEach(bin => {
        var div = document.createElement('div');
        div.className = 'bin';
        div.style.width = `${bin.w}px`;
        div.style.height = `${bin.h}px`;
        div.style.left = `${bin.x}px`;
        div.style.top = `${bin.y}px`;
        div.textContent = bin.id;
        container.appendChild(div);
    });
}
