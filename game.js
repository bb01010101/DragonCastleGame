const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const debug = document.getElementById('debug');

// Basic map setup
const MAP = {
    width: 2000,
    height: 1500
};

// Camera position
const camera = {
    x: 0,
    y: 0
};

// Player setup
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 50,
    height: 50,
    speed: 5,
    worldX: MAP.width / 2,
    worldY: MAP.height / 2
};

// Key tracking
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

// Event listeners
window.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = true;
        e.preventDefault();
    }
});

window.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = false;
    }
});

function updatePlayer() {
    // Store previous position for debugging
    const prevX = player.worldX;
    const prevY = player.worldY;
    
    // Vertical movement
    if (keys.w || keys.ArrowUp) {
        player.worldY = Math.max(0, player.worldY - player.speed);
    }
    if (keys.s || keys.ArrowDown) {
        player.worldY = Math.min(MAP.height, player.worldY + player.speed);
    }
    
    // Horizontal movement
    if (keys.a || keys.ArrowLeft) {
        player.worldX = Math.max(0, player.worldX - player.speed);
    }
    if (keys.d || keys.ArrowRight) {
        player.worldX = Math.min(MAP.width, player.worldX + player.speed);
    }

    // Update camera to follow player
    camera.x = player.worldX - canvas.width / 2;
    camera.y = player.worldY - canvas.height / 2;

    // Clamp camera to map bounds
    camera.x = Math.max(0, Math.min(camera.x, MAP.width - canvas.width));
    camera.y = Math.max(0, Math.min(camera.y, MAP.height - canvas.height));

    // Debug output
    debug.textContent = `
        Player: (${Math.round(player.worldX)}, ${Math.round(player.worldY)})
        Camera: (${Math.round(camera.x)}, ${Math.round(camera.y)})
        Movement: ${prevX !== player.worldX || prevY !== player.worldY ? 'Yes' : 'No'}
    `;
}

function drawMap() {
    // Clear the canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw a grid for reference
    ctx.strokeStyle = '#eee';
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = -camera.x % 50; x < canvas.width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = -camera.y % 50; y < canvas.height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function drawPlayer() {
    // Calculate screen position
    const screenX = player.worldX - camera.x;
    const screenY = player.worldY - camera.y;
    
    // Draw player
    ctx.fillStyle = 'blue';
    ctx.fillRect(
        screenX - player.width/2,
        screenY - player.height/2,
        player.width,
        player.height
    );
}

function gameLoop() {
    updatePlayer();
    drawMap();
    drawPlayer();
    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop(); 