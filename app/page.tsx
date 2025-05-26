"use client"

import { useEffect, useRef, useState } from "react"

export default function EndlessJetfighter() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameRef = useRef<Game | null>(null)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [highScore, setHighScore] = useState(0)
  const [gameState, setGameState] = useState<"menu" | "playing" | "paused" | "gameOver">("menu")
  const [speedMultiplier, setSpeedMultiplier] = useState(1)
  const [timeToNextSpeedUp, setTimeToNextSpeedUp] = useState(30)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || "ontouchstart" in window)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    const resizeCanvas = () => {
      if (canvasRef.current) {
        const vw = window.innerWidth
        const vh = window.innerHeight

        // Залишаємо більше місця для UI на мобільних
        const uiHeight = isMobile ? 280 : 200
        const canvasHeight = vh - uiHeight

        canvasRef.current.width = vw - 32 // padding
        canvasRef.current.height = canvasHeight

        if (gameRef.current) {
          gameRef.current.updateSize(canvasRef.current.width, canvasRef.current.height)
        }
      }
    }

    if (canvasRef.current) {
      gameRef.current = new Game(canvasRef.current, {
        onScoreUpdate: setScore,
        onLivesUpdate: setLives,
        onHighScoreUpdate: setHighScore,
        onGameStateUpdate: setGameState,
        onSpeedUpdate: setSpeedMultiplier,
        onTimeUpdate: setTimeToNextSpeedUp,
      })

      resizeCanvas()
      window.addEventListener("resize", resizeCanvas)
    }

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      window.removeEventListener("resize", checkMobile)
      if (gameRef.current) {
        gameRef.current.destroy()
      }
    }
  }, [isMobile])

  const startGame = () => {
    gameRef.current?.startGame()
  }

  const togglePause = () => {
    gameRef.current?.togglePause()
  }

  const restartGame = () => {
    gameRef.current?.restartGame()
  }

  const getSpeedColor = () => {
    if (speedMultiplier >= 3) return "text-red-400"
    if (speedMultiplier >= 2) return "text-orange-400"
    if (speedMultiplier >= 1.5) return "text-yellow-400"
    return "text-green-400"
  }

  const getSpeedLabel = () => {
    if (speedMultiplier >= 3) return "ЕКСТРИМ"
    if (speedMultiplier >= 2) return "ШВИДКО"
    if (speedMultiplier >= 1.5) return "ПРИСКОРЕНО"
    return "НОРМАЛЬНО"
  }

  // Mobile controls handlers
  const handleMoveStart = (direction: string) => {
    if (gameRef.current) {
      gameRef.current.setMobileInput(direction, true)
    }
  }

  const handleMoveEnd = (direction: string) => {
    if (gameRef.current) {
      gameRef.current.setMobileInput(direction, false)
    }
  }

  const handleShoot = () => {
    if (gameRef.current && gameState === "playing") {
      gameRef.current.mobileShoot()
    }
  }

  return (
    <div className="h-screen w-screen bg-gradient-to-b from-gray-900 via-blue-900 to-purple-900 flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col bg-black/80">
        {/* Header */}
        <div className="text-center py-3 px-4 border-b border-green-400 shrink-0">
          <h1 className={`font-bold text-green-400 mb-2 tracking-wider font-mono ${isMobile ? "text-xl" : "text-2xl"}`}>
            🚀 JETFIGHTER
          </h1>
          <div
            className={`flex justify-center gap-3 text-green-400 font-mono flex-wrap ${isMobile ? "text-xs" : "text-sm"}`}
          >
            <div className="bg-green-400/10 px-3 py-1 border border-green-400 rounded">
              <span className="opacity-80">РАХУНОК: </span>
              <span className="font-bold">{score}</span>
            </div>
            <div className="bg-green-400/10 px-3 py-1 border border-green-400 rounded">
              <span className="opacity-80">РЕКОРД: </span>
              <span className="font-bold">{highScore}</span>
            </div>
            <div className="bg-green-400/10 px-3 py-1 border border-green-400 rounded">
              <span className="opacity-80">ЖИТТЯ: </span>
              <span className="font-bold">{lives}</span>
            </div>

            {/* Speed Indicator */}
            {gameState === "playing" && (
              <>
                <div
                  className={`bg-opacity-20 px-3 py-1 border rounded ${
                    speedMultiplier >= 3
                      ? "bg-red-400/20 border-red-400"
                      : speedMultiplier >= 2
                        ? "bg-orange-400/20 border-orange-400"
                        : speedMultiplier >= 1.5
                          ? "bg-yellow-400/20 border-yellow-400"
                          : "bg-green-400/20 border-green-400"
                  }`}
                >
                  <span className="opacity-80">ШВИДКІСТЬ: </span>
                  <span className={`font-bold ${getSpeedColor()}`}>{speedMultiplier.toFixed(1)}x</span>
                  {!isMobile && <span className={`ml-1 text-xs ${getSpeedColor()}`}>{getSpeedLabel()}</span>}
                </div>

                <div className="bg-blue-400/20 px-3 py-1 border border-blue-400 rounded">
                  <span className="opacity-80">ПРИСКОРЕННЯ ЧЕРЕЗ: </span>
                  <span className="font-bold text-blue-400">{timeToNextSpeedUp}с</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Canvas - займає весь доступний простір */}
        <div className="flex-1 flex items-center justify-center p-4">
          <canvas
            ref={canvasRef}
            className="border-2 border-green-400 rounded bg-black w-full h-full"
            style={{ imageRendering: "pixelated" }}
          />
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center p-3 border-t border-green-400 shrink-0">
          {!isMobile ? (
            <div className="text-green-400 font-mono text-xs">
              <div>🎮 WASD/Стрілки - рух</div>
              <div>🔫 Пробіл - стрільба • ⏸️ P - пауза</div>
            </div>
          ) : (
            <div className="text-green-400 font-mono text-xs">
              <div>📱 Використовуйте віртуальні кнопки</div>
            </div>
          )}

          <div className="flex gap-2">
            {gameState === "menu" && (
              <button
                onClick={startGame}
                className="bg-green-400 text-black px-4 py-2 font-bold rounded hover:bg-green-300 transition-colors font-mono text-sm"
              >
                ПОЧАТИ
              </button>
            )}

            {gameState === "playing" && (
              <button
                onClick={togglePause}
                className="bg-yellow-400 text-black px-4 py-2 font-bold rounded hover:bg-yellow-300 transition-colors font-mono text-sm"
              >
                ПАУЗА
              </button>
            )}

            {gameState === "paused" && (
              <button
                onClick={togglePause}
                className="bg-green-400 text-black px-4 py-2 font-bold rounded hover:bg-green-300 transition-colors font-mono text-sm"
              >
                ПРОДОВЖИТИ
              </button>
            )}
          </div>
        </div>

        {/* Mobile Controls */}
        {isMobile && gameState === "playing" && (
          <div className="fixed inset-0 pointer-events-none z-10">
            {/* Movement Controls - Left Side */}
            <div className="absolute left-4 bottom-20 pointer-events-auto">
              <div className="relative w-32 h-32">
                {/* Up */}
                <button
                  onTouchStart={() => handleMoveStart("up")}
                  onTouchEnd={() => handleMoveEnd("up")}
                  onMouseDown={() => handleMoveStart("up")}
                  onMouseUp={() => handleMoveEnd("up")}
                  onMouseLeave={() => handleMoveEnd("up")}
                  className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-green-400/30 border-2 border-green-400 rounded-lg flex items-center justify-center text-green-400 font-bold text-xl active:bg-green-400/50 select-none"
                >
                  ↑
                </button>

                {/* Left */}
                <button
                  onTouchStart={() => handleMoveStart("left")}
                  onTouchEnd={() => handleMoveEnd("left")}
                  onMouseDown={() => handleMoveStart("left")}
                  onMouseUp={() => handleMoveEnd("left")}
                  onMouseLeave={() => handleMoveEnd("left")}
                  className="absolute top-1/2 left-0 transform -translate-y-1/2 w-12 h-12 bg-green-400/30 border-2 border-green-400 rounded-lg flex items-center justify-center text-green-400 font-bold text-xl active:bg-green-400/50 select-none"
                >
                  ←
                </button>

                {/* Right */}
                <button
                  onTouchStart={() => handleMoveStart("right")}
                  onTouchEnd={() => handleMoveEnd("right")}
                  onMouseDown={() => handleMoveStart("right")}
                  onMouseUp={() => handleMoveEnd("right")}
                  onMouseLeave={() => handleMoveEnd("right")}
                  className="absolute top-1/2 right-0 transform -translate-y-1/2 w-12 h-12 bg-green-400/30 border-2 border-green-400 rounded-lg flex items-center justify-center text-green-400 font-bold text-xl active:bg-green-400/50 select-none"
                >
                  →
                </button>

                {/* Down */}
                <button
                  onTouchStart={() => handleMoveStart("down")}
                  onTouchEnd={() => handleMoveEnd("down")}
                  onMouseDown={() => handleMoveStart("down")}
                  onMouseUp={() => handleMoveEnd("down")}
                  onMouseLeave={() => handleMoveEnd("down")}
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-green-400/30 border-2 border-green-400 rounded-lg flex items-center justify-center text-green-400 font-bold text-xl active:bg-green-400/50 select-none"
                >
                  ↓
                </button>
              </div>
            </div>

            {/* Shoot Button - Right Side */}
            <div className="absolute right-4 bottom-20 pointer-events-auto">
              <button
                onTouchStart={handleShoot}
                onMouseDown={handleShoot}
                className="w-20 h-20 bg-red-400/30 border-2 border-red-400 rounded-full flex items-center justify-center text-red-400 font-bold text-2xl active:bg-red-400/50 select-none"
              >
                🔫
              </button>
            </div>

            {/* Pause Button - Top Right */}
            <div className="absolute right-4 top-20 pointer-events-auto">
              <button
                onClick={togglePause}
                className="w-12 h-12 bg-yellow-400/30 border-2 border-yellow-400 rounded-lg flex items-center justify-center text-yellow-400 font-bold text-lg active:bg-yellow-400/50 select-none"
              >
                ⏸️
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Game Over Screen */}
      {gameState === "gameOver" && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-red-900 to-purple-900 border-2 border-red-400 rounded-lg p-6 text-center mx-4">
            <h2 className={`font-bold text-red-400 mb-4 font-mono ${isMobile ? "text-2xl" : "text-3xl"}`}>
              💥 GAME OVER
            </h2>
            <p className={`text-green-400 mb-2 font-mono ${isMobile ? "text-base" : "text-lg"}`}>
              Ваш рахунок: <span className="font-bold">{score}</span>
            </p>
            <p className={`text-blue-400 mb-2 font-mono ${isMobile ? "text-sm" : "text-base"}`}>
              Максимальна швидкість: <span className="font-bold">{speedMultiplier.toFixed(1)}x</span>
            </p>
            {score === highScore && score > 0 && (
              <p className={`text-yellow-400 mb-4 font-mono font-bold ${isMobile ? "text-sm" : "text-base"}`}>
                🏆 НОВИЙ РЕКОРД!
              </p>
            )}
            <button
              onClick={restartGame}
              className="bg-green-400 text-black px-6 py-3 font-bold rounded hover:bg-green-300 transition-colors font-mono"
            >
              ГРАТИ ЗНОВУ
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Game Classes
class Game {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private width: number
  private height: number
  private gameState: "menu" | "playing" | "paused" | "gameOver" = "menu"
  private score = 0
  private lives = 3
  private highScore = 0
  private callbacks: any

  private player: Player
  private bullets: Bullet[] = []
  private enemies: Enemy[] = []
  private obstacles: Obstacle[] = []
  private coins: Coin[] = []
  private particles: Particle[] = []
  private stars: Star[] = []

  private keys: { [key: string]: boolean } = {}
  private mobileInputs: { [key: string]: boolean } = {}
  private lastTime = 0
  private enemySpawnTimer = 0
  private coinSpawnTimer = 0
  private obstacleSpawnTimer = 0
  private difficulty = 1

  private animationId: number | null = null

  private speedMultiplier = 1
  private speedTimer = 0

  private bossSpawnTimer = 0
  private bosses: Boss[] = []

  constructor(canvas: HTMLCanvasElement, callbacks: any) {
    this.canvas = canvas
    this.ctx = canvas.getContext("2d")!
    this.width = canvas.width
    this.height = canvas.height
    this.callbacks = callbacks

    this.player = new Player(this)
    this.initStars()
    this.setupEventListeners()
    this.loadHighScore()
    this.gameLoop()
  }

  updateSize(width: number, height: number) {
    this.width = width
    this.height = height
    this.canvas.width = width
    this.canvas.height = height

    // Переініціалізувати зірки для нового розміру
    this.stars = []
    this.initStars()

    // Оновити позицію гравця якщо потрібно
    if (this.player.x > width - this.player.width) {
      this.player.x = width / 2 - this.player.width / 2
    }
    if (this.player.y > height - this.player.height) {
      this.player.y = height - this.player.height - 50
    }
  }

  private initStars() {
    for (let i = 0; i < 150; i++) {
      this.stars.push(new Star(window.innerWidth, window.innerHeight))
    }
  }

  private setupEventListeners() {
    const handleKeyDown = (e: KeyboardEvent) => {
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
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      this.keys[e.code] = false
    }

    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("keyup", handleKeyUp)
  }

  // Mobile input methods
  setMobileInput(direction: string, pressed: boolean) {
    this.mobileInputs[direction] = pressed
  }

  mobileShoot() {
    if (this.gameState === "playing") {
      this.player.shoot()
    }
  }

  private loadHighScore() {
    const saved = localStorage.getItem("jetfighterHighScore")
    if (saved) {
      this.highScore = Number.parseInt(saved)
      this.callbacks.onHighScoreUpdate(this.highScore)
    }
  }

  private saveHighScore() {
    localStorage.setItem("jetfighterHighScore", this.highScore.toString())
  }

  startGame() {
    this.gameState = "playing"
    this.score = 0
    this.lives = 3
    this.difficulty = 1
    this.speedMultiplier = 1
    this.speedTimer = 0
    this.player.reset()
    this.bullets = []
    this.enemies = []
    this.obstacles = []
    this.coins = []
    this.particles = []
    this.enemySpawnTimer = 0
    this.coinSpawnTimer = 0
    this.obstacleSpawnTimer = 0
    this.bossSpawnTimer = 0
    this.bosses = []
    this.mobileInputs = {}

    this.updateCallbacks()
  }

  togglePause() {
    if (this.gameState === "playing") {
      this.gameState = "paused"
    } else if (this.gameState === "paused") {
      this.gameState = "playing"
    }
    this.callbacks.onGameStateUpdate(this.gameState)
  }

  restartGame() {
    this.startGame()
  }

  gameOver() {
    this.gameState = "gameOver"

    if (this.score > this.highScore) {
      this.highScore = this.score
      this.saveHighScore()
      this.callbacks.onHighScoreUpdate(this.highScore)
    }

    this.callbacks.onGameStateUpdate(this.gameState)
  }

  private updateCallbacks() {
    this.callbacks.onScoreUpdate(this.score)
    this.callbacks.onLivesUpdate(this.lives)
    this.callbacks.onGameStateUpdate(this.gameState)
    this.callbacks.onSpeedUpdate(this.speedMultiplier)

    // Calculate time to next speed up
    const timeToNext = Math.ceil((30000 - this.speedTimer) / 1000)
    this.callbacks.onTimeUpdate(Math.max(0, timeToNext))
  }

  private update(deltaTime: number) {
    if (this.gameState !== "playing") return

    // Update speed multiplier every 30 seconds
    this.speedTimer += deltaTime
    if (this.speedTimer > 30000) {
      // 30 seconds
      this.speedMultiplier += 0.3
      this.speedTimer = 0

      // Create speed up effect
      this.createSpeedUpEffect()

      console.log(`Speed increased! Multiplier: ${this.speedMultiplier.toFixed(1)}`)
    }

    // Update difficulty
    this.difficulty += deltaTime * 0.00001

    // Update stars with speed multiplier
    this.stars.forEach((star) => {
      star.speed = (Math.random() * 3 + 1) * this.speedMultiplier
      star.update()
    })

    // Update player
    this.player.update(deltaTime)

    // Spawn enemies (faster with speed multiplier)
    this.enemySpawnTimer += deltaTime
    if (this.enemySpawnTimer > Math.max((2000 - this.difficulty * 100) / this.speedMultiplier, 300)) {
      this.spawnEnemy()
      this.enemySpawnTimer = 0
    }

    // Spawn coins (faster with speed multiplier)
    this.coinSpawnTimer += deltaTime
    if (this.coinSpawnTimer > Math.max((4000 - this.difficulty * 200) / this.speedMultiplier, 1500)) {
      this.spawnCoin()
      this.coinSpawnTimer = 0
    }

    // Spawn obstacles (faster with speed multiplier)
    this.obstacleSpawnTimer += deltaTime
    if (this.obstacleSpawnTimer > Math.max((6000 - this.difficulty * 300) / this.speedMultiplier, 2500)) {
      this.spawnObstacle()
      this.obstacleSpawnTimer = 0
    }

    // Spawn bosses every 2 minutes (120 seconds)
    this.bossSpawnTimer += deltaTime
    if (this.bossSpawnTimer > 120000) {
      // 2 minutes
      this.spawnBoss()
      this.bossSpawnTimer = 0
    }

    // Update objects with speed multiplier
    this.bullets = this.bullets.filter((bullet) => {
      bullet.update(deltaTime, this.speedMultiplier)
      return bullet.y > -50 && bullet.y < this.height + 50
    })

    this.enemies = this.enemies.filter((enemy) => {
      enemy.update(deltaTime, this.speedMultiplier)
      return enemy.y < this.height + enemy.height
    })

    this.obstacles = this.obstacles.filter((obstacle) => {
      obstacle.update(deltaTime, this.speedMultiplier)
      return obstacle.y < this.height + obstacle.height
    })

    this.coins = this.coins.filter((coin) => {
      coin.update(deltaTime, this.speedMultiplier)
      return coin.y < this.height + coin.height
    })

    this.particles = this.particles.filter((particle) => {
      particle.update(deltaTime)
      return particle.life > 0
    })

    this.bosses = this.bosses.filter((boss) => {
      boss.update(deltaTime, this.speedMultiplier)
      return boss.y < this.height + boss.height && boss.health > 0
    })

    // Update callbacks
    this.updateCallbacks()

    // Check collisions
    this.checkCollisions()
  }

  private createSpeedUpEffect() {
    // Create special particles for speed up effect
    for (let i = 0; i < 30; i++) {
      this.particles.push(new Particle(Math.random() * this.width, Math.random() * this.height, "speedup"))
    }
  }

  private spawnEnemy() {
    this.enemies.push(new Enemy(this))
  }

  private spawnCoin() {
    this.coins.push(new Coin(this))
  }

  private spawnObstacle() {
    this.obstacles.push(new Obstacle(this))
  }

  private spawnBoss() {
    this.bosses.push(new Boss(this))
  }

  private checkCollisions() {
    // Bullets vs Enemies
    this.bullets.forEach((bullet, bulletIndex) => {
      this.enemies.forEach((enemy, enemyIndex) => {
        if (this.isColliding(bullet, enemy)) {
          this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2)
          this.bullets.splice(bulletIndex, 1)
          this.enemies.splice(enemyIndex, 1)
          this.score += 10
          this.callbacks.onScoreUpdate(this.score)
        }
      })
    })

    // Bullets vs Bosses
    this.bullets.forEach((bullet, bulletIndex) => {
      this.bosses.forEach((boss, bossIndex) => {
        if (this.isColliding(bullet, boss)) {
          this.createExplosion(boss.x + boss.width / 2, boss.y + boss.height / 2)
          this.bullets.splice(bulletIndex, 1)
          boss.takeDamage(1)

          if (boss.health <= 0) {
            this.createBossExplosion(boss.x + boss.width / 2, boss.y + boss.height / 2)
            this.bosses.splice(bossIndex, 1)
            this.score += 100
            this.callbacks.onScoreUpdate(this.score)
          } else {
            this.score += 5
            this.callbacks.onScoreUpdate(this.score)
          }
        }
      })
    })

    // Player vs Enemies
    this.enemies.forEach((enemy, enemyIndex) => {
      if (this.isColliding(this.player, enemy)) {
        this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2)
        this.enemies.splice(enemyIndex, 1)
        this.lives--
        this.callbacks.onLivesUpdate(this.lives)

        if (this.lives <= 0) {
          this.gameOver()
        }
      }
    })

    // Player vs Obstacles
    this.obstacles.forEach((obstacle, obstacleIndex) => {
      if (this.isColliding(this.player, obstacle)) {
        this.createExplosion(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2)
        this.obstacles.splice(obstacleIndex, 1)
        this.lives--
        this.callbacks.onLivesUpdate(this.lives)

        if (this.lives <= 0) {
          this.gameOver()
        }
      }
    })

    // Player vs Coins
    this.coins.forEach((coin, coinIndex) => {
      if (this.isColliding(this.player, coin)) {
        this.createCoinEffect(coin.x + coin.width / 2, coin.y + coin.height / 2)
        this.coins.splice(coinIndex, 1)
        this.score += 5
        this.callbacks.onScoreUpdate(this.score)
      }
    })

    // Player vs Bosses
    this.bosses.forEach((boss, bossIndex) => {
      if (this.isColliding(this.player, boss)) {
        this.createExplosion(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2)
        this.lives -= 2 // Boss deals more damage
        this.callbacks.onLivesUpdate(this.lives)

        if (this.lives <= 0) {
          this.gameOver()
        }
      }
    })
  }

  private isColliding(obj1: any, obj2: any): boolean {
    return (
      obj1.x < obj2.x + obj2.width &&
      obj1.x + obj1.width > obj2.x &&
      obj1.y < obj2.y + obj2.height &&
      obj1.y + obj1.height > obj2.y
    )
  }

  private createExplosion(x: number, y: number) {
    for (let i = 0; i < 8; i++) {
      this.particles.push(new Particle(x, y, "explosion"))
    }
  }

  private createBossExplosion(x: number, y: number) {
    for (let i = 0; i < 20; i++) {
      this.particles.push(new Particle(x, y, "explosion"))
    }
  }

  private createCoinEffect(x: number, y: number) {
    for (let i = 0; i < 5; i++) {
      this.particles.push(new Particle(x, y, "coin"))
    }
  }

  private render() {
    // Clear screen
    this.ctx.fillStyle = "#000"
    this.ctx.fillRect(0, 0, this.width, this.height)

    // Render stars
    this.stars.forEach((star) => star.render(this.ctx))

    if (this.gameState === "menu") {
      this.renderMenu()
    } else if (this.gameState === "playing" || this.gameState === "paused") {
      // Render game objects
      this.player.render(this.ctx)
      this.bullets.forEach((bullet) => bullet.render(this.ctx))
      this.enemies.forEach((enemy) => enemy.render(this.ctx))
      this.obstacles.forEach((obstacle) => obstacle.render(this.ctx))
      this.coins.forEach((coin) => coin.render(this.ctx))
      this.particles.forEach((particle) => particle.render(this.ctx))
      this.bosses.forEach((boss) => boss.render(this.ctx))

      if (this.gameState === "paused") {
        this.renderPauseScreen()
      }
    }
  }

  private renderMenu() {
    this.ctx.fillStyle = "#00ff41"
    this.ctx.font = "32px monospace"
    this.ctx.textAlign = "center"
    this.ctx.fillText("ENDLESS JETFIGHTER", this.width / 2, this.height / 2 - 50)

    this.ctx.font = "18px monospace"
    this.ctx.fillText('Натисніть "ПОЧАТИ" для початку', this.width / 2, this.height / 2 + 50)
  }

  private renderPauseScreen() {
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
    this.ctx.fillRect(0, 0, this.width, this.height)

    this.ctx.fillStyle = "#00ff41"
    this.ctx.font = "32px monospace"
    this.ctx.textAlign = "center"
    this.ctx.fillText("ПАУЗА", this.width / 2, this.height / 2)
  }

  private gameLoop = (currentTime = 0) => {
    const deltaTime = currentTime - this.lastTime
    this.lastTime = currentTime

    this.update(deltaTime)
    this.render()

    this.animationId = requestAnimationFrame(this.gameLoop)
  }

  getKeys() {
    return this.keys
  }

  getMobileInputs() {
    return this.mobileInputs
  }

  getWidth() {
    return this.width
  }

  getHeight() {
    return this.height
  }

  addBullet(bullet: Bullet) {
    this.bullets.push(bullet)
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }
  }
}

class Player {
  x = 200
  y = 400
  width = 30
  height = 40
  speed = 300
  shootCooldown = 0
  shootDelay = 200

  constructor(private game: Game) {
    this.reset()
  }

  reset() {
    this.x = this.game.getWidth() / 2 - this.width / 2
    this.y = this.game.getHeight() - this.height - 50
    this.shootCooldown = 0
  }

  update(deltaTime: number) {
    const keys = this.game.getKeys()
    const mobileInputs = this.game.getMobileInputs()

    // Movement (keyboard + mobile)
    if (keys["KeyA"] || keys["ArrowLeft"] || mobileInputs["left"]) {
      this.x -= (this.speed * deltaTime) / 1000
    }
    if (keys["KeyD"] || keys["ArrowRight"] || mobileInputs["right"]) {
      this.x += (this.speed * deltaTime) / 1000
    }
    if (keys["KeyW"] || keys["ArrowUp"] || mobileInputs["up"]) {
      this.y -= (this.speed * deltaTime) / 1000
    }
    if (keys["KeyS"] || keys["ArrowDown"] || mobileInputs["down"]) {
      this.y += (this.speed * deltaTime) / 1000
    }

    // Boundary constraints
    this.x = Math.max(0, Math.min(this.game.getWidth() - this.width, this.x))
    this.y = Math.max(0, Math.min(this.game.getHeight() - this.height, this.y))

    // Update shoot cooldown
    if (this.shootCooldown > 0) {
      this.shootCooldown -= deltaTime
    }
  }

  shoot() {
    if (this.shootCooldown <= 0) {
      // Стріляємо вгору
      this.game.addBullet(new Bullet(this.x + this.width / 2, this.y, -1))
      this.shootCooldown = this.shootDelay
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    // Player ship body (вертикальний літак)
    ctx.fillStyle = "#00ff41"
    ctx.fillRect(this.x + 10, this.y, 10, this.height - 10)

    // Ship nose (вгорі)
    ctx.fillStyle = "#00cc33"
    ctx.fillRect(this.x + 5, this.y, 20, 10)

    // Wings
    ctx.fillStyle = "#00aa22"
    ctx.fillRect(this.x, this.y + 5, 5, 20)
    ctx.fillRect(this.x + 25, this.y + 5, 5, 20)

    // Engine (внизу)
    ctx.fillStyle = "#ff4400"
    ctx.fillRect(this.x + 12, this.y + this.height - 5, 6, 8)
  }
}

class Bullet {
  width = 3
  height = 8
  speed = 500

  constructor(
    public x: number,
    public y: number,
    public direction: number, // -1 для вгору, 1 для вниз
  ) {}

  update(deltaTime: number, speedMultiplier = 1) {
    this.y += (this.speed * this.direction * deltaTime * speedMultiplier) / 1000
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.direction === -1 ? "#00ff41" : "#ff0040"
    ctx.fillRect(this.x, this.y, this.width, this.height)
  }
}

class Enemy {
  width = 25
  height = 30
  speed = 150
  color = "#ff0040"
  movePattern: "straight" | "zigzag" | "sine" = "straight"
  time = 0

  constructor(private game: Game) {
    this.x = Math.random() * (game.getWidth() - this.width)
    this.y = -this.height

    // Random movement pattern
    const patterns = ["straight", "zigzag", "sine"]
    this.movePattern = patterns[Math.floor(Math.random() * patterns.length)] as any

    // Random color
    const colors = ["#ff0040", "#ff8800", "#8800ff"]
    this.color = colors[Math.floor(Math.random() * colors.length)]
  }

  x: number
  y: number

  update(deltaTime: number, speedMultiplier = 1) {
    this.time += deltaTime / 1000
    this.y += (this.speed * deltaTime * speedMultiplier) / 1000

    // Different movement patterns
    switch (this.movePattern) {
      case "zigzag":
        this.x += Math.sin(this.time * 3) * 2 * speedMultiplier
        break
      case "sine":
        this.x += Math.sin(this.time * 2) * 1.5 * speedMultiplier
        break
    }

    // Keep within bounds
    this.x = Math.max(0, Math.min(this.game.getWidth() - this.width, this.x))
  }
  render(ctx: CanvasRenderingContext2D) {
    // Enemy ship body (вертикальний ворожий літак)
    ctx.fillStyle = this.color
    ctx.fillRect(this.x + 8, this.y, 10, this.height - 8)

    // Ship nose (внизу для ворога)
    ctx.fillStyle = this.color
    ctx.fillRect(this.x + 5, this.y + this.height - 8, 16, 8)

    // Wings
    ctx.fillStyle = this.color
    ctx.fillRect(this.x, this.y + 10, 5, 15)
    ctx.fillRect(this.x + 21, this.y + 10, 5, 15)

    // Engine (вгорі для ворога)
    ctx.fillStyle = "#ff4400"
    ctx.fillRect(this.x + 10, this.y - 5, 6, 8)
  }
}

class Obstacle {
  width: number
  height: number
  speed = 120
  color = "#666"

  constructor(private game: Game) {
    this.width = 20 + Math.random() * 30
    this.height = 20 + Math.random() * 30
    this.x = Math.random() * (game.getWidth() - this.width)
    this.y = -this.height // Спавн зверху
  }

  x: number
  y: number

  update(deltaTime: number, speedMultiplier = 1) {
    this.y += (this.speed * deltaTime * speedMultiplier) / 1000
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color
    ctx.fillRect(this.x, this.y, this.width, this.height)

    ctx.fillStyle = "#888"
    ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4)
  }
}

class Coin {
  width = 15
  height = 15
  speed = 120
  rotation = 0

  constructor(private game: Game) {
    this.x = Math.random() * (game.getWidth() - this.width)
    this.y = -this.height // Спавн зверху
  }

  x: number
  y: number

  update(deltaTime: number, speedMultiplier = 1) {
    this.y += (this.speed * deltaTime * speedMultiplier) / 1000
    this.rotation += deltaTime * 0.005 * speedMultiplier
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.save()
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2)
    ctx.rotate(this.rotation)

    // Coin
    ctx.fillStyle = "#ffd700"
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height)

    // Inner part
    ctx.fillStyle = "#ffed4e"
    ctx.fillRect(-this.width / 2 + 2, -this.height / 2 + 2, this.width - 4, this.height - 4)

    ctx.restore()
  }
}

class Particle {
  life = 1
  maxLife = 1
  vx: number
  vy: number
  color: string
  size: number

  constructor(
    public x: number,
    public y: number,
    public type: string,
  ) {
    if (type === "explosion") {
      this.vx = (Math.random() - 0.5) * 200
      this.vy = (Math.random() - 0.5) * 200
      this.color = Math.random() > 0.5 ? "#ff4400" : "#ff8800"
      this.size = Math.random() * 4 + 2
    } else if (type === "speedup") {
      this.vx = (Math.random() - 0.5) * 300
      this.vy = (Math.random() - 0.5) * 300
      this.color = Math.random() > 0.5 ? "#00ffff" : "#0088ff"
      this.size = Math.random() * 6 + 3
      this.life = 2
      this.maxLife = 2
    } else {
      this.vx = (Math.random() - 0.5) * 100
      this.vy = (Math.random() - 0.5) * 100
      this.color = "#ffd700"
      this.size = Math.random() * 3 + 1
    }
  }

  update(deltaTime: number) {
    this.x += (this.vx * deltaTime) / 1000
    this.y += (this.vy * deltaTime) / 1000
    this.life -= deltaTime / 1000

    if (this.type === "explosion") {
      this.vy += (100 * deltaTime) / 1000
    } else if (this.type === "speedup") {
      this.vy += (50 * deltaTime) / 1000
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    const alpha = this.life / this.maxLife
    ctx.globalAlpha = alpha
    ctx.fillStyle = this.color
    ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size)
    ctx.globalAlpha = 1
  }
}

class Star {
  x: number
  y: number
  speed: number
  size: number

  constructor(width: number, height: number) {
    this.x = Math.random() * width
    this.y = Math.random() * height
    this.speed = Math.random() * 3 + 1
    this.size = Math.random() * 2 + 1
  }

  update() {
    this.y += this.speed // Рух вниз для вертикальної гри
    if (this.y > window.innerHeight) {
      this.y = -10
      this.x = Math.random() * window.innerWidth
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "#fff"
    ctx.globalAlpha = Math.random() * 0.8 + 0.2
    ctx.fillRect(this.x, this.y, this.size, this.size)
    ctx.globalAlpha = 1
  }
}

class Boss {
  width = 80
  height = 60
  speed = 80
  health = 10
  maxHealth = 10
  color = "#ff0080"
  movePattern: "horizontal" | "circle" = "horizontal"
  time = 0
  shootCooldown = 0
  shootDelay = 1000

  constructor(private game: Game) {
    this.x = Math.random() * (game.getWidth() - this.width)
    this.y = -this.height

    // Random movement pattern
    const patterns = ["horizontal", "circle"]
    this.movePattern = patterns[Math.floor(Math.random() * patterns.length)] as any
  }

  x: number
  y: number

  takeDamage(damage: number) {
    this.health -= damage
  }

  update(deltaTime: number, speedMultiplier = 1) {
    this.time += deltaTime / 1000
    this.y += (this.speed * deltaTime * speedMultiplier) / 1000

    // Different movement patterns
    switch (this.movePattern) {
      case "horizontal":
        this.x += Math.sin(this.time * 1.5) * 3 * speedMultiplier
        break
      case "circle":
        this.x += Math.cos(this.time * 2) * 2 * speedMultiplier
        break
    }

    // Keep within bounds
    this.x = Math.max(0, Math.min(this.game.getWidth() - this.width, this.x))

    // Boss shooting
    this.shootCooldown -= deltaTime
    if (this.shootCooldown <= 0 && this.y > 0 && this.y < this.game.getHeight() / 2) {
      this.shoot()
      this.shootCooldown = this.shootDelay
    }
  }

  shoot() {
    // Boss shoots multiple bullets
    this.game.addBullet(new Bullet(this.x + this.width / 2 - 10, this.y + this.height, 1))
    this.game.addBullet(new Bullet(this.x + this.width / 2, this.y + this.height, 1))
    this.game.addBullet(new Bullet(this.x + this.width / 2 + 10, this.y + this.height, 1))
  }

  render(ctx: CanvasRenderingContext2D) {
    // Boss ship body
    ctx.fillStyle = this.color
    ctx.fillRect(this.x + 20, this.y, this.width - 40, this.height - 15)

    // Boss ship nose
    ctx.fillStyle = "#ff0060"
    ctx.fillRect(this.x + 15, this.y + this.height - 15, this.width - 30, 15)

    // Boss wings
    ctx.fillStyle = this.color
    ctx.fillRect(this.x, this.y + 15, 15, 30)
    ctx.fillRect(this.x + this.width - 15, this.y + 15, 15, 30)

    // Boss engines
    ctx.fillStyle = "#ff4400"
    ctx.fillRect(this.x + 25, this.y - 8, 8, 12)
    ctx.fillRect(this.x + this.width - 33, this.y - 8, 8, 12)

    // Health bar
    const healthBarWidth = this.width - 10
    const healthPercentage = this.health / this.maxHealth

    // Background
    ctx.fillStyle = "#333"
    ctx.fillRect(this.x + 5, this.y - 15, healthBarWidth, 6)

    // Health
    ctx.fillStyle = healthPercentage > 0.5 ? "#00ff00" : healthPercentage > 0.25 ? "#ffff00" : "#ff0000"
    ctx.fillRect(this.x + 5, this.y - 15, healthBarWidth * healthPercentage, 6)
  }
}
