import * as THREE from "three"
import type { InputManager } from "./input-manager"
import type { World } from "./world"

/**
 * 플레이어 클래스
 * 1인칭 카메라 제어, 이동, 점프, 사격 등을 처리
 */
export class Player {
  private camera: THREE.PerspectiveCamera
  private inputManager: InputManager
  private world: World

  // 플레이어 상태
  private position: THREE.Vector3
  private velocity: THREE.Vector3
  private rotation = { x: 0, y: 0 }

  // 플레이어 능력치
  private moveSpeed = 10
  private sprintSpeed = 16
  private jumpForce = 8
  private gravity = -25

  // 점프 상태
  private isOnGround = false
  private canJump = true

  // 전투 시스템
  private health = 100
  private maxHealth = 100
  private ammo = 30
  private maxAmmo = 30
  private reserveAmmo = 90
  private isReloading = false
  private reloadTime = 2.0
  private reloadTimer = 0
  private shootCooldown = 0.15
  private shootTimer = 0
  private lastShotDirection: THREE.Vector3 | null = null
  private shotTime = 0

  // 반동
  private recoil = 0
  private recoilRecovery = 5

  constructor(camera: THREE.PerspectiveCamera, inputManager: InputManager, world: World) {
    this.camera = camera
    this.inputManager = inputManager
    this.world = world
    this.position = new THREE.Vector3(0, 5, 0)
    this.velocity = new THREE.Vector3(0, 0, 0)

    this.camera.position.copy(this.position)
  }

  /**
   * 플레이어 업데이트
   */
  public update(deltaTime: number): void {
    this.handleRotation(deltaTime)
    this.handleMovement(deltaTime)
    this.handleShooting(deltaTime)
    this.handleReload(deltaTime)
    this.handleRecoil(deltaTime)
    this.applyGravity(deltaTime)
    this.updateCameraPosition()
  }

  /**
   * 마우스를 통한 카메라 회전 처리
   */
  private handleRotation(deltaTime: number): void {
    const mouseMovement = this.inputManager.getMouseMovement()

    this.rotation.y -= mouseMovement.x * 0.002
    this.rotation.x -= mouseMovement.y * 0.002

    // 수직 회전 제한
    this.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotation.x))
  }

  /**
   * WASD 키를 통한 이동 처리
   */
  private handleMovement(deltaTime: number): void {
    const forward = new THREE.Vector3()
    const right = new THREE.Vector3()

    // 카메라의 방향 벡터 계산
    this.camera.getWorldDirection(forward)
    forward.y = 0
    forward.normalize()

    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize()

    const moveVector = new THREE.Vector3()

    // 이동 입력 처리
    if (this.inputManager.isKeyPressed("KeyW")) {
      moveVector.add(forward)
    }
    if (this.inputManager.isKeyPressed("KeyS")) {
      moveVector.sub(forward)
    }
    if (this.inputManager.isKeyPressed("KeyA")) {
      moveVector.sub(right)
    }
    if (this.inputManager.isKeyPressed("KeyD")) {
      moveVector.add(right)
    }

    // 달리기 처리
    const isSprinting = this.inputManager.isKeyPressed("ShiftLeft") || this.inputManager.isKeyPressed("ShiftRight")
    const currentSpeed = isSprinting ? this.sprintSpeed : this.moveSpeed

    if (moveVector.length() > 0) {
      moveVector.normalize()
      this.velocity.x = moveVector.x * currentSpeed
      this.velocity.z = moveVector.z * currentSpeed
    } else {
      this.velocity.x = 0
      this.velocity.z = 0
    }

    // 점프 처리
    if (this.inputManager.isKeyPressed("Space") && this.isOnGround && this.canJump) {
      this.velocity.y = this.jumpForce
      this.isOnGround = false
      this.canJump = false
    }

    if (!this.inputManager.isKeyPressed("Space")) {
      this.canJump = true
    }

    // 위치 업데이트
    this.position.x += this.velocity.x * deltaTime
    this.position.z += this.velocity.z * deltaTime

    // 충돌 검사
    this.handleCollisions()
  }

  /**
   * 중력 적용
   */
  private applyGravity(deltaTime: number): void {
    if (!this.isOnGround) {
      this.velocity.y += this.gravity * deltaTime
    }

    this.position.y += this.velocity.y * deltaTime

    // 바닥 충돌
    if (this.position.y <= 2) {
      this.position.y = 2
      this.velocity.y = 0
      this.isOnGround = true
    } else {
      this.isOnGround = false
    }
  }

  /**
   * 벽과 장애물 충돌 처리
   */
  private handleCollisions(): void {
    const playerRadius = 0.5
    const colliders = this.world.getColliders()

    for (const collider of colliders) {
      const { min, max } = collider

      // X축 충돌
      if (
        this.position.z > min.z - playerRadius &&
        this.position.z < max.z + playerRadius &&
        this.position.y > min.y &&
        this.position.y < max.y + 2
      ) {
        if (this.position.x > min.x - playerRadius && this.position.x < min.x) {
          this.position.x = min.x - playerRadius
        } else if (this.position.x < max.x + playerRadius && this.position.x > max.x) {
          this.position.x = max.x + playerRadius
        }
      }

      // Z축 충돌
      if (
        this.position.x > min.x - playerRadius &&
        this.position.x < max.x + playerRadius &&
        this.position.y > min.y &&
        this.position.y < max.y + 2
      ) {
        if (this.position.z > min.z - playerRadius && this.position.z < min.z) {
          this.position.z = min.z - playerRadius
        } else if (this.position.z < max.z + playerRadius && this.position.z > max.z) {
          this.position.z = max.z + playerRadius
        }
      }
    }
  }

  /**
   * 사격 처리
   */
  private handleShooting(deltaTime: number): void {
    this.shootTimer -= deltaTime

    if (this.inputManager.isMouseButtonPressed(0) && this.shootTimer <= 0 && !this.isReloading && this.ammo > 0) {
      this.shoot()
      this.shootTimer = this.shootCooldown
    }
  }

  /**
   * 총 발사
   */
  private shoot(): void {
    this.ammo--
    this.recoil += 0.1

    // 발사 방향 저장
    const direction = new THREE.Vector3()
    this.camera.getWorldDirection(direction)
    this.lastShotDirection = direction.clone()
    this.shotTime = performance.now()
  }

  /**
   * 레이캐스팅으로 명중 판정
   */
  public checkShootHit(targetPosition: THREE.Vector3, targetRadius: number): boolean {
    if (!this.lastShotDirection) return false

    // 발사한지 100ms 이내의 샷만 체크
    if (performance.now() - this.shotTime > 100) {
      this.lastShotDirection = null
      return false
    }

    const raycaster = new THREE.Raycaster(this.camera.position, this.lastShotDirection)
    const distance = this.camera.position.distanceTo(targetPosition)

    // 레이와 타겟의 거리 계산
    const closestPoint = new THREE.Vector3()
    raycaster.ray.closestPointToPoint(targetPosition, closestPoint)
    const distanceToRay = closestPoint.distanceTo(targetPosition)

    if (distanceToRay < targetRadius && distance < 100) {
      this.lastShotDirection = null
      return true
    }

    return false
  }

  /**
   * 재장전 처리
   */
  private handleReload(deltaTime: number): void {
    if (this.isReloading) {
      this.reloadTimer -= deltaTime
      if (this.reloadTimer <= 0) {
        const ammoNeeded = this.maxAmmo - this.ammo
        const ammoToReload = Math.min(ammoNeeded, this.reserveAmmo)
        this.ammo += ammoToReload
        this.reserveAmmo -= ammoToReload
        this.isReloading = false
      }
    }

    if (
      this.inputManager.isKeyPressed("KeyR") &&
      !this.isReloading &&
      this.ammo < this.maxAmmo &&
      this.reserveAmmo > 0
    ) {
      this.isReloading = true
      this.reloadTimer = this.reloadTime
    }
  }

  /**
   * 반동 처리
   */
  private handleRecoil(deltaTime: number): void {
    if (this.recoil > 0) {
      this.recoil = Math.max(0, this.recoil - this.recoilRecovery * deltaTime)
    }
  }

  /**
   * 카메라 위치 업데이트
   */
  private updateCameraPosition(): void {
    this.camera.position.copy(this.position)
    this.camera.rotation.x = this.rotation.x + this.recoil
    this.camera.rotation.y = this.rotation.y
    this.camera.rotation.order = "YXZ"
  }

  /**
   * 데미지 받기
   */
  public takeDamage(amount: number): void {
    this.health = Math.max(0, this.health - amount)
  }

  // Getters
  public getHealth(): number {
    return this.health
  }
  public getMaxHealth(): number {
    return this.maxHealth
  }
  public getAmmo(): number {
    return this.ammo
  }
  public getMaxAmmo(): number {
    return this.maxAmmo
  }
  public getReserveAmmo(): number {
    return this.reserveAmmo
  }
  public isReloadingWeapon(): boolean {
    return this.isReloading
  }
  public getReloadProgress(): number {
    return this.isReloading ? 1 - this.reloadTimer / this.reloadTime : 1
  }
  public getPosition(): THREE.Vector3 {
    return this.position.clone()
  }

  /**
   * 정리
   */
  public destroy(): void {
    // 플레이어 관련 리소스 정리
  }
}
