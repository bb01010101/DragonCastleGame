const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const MAP = {
    width: 2000,
    height: 1500,
    grassColor: '#4CAF50'  // Base green color for the map
};

const camera = {
    x: 0,
    y: 0
};

const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 50,
    height: 50,
    speed: 5,
    worldX: MAP.width / 2,
    worldY: MAP.height / 2,
    health: 100,
    name: "Player 1"
};

const keys = {
    w: false, s: false, a: false, d: false,
    ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false
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
}

function drawMap() {
    // Fill background with base green color
    ctx.fillStyle = MAP.grassColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw darker green patches for texture
    ctx.fillStyle = '#3D8B40';
    const patchSize = 100;
    for (let x = -camera.x % patchSize; x < canvas.width; x += patchSize) {
        for (let y = -camera.y % patchSize; y < canvas.height; y += patchSize) {
            if ((Math.floor(x + camera.x) + Math.floor(y + camera.y)) % 200 === 0) {
                ctx.fillRect(x, y, patchSize/2, patchSize/2);
            }
        }
    }
}

function drawPlayer() {
    const screenX = player.worldX - camera.x;
    const screenY = player.worldY - camera.y;
    
    // Draw player shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(screenX, screenY + player.height/2, player.width/2, player.height/4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw player body
    ctx.fillStyle = '#3498db';
    ctx.fillRect(screenX - player.width/2, screenY - player.height/2, player.width, player.height);
    
    // Draw player name
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(player.name, screenX, screenY - player.height/2 - 10);
    
    // Draw health bar
    const healthBarWidth = 50;
    const healthBarHeight = 5;
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(screenX - healthBarWidth/2, screenY - player.height/2 - 8, healthBarWidth, healthBarHeight);
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(screenX - healthBarWidth/2, screenY - player.height/2 - 8, (healthBarWidth * player.health/100), healthBarHeight);
}

function drawUI() {
    // Draw top-left UI
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(10, 10, 200, 30);
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Position: (${Math.round(player.worldX)}, ${Math.round(player.worldY)})`, 20, 30);
    
    // Draw mini-map
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(canvas.width - 110, canvas.height - 110, 100, 100);
    
    // Draw player position on mini-map
    const miniMapX = canvas.width - 110 + (player.worldX / MAP.width) * 100;
    const miniMapY = canvas.height - 110 + (player.worldY / MAP.height) * 100;
    ctx.fillStyle = '#3498db';
    ctx.fillRect(miniMapX - 2, miniMapY - 2, 4, 4);
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    updatePlayer();
    drawMap();
    drawPlayer();
    drawUI();
    
    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop(); 