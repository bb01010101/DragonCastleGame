const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Make sure canvas is properly sized
canvas.width = 800;
canvas.height = 600;

const GAME_STATE = {
    map: {
        width: 2000,
        height: 1500
    },
    camera: {
        x: 0,
        y: 0
    },
    player: {
        x: 400,  // Start in middle of screen
        y: 300,
        size: 50,
        speed: 5,
        worldX: 1000,  // Start in middle of map
        worldY: 750
    }
};

// Simple input handling
const keys = {};
window.addEventListener('keydown', e => keys[e.key] = true);
window.addEventListener('keyup', e => keys[e.key] = false);

function update() {
    // Move player
    if (keys['w'] || keys['ArrowUp']) GAME_STATE.player.worldY -= GAME_STATE.player.speed;
    if (keys['s'] || keys['ArrowDown']) GAME_STATE.player.worldY += GAME_STATE.player.speed;
    if (keys['a'] || keys['ArrowLeft']) GAME_STATE.player.worldX -= GAME_STATE.player.speed;
    if (keys['d'] || keys['ArrowRight']) GAME_STATE.player.worldX += GAME_STATE.player.speed;

    // Update camera to follow player
    GAME_STATE.camera.x = GAME_STATE.player.worldX - canvas.width/2;
    GAME_STATE.camera.y = GAME_STATE.player.worldY - canvas.height/2;
}

function render() {
    // Clear canvas
    ctx.fillStyle = '#4CAF50';  // Green background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grass pattern
    ctx.fillStyle = '#45A049';
    for (let x = 0; x < canvas.width; x += 100) {
        for (let y = 0; y < canvas.height; y += 100) {
            if ((x + y) % 200 === 0) {
                ctx.fillRect(
                    x - (GAME_STATE.camera.x % 100), 
                    y - (GAME_STATE.camera.y % 100), 
                    50, 50
                );
            }
        }
    }

    // Draw player
    const screenX = GAME_STATE.player.worldX - GAME_STATE.camera.x;
    const screenY = GAME_STATE.player.worldY - GAME_STATE.camera.y;
    
    // Player shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(
        screenX, 
        screenY + GAME_STATE.player.size/2,
        GAME_STATE.player.size/2,
        GAME_STATE.player.size/4,
        0, 0, Math.PI * 2
    );
    ctx.fill();

    // Player body
    ctx.fillStyle = '#3498db';
    ctx.fillRect(
        screenX - GAME_STATE.player.size/2,
        screenY - GAME_STATE.player.size/2,
        GAME_STATE.player.size,
        GAME_STATE.player.size
    );

    // Debug info
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.fillText(`World Position: ${Math.round(GAME_STATE.player.worldX)}, ${Math.round(GAME_STATE.player.worldY)}`, 10, 30);
    ctx.fillText(`Camera Position: ${Math.round(GAME_STATE.camera.x)}, ${Math.round(GAME_STATE.camera.y)}`, 10, 50);
}

function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop(); 