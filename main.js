class Game {
  constructor() {
    this.canvas = document.getElementById("gameCanvas")
    this.ctx = this.canvas.getContext("2d")
    this.width = this.canvas.width
    this.height = this.canvas.height

    this.gameState = "menu" // menu, playing, paused, gameOver
    this.score = 0
    this.lives = 3
    this.highScore = localStorage.getItem("jetfighterHighScore") || 0

    this.player = new Player(this)
    this.bullets = []
    this.enemies = []
    this.obstacles = []
    this.coins = []
    this.particles = []

    this.keys = {}
    this.lastTime = 0
    this.enemySpawnTimer = 0
    this.coinSpawnTimer = 0
    this.obstacleSpawnTimer = 0
    this.difficultyTimer = 0
    this.difficulty = 1

    this.stars = []
    this.initStars()

    this.setupEventListeners()
    this.updateUI()
    this.gameLoop()
  }

  initStars() {
    for (let i = 0; i < 100; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        speed: Math.random() * 2 + 0.5,
        size: Math.random() * 2 + 1,
      })
    }
  }

  setupEventListeners() {
    document.addEventListener("keydown", (e) => {
      this.keys[e.code] = true

      if (e.code === "Space") {
        e.preventDefault()
        if (this.gameState === "playing") {
          this.player.shoot()
        }
      }

      if (e.code === "KeyP" && this.gameState === "playing") {
        this.togglePause()
      }
    })

    document.addEventListener("keyup", (e) => {
      this.keys[e.code] = false
    })

    document.getElementById("startBtn").addEventListener("click", () => {
      this.startGame()
    })

    document.getElementById("pauseBtn").addEventListener("click", () => {
      this.togglePause()
    })

    document.getElementById("restartBtn").addEventListener("click", () => {
      this.restartGame()
    })
  }

  startGame() {
    this.gameState = "playing"
    this.score = 0
    this.lives = 3
    this.difficulty = 1
    this.player.reset()
    this.bullets = []
    this.enemies = []
    this.obstacles = []
    this.coins = []
    this.particles = []

    document.getElementById("startBtn").style.display = "none"
    document.getElementById("pauseBtn").style.display = "inline-block"
    document.getElementById("gameOverScreen").style.display = "none"

    this.updateUI()
  }

  togglePause() {
    if (this.gameState === "playing") {
      this.gameState = "paused"
      document.getElementById("pauseBtn").textContent = "ПРОДОВЖИТИ"
    } else if (this.gameState === "paused") {
      this.gameState = "playing"
      document.getElementById("pauseBtn").textContent = "ПАУЗА"
    }
  }

  restartGame() {
    this.startGame()
  }

  gameOver() {
    this.gameState = "gameOver"

    if (this.score > this.highScore) {
      this.highScore = this.score
      localStorage.setItem("jetfighterHighScore", this.highScore)
      document.getElementById("newRecord").style.display = "block"
    } else {
      document.getElementById("newRecord").style.display = "none"
    }

    document.getElementById("finalScore").textContent = this.score
    document.getElementById("gameOverScreen").style.display = "flex"
    document.getElementById("pauseBtn").style.display = "none"
    document.getElementById("startBtn").style.display = "inline-block"

    this.updateUI()
  }

  updateUI() {
    document.getElementById("score").textContent = this.score
    document.getElementById("highScore").textContent = this.highScore
    document.getElementById("lives").textContent = this.lives
  }

  update(deltaTime) {
    if (this.gameState !== "playing") return

    // Оновлення складності
    this.difficultyTimer += deltaTime
    if (this.difficultyTimer > 10000) {
      // Кожні 10 секунд
      this.difficulty += 0.2
      this.difficultyTimer = 0
    }

    // Оновлення зірок
    this.updateStars()

    // Оновлення гравця
    this.player.update(deltaTime)

    // Спавн ворогів
    this.enemySpawnTimer += deltaTime
    if (this.enemySpawnTimer > Math.max(1000 - this.difficulty * 100, 300)) {
      this.spawnEnemy()
      this.enemySpawnTimer = 0
    }

    // Спавн монет
    this.coinSpawnTimer += deltaTime
    if (this.coinSpawnTimer > Math.max(3000 - this.difficulty * 200, 1500)) {
      this.spawnCoin()
      this.coinSpawnTimer = 0
    }

    // Спавн перешкод
    this.obstacleSpawnTimer += deltaTime
    if (this.obstacleSpawnTimer > Math.max(5000 - this.difficulty * 300, 2000)) {
      this.spawnObstacle()
      this.obstacleSpawnTimer = 0
    }

    // Оновлення об'єктів
    this.updateBullets(deltaTime)
    this.updateEnemies(deltaTime)
    this.updateObstacles(deltaTime)
    this.updateCoins(deltaTime)
    this.updateParticles(deltaTime)

    // Перевірка колізій
    this.checkCollisions()
  }

  updateStars() {
    this.stars.forEach((star) => {
      star.x -= star.speed
      if (star.x < 0) {
        star.x = this.width
        star.y = Math.random() * this.height
      }
    })
  }

  spawnEnemy() {
    const types = ["basic", "fast", "heavy"]
    const type = types[Math.floor(Math.random() * types.length)]
    this.enemies.push(new Enemy(this, type))
  }

  spawnCoin() {
    this.coins.push(new Coin(this))
  }

  spawnObstacle() {
    this.obstacles.push(new Obstacle(this))
  }

  updateBullets(deltaTime) {
    this.bullets = this.bullets.filter((bullet) => {
      bullet.update(deltaTime)
      return bullet.x < this.width && bullet.x > -bullet.width
    })
  }

  updateEnemies(deltaTime) {
    this.enemies = this.enemies.filter((enemy) => {
      enemy.update(deltaTime)
      return enemy.x > -enemy.width
    })
  }

  updateObstacles(deltaTime) {
    this.obstacles = this.obstacles.filter((obstacle) => {
      obstacle.update(deltaTime)
      return obstacle.x > -obstacle.width
    })
  }

  updateCoins(deltaTime) {
    this.coins = this.coins.filter((coin) => {
      coin.update(deltaTime)
      return coin.x > -coin.width
    })
  }

  updateParticles(deltaTime) {
    this.particles = this.particles.filter((particle) => {
      particle.update(deltaTime)
      return particle.life > 0
    })
  }

  checkCollisions() {
    // Кулі vs Вороги
    this.bullets.forEach((bullet, bulletIndex) => {
      this.enemies.forEach((enemy, enemyIndex) => {
        if (this.isColliding(bullet, enemy)) {
          this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2)
          this.bullets.splice(bulletIndex, 1)
          this.enemies.splice(enemyIndex, 1)
          this.score += enemy.points
          this.updateUI()
        }
      })
    })

    // Кулі vs Перешкоди
    this.bullets.forEach((bullet, bulletIndex) => {
      this.obstacles.forEach((obstacle, obstacleIndex) => {
        if (this.isColliding(bullet, obstacle)) {
          this.createExplosion(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2)
          this.bullets.splice(bulletIndex, 1)
          if (obstacle.destructible) {
            this.obstacles.splice(obstacleIndex, 1)
            this.score += 5
            this.updateUI()
          }
        }
      })
    })

    // Гравець vs Вороги
    this.enemies.forEach((enemy, enemyIndex) => {
      if (this.isColliding(this.player, enemy)) {
        this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2)
        this.enemies.splice(enemyIndex, 1)
        this.lives--
        this.updateUI()

        if (this.lives <= 0) {
          this.gameOver()
        }
      }
    })

    // Гравець vs Перешкоди
    this.obstacles.forEach((obstacle, obstacleIndex) => {
      if (this.isColliding(this.player, obstacle)) {
        this.createExplosion(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2)
        this.lives--
        this.updateUI()

        if (this.lives <= 0) {
          this.gameOver()
        }
      }
    })

    // Гравець vs Монети
    this.coins.forEach((coin, coinIndex) => {
      if (this.isColliding(this.player, coin)) {
        this.createCoinEffect(coin.x + coin.width / 2, coin.y + coin.height / 2)
        this.coins.splice(coinIndex, 1)
        this.score += coin.value
        this.updateUI()
      }
    })
  }

  isColliding(obj1, obj2) {
    return (
      obj1.x < obj2.x + obj2.width &&
      obj1.x + obj1.width > obj2.x &&
      obj1.y < obj2.y + obj2.height &&
      obj1.y + obj1.height > obj2.y
    )
  }

  createExplosion(x, y) {
    for (let i = 0; i < 10; i++) {
      this.particles.push(new Particle(x, y, "explosion"))
    }
  }

  createCoinEffect(x, y) {
    for (let i = 0; i < 5; i++) {
      this.particles.push(new Particle(x, y, "coin"))
    }
  }

  render() {
    // Очищення екрану
    this.ctx.fillStyle = "#000"
    this.ctx.fillRect(0, 0, this.width, this.height)

    // Малювання зірок
    this.renderStars()

    if (this.gameState === "menu") {
      this.renderMenu()
    } else if (this.gameState === "playing" || this.gameState === "paused") {
      // Малювання всіх об'єктів
      this.player.render(this.ctx)
      this.bullets.forEach((bullet) => bullet.render(this.ctx))
      this.enemies.forEach((enemy) => enemy.render(this.ctx))
      this.obstacles.forEach((obstacle) => obstacle.render(this.ctx))
      this.coins.forEach((coin) => coin.render(this.ctx))
      this.particles.forEach((particle) => particle.render(this.ctx))

      if (this.gameState === "paused") {
        this.renderPauseScreen()
      }
    }
  }

  renderStars() {
    this.ctx.fillStyle = "#fff"
    this.stars.forEach((star) => {
      this.ctx.globalAlpha = Math.random() * 0.8 + 0.2
      this.ctx.fillRect(star.x, star.y, star.size, star.size)
    })
    this.ctx.globalAlpha = 1
  }

  renderMenu() {
    this.ctx.fillStyle = "#00ff41"
    this.ctx.font = "48px Orbitron"
    this.ctx.textAlign = "center"
    this.ctx.fillText("ENDLESS JETFIGHTER", this.width / 2, this.height / 2 - 50)

    this.ctx.font = "24px Orbitron"
    this.ctx.fillText('Натисніть "ПОЧАТИ ГРУ" для початку', this.width / 2, this.height / 2 + 50)
  }

  renderPauseScreen() {
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
    this.ctx.fillRect(0, 0, this.width, this.height)

    this.ctx.fillStyle = "#00ff41"
    this.ctx.font = "48px Orbitron"
    this.ctx.textAlign = "center"
    this.ctx.fillText("ПАУЗА", this.width / 2, this.height / 2)
  }

  gameLoop(currentTime = 0) {
    const deltaTime = currentTime - this.lastTime
    this.lastTime = currentTime

    this.update(deltaTime)
    this.render()

    requestAnimationFrame((time) => this.gameLoop(time))
  }
}

class Player {
  constructor(game) {
    this.game = game
    this.width = 40
    this.height = 30
    this.x = 50
    this.y = game.height / 2 - this.height / 2
    this.speed = 300
    this.shootCooldown = 0
    this.shootDelay = 200
  }

  reset() {
    this.x = 50
    this.y = this.game.height / 2 - this.height / 2
    this.shootCooldown = 0
  }

  update(deltaTime) {
    // Рух
    if (this.game.keys["KeyW"] || this.game.keys["ArrowUp"]) {
      this.y -= (this.speed * deltaTime) / 1000
    }
    if (this.game.keys["KeyS"] || this.game.keys["ArrowDown"]) {
      this.y += (this.speed * deltaTime) / 1000
    }
    if (this.game.keys["KeyA"] || this.game.keys["ArrowLeft"]) {
      this.x -= (this.speed * deltaTime) / 1000
    }
    if (this.game.keys["KeyD"] || this.game.keys["ArrowRight"]) {
      this.x += (this.speed * deltaTime) / 1000
    }

    // Обмеження руху
    this.x = Math.max(0, Math.min(this.game.width - this.width, this.x))
    this.y = Math.max(0, Math.min(this.game.height - this.height, this.y))

    // Оновлення кулдауну стрільби
    if (this.shootCooldown > 0) {
      this.shootCooldown -= deltaTime
    }
  }

  shoot() {
    if (this.shootCooldown <= 0) {
      this.game.bullets.push(new Bullet(this.x + this.width, this.y + this.height / 2, 1))
      this.shootCooldown = this.shootDelay
    }
  }

  render(ctx) {
    // Тіло літака
    ctx.fillStyle = "#00ff41"
    ctx.fillRect(this.x, this.y + 10, this.width - 10, 10)

    // Ніс літака
    ctx.fillStyle = "#00cc33"
    ctx.fillRect(this.x + this.width - 10, this.y + 5, 10, 20)

    // Крила
    ctx.fillStyle = "#00aa22"
    ctx.fillRect(this.x + 5, this.y, 20, 5)
    ctx.fillRect(this.x + 5, this.y + 25, 20, 5)

    // Двигун
    ctx.fillStyle = "#ff4400"
    ctx.fillRect(this.x - 5, this.y + 12, 8, 6)
  }
}

class Bullet {
  constructor(x, y, direction) {
    this.x = x
    this.y = y
    this.width = 8
    this.height = 3
    this.speed = 500
    this.direction = direction // 1 для гравця, -1 для ворогів
  }

  update(deltaTime) {
    this.x += (this.speed * this.direction * deltaTime) / 1000
  }

  render(ctx) {
    ctx.fillStyle = this.direction === 1 ? "#00ff41" : "#ff0040"
    ctx.fillRect(this.x, this.y, this.width, this.height)

    // Ефект світіння
    ctx.shadowColor = this.direction === 1 ? "#00ff41" : "#ff0040"
    ctx.shadowBlur = 5
    ctx.fillRect(this.x, this.y, this.width, this.height)
    ctx.shadowBlur = 0
  }
}

class Enemy {
  constructor(game, type = "basic") {
    this.game = game
    this.type = type
    this.x = game.width
    this.y = Math.random() * (game.height - 40)

    switch (type) {
      case "basic":
        this.width = 30
        this.height = 25
        this.speed = 100 + game.difficulty * 20
        this.health = 1
        this.points = 10
        this.color = "#ff0040"
        break
      case "fast":
        this.width = 25
        this.height = 20
        this.speed = 200 + game.difficulty * 30
        this.health = 1
        this.points = 15
        this.color = "#ff8800"
        break
      case "heavy":
        this.width = 40
        this.height = 35
        this.speed = 60 + game.difficulty * 10
        this.health = 2
        this.points = 25
        this.color = "#8800ff"
        break
    }
  }

  update(deltaTime) {
    this.x -= (this.speed * deltaTime) / 1000

    // Простий AI - рух вгору-вниз
    if (this.type === "fast") {
      this.y += Math.sin(this.x * 0.01) * 2
    }
  }

  render(ctx) {
    // Тіло ворога
    ctx.fillStyle = this.color
    ctx.fillRect(this.x, this.y + 8, this.width - 8, 10)

    // Ніс ворога
    ctx.fillStyle = this.color
    ctx.fillRect(this.x, this.y + 5, 8, 16)

    // Крила
    ctx.fillStyle = this.color
    ctx.fillRect(this.x + 10, this.y, 15, 5)
    ctx.fillRect(this.x + 10, this.y + 21, 15, 5)

    // Двигун
    ctx.fillStyle = "#ff4400"
    ctx.fillRect(this.x + this.width - 5, this.y + 10, 8, 6)
  }
}

class Obstacle {
  constructor(game) {
    this.game = game
    this.width = 20 + Math.random() * 30
    this.height = 20 + Math.random() * 30
    this.x = game.width
    this.y = Math.random() * (game.height - this.height)
    this.speed = 80 + game.difficulty * 15
    this.destructible = Math.random() > 0.5
    this.color = this.destructible ? "#666" : "#333"
  }

  update(deltaTime) {
    this.x -= (this.speed * deltaTime) / 1000
  }

  render(ctx) {
    ctx.fillStyle = this.color
    ctx.fillRect(this.x, this.y, this.width, this.height)

    // Деталі
    ctx.fillStyle = this.destructible ? "#888" : "#555"
    ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4)

    if (!this.destructible) {
      // Позначка для нерушимих перешкод
      ctx.fillStyle = "#ff0040"
      ctx.fillRect(this.x + this.width / 2 - 2, this.y + this.height / 2 - 2, 4, 4)
    }
  }
}

class Coin {
  constructor(game) {
    this.game = game
    this.width = 15
    this.height = 15
    this.x = game.width
    this.y = Math.random() * (game.height - this.height)
    this.speed = 120
    this.value = 5
    this.rotation = 0
  }

  update(deltaTime) {
    this.x -= (this.speed * deltaTime) / 1000
    this.rotation += deltaTime * 0.005
  }

  render(ctx) {
    ctx.save()
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2)
    ctx.rotate(this.rotation)

    // Монета
    ctx.fillStyle = "#ffd700"
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height)

    // Внутрішня частина
    ctx.fillStyle = "#ffed4e"
    ctx.fillRect(-this.width / 2 + 2, -this.height / 2 + 2, this.width - 4, this.height - 4)

    // Символ
    ctx.fillStyle = "#ffd700"
    ctx.fillRect(-2, -6, 4, 12)
    ctx.fillRect(-6, -2, 12, 4)

    ctx.restore()
  }
}

class Particle {
  constructor(x, y, type) {
    this.x = x
    this.y = y
    this.type = type
    this.life = 1
    this.maxLife = 1

    if (type === "explosion") {
      this.vx = (Math.random() - 0.5) * 200
      this.vy = (Math.random() - 0.5) * 200
      this.color = Math.random() > 0.5 ? "#ff4400" : "#ff8800"
      this.size = Math.random() * 4 + 2
    } else if (type === "coin") {
      this.vx = (Math.random() - 0.5) * 100
      this.vy = (Math.random() - 0.5) * 100
      this.color = "#ffd700"
      this.size = Math.random() * 3 + 1
    }
  }

  update(deltaTime) {
    this.x += (this.vx * deltaTime) / 1000
    this.y += (this.vy * deltaTime) / 1000
    this.life -= deltaTime / 1000

    // Гравітація для частинок вибуху
    if (this.type === "explosion") {
      this.vy += (100 * deltaTime) / 1000
    }
  }

  render(ctx) {
    const alpha = this.life / this.maxLife
    ctx.globalAlpha = alpha
    ctx.fillStyle = this.color
    ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size)
    ctx.globalAlpha = 1
  }
}

// Запуск гри
window.addEventListener("load", () => {
  new Game()
})
