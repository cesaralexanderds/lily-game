/**
 * Enhanced Plant Growing Game
 * Comprehensive improvements including accessibility, performance, and new features
 */

// Game Configuration
const CONFIG = {
  plantImages: ['1.png', '2.png', '3.png', '4.png', '5.png'],
  clicksNeeded: [25, 550, 6500, 25000, 250000],
  achievements: [
    { id: 'clicker_100', name: 'Clicker Novato', desc: '100 clics totales', threshold: 100 },
    { id: 'clicker_1000', name: 'Clicker Experto', desc: '1,000 clics totales', threshold: 1000 },
    { id: 'clicker_5000', name: 'Clicker Maestro', desc: '5,000 clics totales', threshold: 5000 },
    { id: 'clicker_25000', name: 'Clicker Legendario', desc: '25,000 clics totales', threshold: 25000 },
    { id: 'streak_50', name: 'Racha Caliente', desc: '50 clics seguidos', threshold: 50, type: 'streak' },
    { id: 'streak_200', name: 'Racha Legendaria', desc: '200 clics seguidos', threshold: 200, type: 'streak' },
    { id: 'stage_3', name: 'Cultivador', desc: 'Llegar a la etapa 3', threshold: 3, type: 'stage' },
    { id: 'stage_5', name: 'Maestro Jardinero', desc: '¡Lirio completo!', threshold: 5, type: 'stage' }
  ],
  milestones: [10, 50, 100, 500, 1000, 5000, 10000, 50000, 100000],
  upgradeCosts: {
    autoClicker: [200, 2000, 8000, 40000],
    clickPower: [500, 4000, 16000, 80000],
    criticalClick: [2000, 25000, 100000, 500000],
    streakBonus: [1000, 15000, 75000, 300000]
  }
};

// Game State Management Class
class GameState {
  constructor() {
    this.stage = this.loadData('plantStage', 0);
    this.clicksInCurrentStage = this.loadData('clicksInStage', 0);
    this.totalClicks = this.loadData('totalClicks', 0);
    this.clickStreak = this.loadData('clickStreak', 0);
    this.autoClickerLevel = this.loadData('autoClickerLevel', 0);
    this.clickPower = this.loadData('clickPower', 1);
    this.criticalClickLevel = this.loadData('criticalClickLevel', 0);
    this.streakBonusLevel = this.loadData('streakBonusLevel', 0);
    this.achievements = this.loadData('achievements', [], true);
    this.lastClickTime = this.loadData('lastClickTime', 0);
    this.prestigeLevel = this.loadData('prestigeLevel', 0);
    this.prestigeMultiplier = this.loadData('prestigeMultiplier', 1);
    this.settings = this.loadData('settings', {
      soundEnabled: true,
      theme: 'light'
    }, true);
  }

  loadData(key, defaultValue, isJSON = false) {
    try {
      const value = localStorage.getItem(key);
      if (value === null) return defaultValue;
      return isJSON ? JSON.parse(value) : (typeof defaultValue === 'number' ? parseInt(value) : value);
    } catch (error) {
      console.warn(`Error loading ${key}:`, error);
      return defaultValue;
    }
  }

  saveData(key, value) {
    try {
      const valueToSave = typeof value === 'object' ? JSON.stringify(value) : value.toString();
      localStorage.setItem(key, valueToSave);
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
      showNotification('Error al guardar datos', 'warning');
    }
  }

  save() {
    this.saveData('plantStage', this.stage);
    this.saveData('clicksInStage', this.clicksInCurrentStage);
    this.saveData('totalClicks', this.totalClicks);
    this.saveData('clickStreak', this.clickStreak);
    this.saveData('autoClickerLevel', this.autoClickerLevel);
    this.saveData('clickPower', this.clickPower);
    this.saveData('criticalClickLevel', this.criticalClickLevel);
    this.saveData('streakBonusLevel', this.streakBonusLevel);
    this.saveData('achievements', this.achievements);
    this.saveData('lastClickTime', this.lastClickTime);
    this.saveData('prestigeLevel', this.prestigeLevel);
    this.saveData('prestigeMultiplier', this.prestigeMultiplier);
    this.saveData('settings', this.settings);
  }
}

// Initialize game state
const gameState = new GameState();
let autoClickerInterval;

// Effects and Animations Manager
class EffectsManager {
  static createClickEffect(x, y, value) {
    const effect = document.createElement('div');
    effect.className = 'click-effect';
    effect.textContent = `+${Math.round(value)}`;
    effect.style.left = x + 'px';
    effect.style.top = y + 'px';
    
    document.body.appendChild(effect);
    setTimeout(() => effect.remove(), 1000);
  }

  static createParticles(container, count = 8, type = '✨') {
    const particles = document.getElementById('particles-container');
    
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.textContent = type;
      particle.style.left = (Math.random() * 100) + '%';
      particle.style.top = (Math.random() * 100) + '%';
      particle.style.animationDelay = (Math.random() * 0.5) + 's';
      
      particles.appendChild(particle);
      setTimeout(() => particle.remove(), 3000);
    }
  }

  static celebrateStageCompletion(stage) {
    this.createParticles(null, 12, '🌟');
    this.showCelebration(`🌟 ¡Etapa ${stage} completada! 🌟`, 'var(--success-color)');
    setTimeout(() => this.createParticles(null, 8, '🎉'), 500);
  }

  static celebrateGrowth() {
    this.createParticles(null, 15, '🌸');
    this.showCelebration('🎉 ¡Lirio completo! 🎉', 'var(--accent-color)');
  }

  static showCelebration(text, color) {
    const celebration = document.createElement('div');
    celebration.innerHTML = text;
    celebration.style.cssText = `
      position: absolute;
      top: 30%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 1.5rem;
      font-weight: bold;
      color: ${color};
      animation: fadeIn 1s ease-out forwards;
      z-index: 100;
      text-shadow: 2px 2px 4px var(--shadow-heavy);
      pointer-events: none;
    `;
    
    document.querySelector('.container').appendChild(celebration);
    setTimeout(() => celebration.remove(), 3000);
  }

  static createMilestoneCelebration(milestone) {
    this.createParticles(null, 6, '🎯');
    this.showCelebration(`🎯 ¡${milestone.toLocaleString()} clics! 🎯`, 'var(--warning-color)');
  }
}

// Sound Manager
class SoundManager {
  static playSound(frequency, duration = 200, type = 'sine') {
    if (!gameState.settings.soundEnabled) return;
    
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = type;
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (error) {
      console.warn('Sound not supported:', error);
    }
  }

  static playClickSound() {
    this.playSound(800, 100);
  }

  static playAchievementSound() {
    this.playSound(600, 200);
    setTimeout(() => this.playSound(800, 200), 100);
    setTimeout(() => this.playSound(1000, 300), 200);
  }

  static playStageCompleteSound() {
    this.playSound(523, 150); // C
    setTimeout(() => this.playSound(659, 150), 150); // E
    setTimeout(() => this.playSound(784, 300), 300); // G
  }
}

// Auto-clicker management
function startAutoClicker() {
  if (autoClickerInterval) clearInterval(autoClickerInterval);
  if (gameState.autoClickerLevel === 0) return;
  
  const interval = Math.max(1000 - (gameState.autoClickerLevel * 150), 200);
  autoClickerInterval = setInterval(() => {
    if (gameState.stage < CONFIG.plantImages.length) {
      growPlant(true);
    }
  }, interval);
}

function stopAutoClicker() {
  if (autoClickerInterval) {
    clearInterval(autoClickerInterval);
    autoClickerInterval = null;
  }
}

// Performance optimized update function
let updateScheduled = false;
function scheduleUpdate() {
  if (!updateScheduled) {
    updateScheduled = true;
    requestAnimationFrame(() => {
      updatePlant();
      updateScheduled = false;
    });
  }
}

function updatePlant() {
  const img = CONFIG.plantImages[Math.min(gameState.stage, CONFIG.plantImages.length - 1)];
  const container = document.getElementById('plant-container');
  const message = document.getElementById('message');
  const progressBar = document.getElementById('progress-bar');
  const stageIndicator = document.getElementById('stage-indicator');
  
  // Update plant image
  container.style.backgroundImage = `url('${img}')`;
  
  // Update message with progress info
  const clicksRequired = CONFIG.clicksNeeded[Math.min(gameState.stage, CONFIG.clicksNeeded.length - 1)];
  const progress = Math.min((gameState.clicksInCurrentStage / clicksRequired) * 100, 100);
  
  if (gameState.stage < CONFIG.plantImages.length - 1) {
    message.innerHTML = `<small>${gameState.clicksInCurrentStage.toLocaleString()}/${clicksRequired.toLocaleString()} clics | Total: ${gameState.totalClicks.toLocaleString()} | Racha: ${gameState.clickStreak}<br>Poder: ${gameState.clickPower}x | Auto-clicker: ${gameState.autoClickerLevel} | Prestigio: ${gameState.prestigeLevel} (${gameState.prestigeMultiplier}x)</small>`;
  } else {
    message.innerHTML = `<small>¡Completado! Total de clics: ${gameState.totalClicks.toLocaleString()}</small>`;
  }
  
  // Update progress bar
  progressBar.style.width = `${progress}%`;
  progressBar.setAttribute('aria-valuenow', progress);
  
  // Update stage indicator
  stageIndicator.textContent = `Etapa ${gameState.stage + 1} de ${CONFIG.plantImages.length}`;
  
  // Update shop
  updateShopDisplay();
}

function growPlant(isAutoClick = false) {
  if (gameState.stage >= CONFIG.plantImages.length) {
    EffectsManager.celebrateGrowth();
    return;
  }

  const now = Date.now();
  const timeDiff = now - gameState.lastClickTime;
  
  // Calculate click value with bonuses
  const rapidClickBonus = timeDiff < 100 ? 2 + gameState.streakBonusLevel * 0.5 : 1;
  let baseClickValue = gameState.clickPower * rapidClickBonus * gameState.prestigeMultiplier;
  
  const isCritical = Math.random() < gameState.criticalClickLevel * 0.05;
  if (isCritical) {
    baseClickValue *= 10;
  }
  
  // Update game state
  gameState.clicksInCurrentStage += baseClickValue;
  gameState.totalClicks += baseClickValue;
  if (!isAutoClick) {
    gameState.clickStreak++;
    gameState.lastClickTime = now;
  }
  
  // Create visual effects
  if (!isAutoClick) {
    const container = document.getElementById('plant-container');
    const rect = container.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    EffectsManager.createClickEffect(x, y, baseClickValue);
    if (isCritical) {
      EffectsManager.showCelebration('CRITICAL HIT!', 'var(--accent-color)');
    }
    SoundManager.playClickSound();
    
    // Add growth animation
    container.classList.add('growth-animation');
    setTimeout(() => container.classList.remove('growth-animation'), 800);
    
    // Create sparkles
    EffectsManager.createParticles(container, 3);
  }
  
  // Check for milestones
  checkMilestones();
  
  // Check for achievements
  checkAchievements();
  
  // Check for stage advancement
  const clicksRequired = CONFIG.clicksNeeded[Math.min(gameState.stage, CONFIG.clicksNeeded.length - 1)];
  if (gameState.clicksInCurrentStage >= clicksRequired) {
    gameState.stage++;
    gameState.clicksInCurrentStage = 0;
    
    EffectsManager.celebrateStageCompletion(gameState.stage);
    SoundManager.playStageCompleteSound();
  }
  
  // Save and update display
  gameState.save();
  scheduleUpdate();
}

function checkMilestones() {
  CONFIG.milestones.forEach(milestone => {
    if (gameState.clicksInCurrentStage === milestone) {
      EffectsManager.createMilestoneCelebration(milestone);
    }
  });
}

function checkAchievements() {
  const newAchievements = [];
  
  CONFIG.achievements.forEach(achievement => {
    if (gameState.achievements.includes(achievement.id)) return;
    
    let qualified = false;
    
    switch (achievement.type) {
      case 'streak':
        qualified = gameState.clickStreak >= achievement.threshold;
        break;
      case 'stage':
        qualified = gameState.stage >= achievement.threshold;
        break;
      default: // total clicks
        qualified = gameState.totalClicks >= achievement.threshold;
    }
    
    if (qualified) {
      newAchievements.push(achievement);
      gameState.achievements.push(achievement.id);
    }
  });
  
  newAchievements.forEach(achievement => {
    showAchievement(achievement);
    SoundManager.playAchievementSound();
  });
  
  if (newAchievements.length > 0) {
    gameState.save();
  }
}

function showAchievement(achievement) {
  const achievementDiv = document.createElement('div');
  achievementDiv.innerHTML = `
    <div style="background: linear-gradient(135deg, #ffd700, #ffed4e); padding: 15px; border-radius: 10px; box-shadow: 0 4px 15px var(--shadow-medium); text-align: center;">
      <div style="font-size: 2rem;">🏆</div>
      <div style="font-weight: bold; color: #8b4513; margin: 5px 0;">${achievement.name}</div>
      <div style="font-size: 0.9rem; color: #666;">${achievement.desc}</div>
    </div>
  `;
  achievementDiv.style.cssText = `
    position: absolute;
    top: 60%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation: fadeIn 1s ease-out forwards;
    z-index: 100;
  `;
  
  document.querySelector('.container').appendChild(achievementDiv);
  setTimeout(() => achievementDiv.remove(), 4000);
}

function buyUpgrade(type) {
  const costs = CONFIG.upgradeCosts;
  
  if (type === 'autoClicker' && gameState.autoClickerLevel < 4) {
    const cost = costs.autoClicker[gameState.autoClickerLevel];
    if (gameState.totalClicks >= cost) {
      gameState.totalClicks -= cost;
      gameState.autoClickerLevel++;
      startAutoClicker();
      gameState.save();
      scheduleUpdate();
      showNotification('Auto-clicker mejorado!', 'success');
    } else {
      showNotification('No tienes suficientes clics', 'warning');
    }
  } else if (type === 'criticalClick' && gameState.criticalClickLevel < 4) {
    const cost = costs.criticalClick[gameState.criticalClickLevel];
    if (gameState.totalClicks >= cost) {
      gameState.totalClicks -= cost;
      gameState.criticalClickLevel++;
      gameState.save();
      scheduleUpdate();
      showNotification('¡Golpe crítico mejorado!', 'success');
    } else {
      showNotification('No tienes suficientes clics', 'warning');
    }
  } else if (type === 'streakBonus' && gameState.streakBonusLevel < 4) {
    const cost = costs.streakBonus[gameState.streakBonusLevel];
    if (gameState.totalClicks >= cost) {
      gameState.totalClicks -= cost;
      gameState.streakBonusLevel++;
      gameState.save();
      scheduleUpdate();
      showNotification('¡Bonus de racha mejorado!', 'success');
    } else {
      showNotification('No tienes suficientes clics', 'warning');
    }
  } else if (type === 'clickPower' && gameState.clickPower < 5) {
    const cost = costs.clickPower[gameState.clickPower - 1];
    if (gameState.totalClicks >= cost) {
      gameState.totalClicks -= cost;
      gameState.clickPower++;
      gameState.save();
      scheduleUpdate();
      showNotification('Poder de clic mejorado!', 'success');
    } else {
      showNotification('No tienes suficientes clics', 'warning');
    }
  }
}

function prestige() {
  if (gameState.stage >= CONFIG.plantImages.length - 1) {
    gameState.prestigeLevel++;
    gameState.prestigeMultiplier = Math.pow(2, gameState.prestigeLevel);
    
    // Reset progress but keep prestige bonuses
    gameState.stage = 0;
    gameState.clicksInCurrentStage = 0;
    gameState.clickStreak = 0;
    gameState.autoClickerLevel = 0;
    gameState.clickPower = 1;
    gameState.criticalClickLevel = 0;
    gameState.streakBonusLevel = 0;
    gameState.achievements = [];
    gameState.lastClickTime = 0;
    
    stopAutoClicker();
    gameState.save();
    scheduleUpdate();
    
    showPrestigeMessage();
    SoundManager.playAchievementSound();
  }
}

function showPrestigeMessage() {
  const prestigeDiv = document.createElement('div');
  prestigeDiv.innerHTML = `
    <div style="background: linear-gradient(135deg, #9c27b0, #673ab7); padding: 20px; border-radius: 15px; box-shadow: 0 8px 25px var(--shadow-heavy); text-align: center; color: white;">
      <div style="font-size: 3rem;">⭐</div>
      <div style="font-size: 1.5rem; font-weight: bold; margin: 10px 0;">¡PRESTIGIO!</div>
      <div style="font-size: 1.1rem;">Nivel ${gameState.prestigeLevel} - Multiplicador ${gameState.prestigeMultiplier}x</div>
      <div style="font-size: 0.9rem; margin-top: 10px;">Todo se reinicia, pero ahora eres más poderoso</div>
    </div>
  `;
  prestigeDiv.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation: fadeIn 1s ease-out forwards;
    z-index: 200;
  `;
  
  document.querySelector('.container').appendChild(prestigeDiv);
  setTimeout(() => prestigeDiv.remove(), 5000);
}

function updateShopDisplay() {
  const shopDiv = document.getElementById('shop');
  if (!shopDiv) return;
  
  const autoClickerCost = gameState.autoClickerLevel < 4 ? 
    CONFIG.upgradeCosts.autoClicker[gameState.autoClickerLevel] : 'MAX';
  const clickPowerCost = gameState.clickPower < 5 ? 
    CONFIG.upgradeCosts.clickPower[gameState.clickPower - 1] : 'MAX';
  const criticalClickCost = gameState.criticalClickLevel < 4 ?
    CONFIG.upgradeCosts.criticalClick[gameState.criticalClickLevel] : 'MAX';
  const streakBonusCost = gameState.streakBonusLevel < 4 ?
    CONFIG.upgradeCosts.streakBonus[gameState.streakBonusLevel] : 'MAX';
  
  const canAffordAutoClicker = autoClickerCost !== 'MAX' && gameState.totalClicks >= autoClickerCost;
  const canAffordClickPower = clickPowerCost !== 'MAX' && gameState.totalClicks >= clickPowerCost;
  const canAffordCriticalClick = criticalClickCost !== 'MAX' && gameState.totalClicks >= criticalClickCost;
  const canAffordStreakBonus = streakBonusCost !== 'MAX' && gameState.totalClicks >= streakBonusCost;
  
  shopDiv.innerHTML = `
    <div style="background: rgba(255,255,255,0.9); padding: 20px; border-radius: 15px; margin-top: 20px;">
      <h3 style="color: var(--text-primary); margin-bottom: 15px;">🏪 Tienda de Mejoras</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-bottom: 15px;">
        <button onclick="buyUpgrade('autoClicker')" 
                style="background: linear-gradient(135deg, var(--info-color), #1976d2); color: white; border: none; padding: 15px; border-radius: 8px; cursor: pointer; font-size: 0.9rem; ${!canAffordAutoClicker || autoClickerCost === 'MAX' ? 'opacity: 0.6; cursor: not-allowed;' : ''}"
                ${!canAffordAutoClicker || autoClickerCost === 'MAX' ? 'disabled' : ''}>
          Auto-clicker (Nivel ${gameState.autoClickerLevel + 1})<br>
          <small>${autoClickerCost === 'MAX' ? 'MAX' : autoClickerCost.toLocaleString() + ' clics'}</small>
        </button>
        <button onclick="buyUpgrade('clickPower')" 
                style="background: linear-gradient(135deg, var(--warning-color), #f57c00); color: white; border: none; padding: 15px; border-radius: 8px; cursor: pointer; font-size: 0.9rem; ${!canAffordClickPower || clickPowerCost === 'MAX' ? 'opacity: 0.6; cursor: not-allowed;' : ''}"
                ${!canAffordClickPower || clickPowerCost === 'MAX' ? 'disabled' : ''}>
          Poder de Clic (Nivel ${gameState.clickPower + 1})<br>
          <small>${clickPowerCost === 'MAX' ? 'MAX' : clickPowerCost.toLocaleString() + ' clics'}</small>
        </button>
        <button onclick="buyUpgrade('criticalClick')"
                style="background: linear-gradient(135deg, #f44336, #c62828); color: white; border: none; padding: 15px; border-radius: 8px; cursor: pointer; font-size: 0.9rem; ${!canAffordCriticalClick || criticalClickCost === 'MAX' ? 'opacity: 0.6; cursor: not-allowed;' : ''}"
                ${!canAffordCriticalClick || criticalClickCost === 'MAX' ? 'disabled' : ''}>
          Golpe Crítico (Nivel ${gameState.criticalClickLevel + 1})<br>
          <small>${criticalClickCost === 'MAX' ? 'MAX' : criticalClickCost.toLocaleString() + ' clics'}</small>
        </button>
        <button onclick="buyUpgrade('streakBonus')"
                style="background: linear-gradient(135deg, #4caf50, #2e7d32); color: white; border: none; padding: 15px; border-radius: 8px; cursor: pointer; font-size: 0.9rem; ${!canAffordStreakBonus || streakBonusCost === 'MAX' ? 'opacity: 0.6; cursor: not-allowed;' : ''}"
                ${!canAffordStreakBonus || streakBonusCost === 'MAX' ? 'disabled' : ''}>
          Bonus de Racha (Nivel ${gameState.streakBonusLevel + 1})<br>
          <small>${streakBonusCost === 'MAX' ? 'MAX' : streakBonusCost.toLocaleString() + ' clics'}</small>
        </button>
        ${gameState.stage >= CONFIG.plantImages.length - 1 ? `
          <button onclick="prestige()" style="background: linear-gradient(135deg, #9c27b0, #673ab7); color: white; border: none; padding: 12px 20px; border-radius: 10px; cursor: pointer; font-size: 1rem; font-weight: bold; grid-column: 1 / -1; margin-top: 10px;">
            ⭐ PRESTIGIO - Multiplicador ${gameState.prestigeMultiplier * 2}x ⭐
          </button>
        ` : ''}
      </div>
      <div style="margin-top: 15px; font-size: 0.9rem; color: var(--text-secondary); line-height: 1.4;">
        <div>Logros desbloqueados: ${gameState.achievements.length}/${CONFIG.achievements.length}</div>
        <div>Auto-clicker: ${gameState.autoClickerLevel}/4 | Poder: ${gameState.clickPower}/5</div>
        <div>Crítico: ${gameState.criticalClickLevel}/4 | Racha: ${gameState.streakBonusLevel}/4</div>
        <div>Nivel de Prestigio: ${gameState.prestigeLevel} (${gameState.prestigeMultiplier}x)</div>
      </div>
    </div>
  `;
}

function resetPlant() {
  if (confirm('¿Estás seguro de que quieres reiniciar todo el progreso?')) {
    gameState.stage = 0;
    gameState.clicksInCurrentStage = 0;
    gameState.totalClicks = 0;
    gameState.clickStreak = 0;
    gameState.autoClickerLevel = 0;
    gameState.clickPower = 1;
    gameState.criticalClickLevel = 0;
    gameState.streakBonusLevel = 0;
    gameState.achievements = [];
    gameState.lastClickTime = 0;
    gameState.prestigeLevel = 0;
    gameState.prestigeMultiplier = 1;
    
    stopAutoClicker();
    gameState.save();
    scheduleUpdate();
    
    showNotification('Juego reiniciado', 'success');
    
    // Reset animation
    const container = document.getElementById('plant-container');
    container.style.transform = 'scale(0.8)';
    setTimeout(() => container.style.transform = 'scale(1)', 300);
  }
}

// Notification system
function showNotification(message, type = 'info') {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.className = `notification ${type} show`;
  
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

// Theme and accessibility functions
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  document.getElementById('theme-icon').textContent = newTheme === 'dark' ? '☀️' : '🌙';
  
  gameState.settings.theme = newTheme;
  gameState.save();
}

// Keyboard support
function handleKeyPress(event) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    growPlant();
  }
}

// Initialize the game
function initializeGame() {
  // Apply saved settings
  if (gameState.settings.theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.getElementById('theme-icon').textContent = '☀️';
  }
  
  // Start auto-clicker if available
  if (gameState.autoClickerLevel > 0) {
    startAutoClicker();
  }
  
  // Initial plant update
  updatePlant();
  
  // Add ambient floating animation
  setInterval(() => {
    const container = document.getElementById('plant-container');
    if (!container.classList.contains('growth-animation')) {
      container.style.transform = 'translateY(-2px)';
      setTimeout(() => container.style.transform = 'translateY(0px)', 1000);
    }
  }, 4000);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initializeGame);

// Handle visibility change to pause/resume auto-clicker
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopAutoClicker();
  } else if (gameState.autoClickerLevel > 0) {
    startAutoClicker();
  }
});
