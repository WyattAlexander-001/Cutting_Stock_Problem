// Mock document.getElementsByClassName
document.getElementsByClassName = jest.fn().mockReturnValue([{
    onclick: null
}]);

// Mock document.getElementById
document.getElementById = jest.fn().mockReturnValue({
    style: {
        display: 'none'
    },
    addEventListener: jest.fn(), // Add the addEventListener method
    removeEventListener: jest.fn() // Optionally, add removeEventListener as well
});

// Mock window.onclick
Object.defineProperty(window, 'onclick', {
    value: null,
    writable: true
});