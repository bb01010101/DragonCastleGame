const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const MAP = {
    width: 2000,
    height: 1500,
    tileSize: 64
};

const camera = {
    x: 0,
    y: 0
};

const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 40,
    height: 40,
    speed: 5,
    worldX: MAP.width / 2,
    worldY: MAP.height / 2,
    color: '#FF4444'  // Bright red
};

const keys = {
    w: false, s: false, a: false, d: false,
    ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false
};

window.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = true;
        e.preventDefault(); // Prevent page scrolling
    }
});

window.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = false;
    }
});

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

function drawMap() {
    // Fill background
    ctx.fillStyle = '#2A2A2A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = '#3A3A3A';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    // Vertical lines
    for (let x = 0; x < MAP.width; x += MAP.tileSize) {
        let screenX = x - camera.x;
        if (screenX >= -MAP.tileSize && screenX <= canvas.width + MAP.tileSize) {
            ctx.moveTo(screenX, 0);
            ctx.lineTo(screenX, canvas.height);
        }
    }
    
    // Horizontal lines
    for (let y = 0; y < MAP.height; y += MAP.tileSize) {
        let screenY = y - camera.y;
        if (screenY >= -MAP.tileSize && screenY <= canvas.height + MAP.tileSize) {
            ctx.moveTo(0, screenY);
            ctx.lineTo(canvas.width, screenY);
        }
    }
    
    ctx.stroke();

    // Draw some decorative elements
    for (let x = 0; x < MAP.width; x += MAP.tileSize * 2) {
        for (let y = 0; y < MAP.height; y += MAP.tileSize * 2) {
            let screenX = x - camera.x;
            let screenY = y - camera.y;
            if (screenX >= -MAP.tileSize && screenX <= canvas.width + MAP.tileSize &&
                screenY >= -MAP.tileSize && screenY <= canvas.height + MAP.tileSize) {
                ctx.fillStyle = '#3A3A3A';
                ctx.fillRect(screenX + MAP.tileSize/4, screenY + MAP.tileSize/4, 
                           MAP.tileSize/2, MAP.tileSize/2);
            }
        }
    }
}

function drawPlayer() {
    const screenX = player.worldX - camera.x;
    const screenY = player.worldY - camera.y;
    
    // Draw player shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(screenX, screenY + player.height/2, player.width/2, player.height/4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw player body
    ctx.fillStyle = player.color;
    ctx.fillRect(screenX - player.width/2, screenY - player.height/2, 
                 player.width, player.height);
                 
    // Add highlight
    ctx.fillStyle = '#FF6666';
    ctx.fillRect(screenX - player.width/2, screenY - player.height/2, 
                 player.width/4, player.height/4);
}

function drawUI() {
    // Draw position indicator
    ctx.fillStyle = '#FFF';
    ctx.font = '16px Arial';
    ctx.fillText(`Position: (${Math.round(player.worldX)}, ${Math.round(player.worldY)})`, 10, 30);
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    updatePlayer();
    drawMap();
    drawPlayer();
    drawUI();
    
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop(); 