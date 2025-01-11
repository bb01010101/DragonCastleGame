const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const MAP = {
    width: 4000,
    height: 3000,
    grassColor: '#4CAF50',  // Base green color
    grassPatternSize: 100   // Size of grass patches
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
    name: "Player",
    health: 100
};

// Add resources that can be collected
const resources = [];
for(let i = 0; i < 50; i++) {
    resources.push({
        x: Math.random() * MAP.width,
        y: Math.random() * MAP.height,
        size: 20,
        type: 'coin',
        collected: false
    });
}

const keys = {
    w: false, s: false, a: false, d: false,
    ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false
};

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

function drawGrassPattern(x, y) {
    const patternSize = MAP.grassPatternSize;
    ctx.fillStyle = '#45A049';  // Slightly darker green for variation
    ctx.fillRect(x, y, patternSize, patternSize);
    ctx.fillStyle = '#4CAF50';  // Original green
    ctx.fillRect(x + 10, y + 10, patternSize - 20, patternSize - 20);
}

function drawMap() {
    // Fill base grass color
    ctx.fillStyle = MAP.grassColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grass patterns
    for(let x = 0; x < canvas.width + MAP.grassPatternSize; x += MAP.grassPatternSize) {
        for(let y = 0; y < canvas.height + MAP.grassPatternSize; y += MAP.grassPatternSize) {
            const worldX = x + camera.x;
            const worldY = y + camera.y;
            if(worldX % (MAP.grassPatternSize * 2) === 0 && worldY % (MAP.grassPatternSize * 2) === 0) {
                drawGrassPattern(x - (camera.x % MAP.grassPatternSize), y - (camera.y % MAP.grassPatternSize));
            }
        }
    }
}

function drawResources() {
    resources.forEach(resource => {
        if(!resource.collected) {
            const screenX = resource.x - camera.x;
            const screenY = resource.y - camera.y;
            
            // Only draw if on screen
            if(screenX >= -50 && screenX <= canvas.width + 50 &&
               screenY >= -50 && screenY <= canvas.height + 50) {
                ctx.fillStyle = '#FFD700';  // Gold color for coins
                ctx.beginPath();
                ctx.arc(screenX, screenY, resource.size/2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    });
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
    ctx.fillStyle = '#3498db';  // Blue color like in lordz.io
    ctx.fillRect(screenX - player.width/2, screenY - player.height/2, player.width, player.height);
    
    // Draw player name and health bar
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(player.name, screenX, screenY - player.height/2 - 10);
    
    // Health bar
    const healthBarWidth = 50;
    const healthBarHeight = 5;
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(screenX - healthBarWidth/2, screenY - player.height/2 - 8, healthBarWidth, healthBarHeight);
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(screenX - healthBarWidth/2, screenY - player.height/2 - 8, (healthBarWidth * player.health/100), healthBarHeight);
}

function drawUI() {
    // Draw score/resources counter
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('🪙 0', 10, 30);
}

function updatePlayer() {
    let moved = false;
    
    if (keys.w || keys.ArrowUp) {
        player.worldY = Math.max(player.height/2, player.worldY - player.speed);
        moved = true;
    }
    if (keys.s || keys.ArrowDown) {
        player.worldY = Math.min(MAP.height - player.height/2, player.worldY + player.speed);
        moved = true;
    }
    if (keys.a || keys.ArrowLeft) {
        player.worldX = Math.max(player.width/2, player.worldX - player.speed);
        moved = true;
    }
    if (keys.d || keys.ArrowRight) {
        player.worldX = Math.min(MAP.width - player.width/2, player.worldX + player.speed);
        moved = true;
    }

    if (moved) {
        camera.x = Math.max(0, Math.min(MAP.width - canvas.width, player.worldX - canvas.width / 2));
        camera.y = Math.max(0, Math.min(MAP.height - canvas.height, player.worldY - canvas.height / 2));
    }
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    updatePlayer();
    drawMap();
    drawResources();
    drawPlayer();
    drawUI();
    
    requestAnimationFrame(gameLoop);
}

gameLoop(); 