import type { Player } from "./player"

/**
 * HUD 클래스
 * 체력, 탄약, 크로스헤어, 점수 등을 화면에 표시
 */
export class HUD {
  private player: Player
  private hudElement: HTMLDivElement
  private healthBar: HTMLDivElement
  private ammoText: HTMLDivElement
  private scoreText: HTMLDivElement
  private killsText: HTMLDivElement
  private crosshair: HTMLDivElement
  private reloadText: HTMLDivElement
  private hitEffect: HTMLDivElement

  constructor(player: Player) {
    this.player = player

    // HUD 컨테이너 생성
    this.hudElement = document.createElement("div")
    this.hudElement.style.position = "fixed"
    this.hudElement.style.top = "0"
    this.hudElement.style.left = "0"
    this.hudElement.style.width = "100%"
    this.hudElement.style.height = "100%"
    this.hudElement.style.pointerEvents = "none"
    this.hudElement.style.zIndex = "1000"
    this.hudElement.style.fontFamily = "monospace"
    document.body.appendChild(this.hudElement)

    // 체력바 생성
    this.healthBar = this.createHealthBar()

    // 탄약 표시 생성
    this.ammoText = this.createAmmoText()

    // 점수 표시 생성
    this.scoreText = this.createScoreText()

    // 킬 카운트 표시 생성
    this.killsText = this.createKillsText()

    // 크로스헤어 생성
    this.crosshair = this.createCrosshair()

    // 재장전 텍스트 생성
    this.reloadText = this.createReloadText()

    // 피격 효과 생성
    this.hitEffect = this.createHitEffect()
  }

  /**
   * 체력바 생성
   */
  private createHealthBar(): HTMLDivElement {
    const container = document.createElement("div")
    container.style.position = "absolute"
    container.style.bottom = "40px"
    container.style.left = "40px"
    container.style.width = "300px"
    container.style.height = "30px"
    container.style.backgroundColor = "rgba(0, 0, 0, 0.7)"
    container.style.border = "2px solid rgba(0, 255, 255, 0.6)"
    container.style.borderRadius = "4px"
    container.style.overflow = "hidden"

    const bar = document.createElement("div")
    bar.style.width = "100%"
    bar.style.height = "100%"
    bar.style.backgroundColor = "#00ffff"
    bar.style.transition = "width 0.3s, background-color 0.3s"
    container.appendChild(bar)

    const text = document.createElement("div")
    text.style.position = "absolute"
    text.style.top = "50%"
    text.style.left = "50%"
    text.style.transform = "translate(-50%, -50%)"
    text.style.color = "#fff"
    text.style.fontWeight = "bold"
    text.style.fontSize = "16px"
    text.style.textShadow = "2px 2px 4px rgba(0, 0, 0, 0.8)"
    text.textContent = "HP: 100 / 100"
    container.appendChild(text)

    this.hudElement.appendChild(container)
    return container
  }

  /**
   * 탄약 표시 생성
   */
  private createAmmoText(): HTMLDivElement {
    const text = document.createElement("div")
    text.style.position = "absolute"
    text.style.bottom = "90px"
    text.style.right = "40px"
    text.style.color = "#00ffff"
    text.style.fontSize = "32px"
    text.style.fontWeight = "bold"
    text.style.textShadow = "3px 3px 6px rgba(0, 0, 0, 0.8)"
    text.style.backgroundColor = "rgba(0, 0, 0, 0.6)"
    text.style.padding = "12px 24px"
    text.style.borderRadius = "4px"
    text.style.border = "2px solid rgba(0, 255, 255, 0.4)"
    text.textContent = "30 / 90"
    this.hudElement.appendChild(text)
    return text
  }

  /**
   * 점수 표시 생성
   */
  private createScoreText(): HTMLDivElement {
    const text = document.createElement("div")
    text.style.position = "absolute"
    text.style.top = "40px"
    text.style.right = "40px"
    text.style.color = "#00ffff"
    text.style.fontSize = "24px"
    text.style.fontWeight = "bold"
    text.style.textShadow = "2px 2px 4px rgba(0, 0, 0, 0.8)"
    text.textContent = "SCORE: 0"
    this.hudElement.appendChild(text)
    return text
  }

  /**
   * 킬 카운트 표시 생성
   */
  private createKillsText(): HTMLDivElement {
    const text = document.createElement("div")
    text.style.position = "absolute"
    text.style.top = "75px"
    text.style.right = "40px"
    text.style.color = "#00ffff"
    text.style.fontSize = "20px"
    text.style.fontWeight = "bold"
    text.style.textShadow = "2px 2px 4px rgba(0, 0, 0, 0.8)"
    text.textContent = "KILLS: 0"
    this.hudElement.appendChild(text)
    return text
  }

  /**
   * 크로스헤어 생성
   */
  private createCrosshair(): HTMLDivElement {
    const container = document.createElement("div")
    container.style.position = "absolute"
    container.style.top = "50%"
    container.style.left = "50%"
    container.style.transform = "translate(-50%, -50%)"
    container.style.width = "40px"
    container.style.height = "40px"

    // 수평선
    const horizontal = document.createElement("div")
    horizontal.style.position = "absolute"
    horizontal.style.top = "50%"
    horizontal.style.left = "0"
    horizontal.style.width = "100%"
    horizontal.style.height = "2px"
    horizontal.style.backgroundColor = "#00ffff"
    horizontal.style.boxShadow = "0 0 8px #00ffff"
    container.appendChild(horizontal)

    // 수직선
    const vertical = document.createElement("div")
    vertical.style.position = "absolute"
    vertical.style.left = "50%"
    vertical.style.top = "0"
    vertical.style.width = "2px"
    vertical.style.height = "100%"
    vertical.style.backgroundColor = "#00ffff"
    vertical.style.boxShadow = "0 0 8px #00ffff"
    container.appendChild(vertical)

    // 중앙 점
    const center = document.createElement("div")
    center.style.position = "absolute"
    center.style.top = "50%"
    center.style.left = "50%"
    center.style.transform = "translate(-50%, -50%)"
    center.style.width = "6px"
    center.style.height = "6px"
    center.style.backgroundColor = "#00ffff"
    center.style.borderRadius = "50%"
    center.style.boxShadow = "0 0 10px #00ffff"
    container.appendChild(center)

    this.hudElement.appendChild(container)
    return container
  }

  /**
   * 재장전 텍스트 생성
   */
  private createReloadText(): HTMLDivElement {
    const text = document.createElement("div")
    text.style.position = "absolute"
    text.style.bottom = "150px"
    text.style.left = "50%"
    text.style.transform = "translateX(-50%)"
    text.style.color = "#ffff00"
    text.style.fontSize = "24px"
    text.style.fontWeight = "bold"
    text.style.textShadow = "2px 2px 4px rgba(0, 0, 0, 0.8)"
    text.style.display = "none"
    text.textContent = "재장전 중..."
    this.hudElement.appendChild(text)
    return text
  }

  /**
   * 피격 효과 생성
   */
  private createHitEffect(): HTMLDivElement {
    const effect = document.createElement("div")
    effect.style.position = "absolute"
    effect.style.top = "0"
    effect.style.left = "0"
    effect.style.width = "100%"
    effect.style.height = "100%"
    effect.style.backgroundColor = "rgba(255, 0, 0, 0)"
    effect.style.pointerEvents = "none"
    effect.style.transition = "background-color 0.2s"
    this.hudElement.appendChild(effect)
    return effect
  }

  /**
   * HUD 업데이트
   */
  public update(score: number, kills: number): void {
    // 체력 업데이트
    const health = this.player.getHealth()
    const maxHealth = this.player.getMaxHealth()
    const healthPercentage = (health / maxHealth) * 100

    const healthBar = this.healthBar.children[0] as HTMLDivElement
    healthBar.style.width = `${healthPercentage}%`

    // 체력에 따른 색상 변경
    if (healthPercentage > 50) {
      healthBar.style.backgroundColor = "#00ffff"
    } else if (healthPercentage > 25) {
      healthBar.style.backgroundColor = "#ffff00"
    } else {
      healthBar.style.backgroundColor = "#ff0000"
    }

    const healthText = this.healthBar.children[1] as HTMLDivElement
    healthText.textContent = `HP: ${Math.ceil(health)} / ${maxHealth}`

    // 탄약 업데이트
    const ammo = this.player.getAmmo()
    const reserveAmmo = this.player.getReserveAmmo()
    this.ammoText.textContent = `${ammo} / ${reserveAmmo}`

    // 재장전 중 표시
    if (this.player.isReloadingWeapon()) {
      this.reloadText.style.display = "block"
      const progress = this.player.getReloadProgress()
      this.reloadText.textContent = `재장전 중... ${Math.floor(progress * 100)}%`
    } else {
      this.reloadText.style.display = "none"
    }

    // 점수 업데이트
    this.scoreText.textContent = `SCORE: ${score}`

    // 킬 카운트 업데이트
    this.killsText.textContent = `KILLS: ${kills}`
  }

  /**
   * 피격 효과 표시
   */
  public showHitEffect(): void {
    this.hitEffect.style.backgroundColor = "rgba(255, 0, 0, 0.4)"
    setTimeout(() => {
      this.hitEffect.style.backgroundColor = "rgba(255, 0, 0, 0)"
    }, 200)
  }

  /**
   * 정리
   */
  public destroy(): void {
    if (this.hudElement && this.hudElement.parentElement) {
      document.body.removeChild(this.hudElement)
    }
  }
}
