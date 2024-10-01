document.addEventListener('DOMContentLoaded', function() {
    var sprite = new ShelfPack(500, 500, { autoResize: true });
    var container = document.getElementById('container');

    // Example set of bins to pack
    var bins = [
        { id: 'a', w: 100, h: 100 },
        { id: 'b', w: 200, h: 150 },
        { id: 'c', w: 50, h: 50 },
        { id: 'd', w: 150, h: 200 },
        { id: 'e', w: 150, h: 200 },
        { id: 'f', w: 100, h: 200 }
    ];

    // Pack the bins and display them
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
});
