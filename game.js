const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Define map dimensions (larger than canvas)
const MAP = {
    width: 2000,
    height: 1500
};

// Camera position
const camera = {
    x: 0,
    y: 0
};

const player = {
    x: canvas.width / 2,  // Keep player centered initially
    y: canvas.height / 2,
    width: 50,
    height: 50,
    speed: 5,
    // Track actual position in the world
    worldX: MAP.width / 2,
    worldY: MAP.height / 2
};

// Track which keys are currently pressed
const keys = {
    w: false,
    s: false,
    a: false,
    d: false,
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

// Event listeners for keydown and keyup
window.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = true;
    }
});

window.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = false;
    }
});

function updatePlayer() {
    let moved = false;
    
    // Vertical movement
    if (keys.w || keys.ArrowUp) {
        player.worldY = Math.max(0, player.worldY - player.speed);
        moved = true;
    }
    if (keys.s || keys.ArrowDown) {
        player.worldY = Math.min(MAP.height, player.worldY + player.speed);
        moved = true;
    }
    
    // Horizontal movement
    if (keys.a || keys.ArrowLeft) {
        player.worldX = Math.max(0, player.worldX - player.speed);
        moved = true;
    }
    if (keys.d || keys.ArrowRight) {
        player.worldX = Math.min(MAP.width, player.worldX + player.speed);
        moved = true;
    }

    // Update camera to center on player, but respect map boundaries
    if (moved) {
        camera.x = Math.max(0, Math.min(MAP.width - canvas.width, player.worldX - canvas.width / 2));
        camera.y = Math.max(0, Math.min(MAP.height - canvas.height, player.worldY - canvas.height / 2));
    }
}

function drawMap() {
    // Draw a grid pattern to make scrolling visible
    ctx.strokeStyle = '#ddd';
    ctx.beginPath();
    
    // Vertical lines
    for (let x = 0; x < MAP.width; x += 100) {
        let screenX = x - camera.x;
        if (screenX >= 0 && screenX <= canvas.width) {
            ctx.moveTo(screenX, 0);
            ctx.lineTo(screenX, canvas.height);
        }
    }
    
    // Horizontal lines
    for (let y = 0; y < MAP.height; y += 100) {
        let screenY = y - camera.y;
        if (screenY >= 0 && screenY <= canvas.height) {
            ctx.moveTo(0, screenY);
            ctx.lineTo(canvas.width, screenY);
        }
    }
    
    ctx.stroke();
}

function drawPlayer() {
    // Draw player relative to camera position
    const screenX = player.worldX - camera.x;
    const screenY = player.worldY - camera.y;
    
    ctx.fillStyle = 'blue';
    ctx.fillRect(screenX - player.width/2, screenY - player.height/2, 
                 player.width, player.height);
}

function gameLoop() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update game objects
    updatePlayer();
    
    // Draw game objects
    drawMap();
    drawPlayer();
    
    // Continue the game loop
    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop(); 