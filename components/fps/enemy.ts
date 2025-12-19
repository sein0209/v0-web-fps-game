import * as THREE from "three"
import type { Player } from "./player"

/**
 * 적 클래스
 * AI, 추적, 공격, 체력 시스템을 포함
 */
export class Enemy {
  private scene: THREE.Scene
  private player: Player
  private mesh: THREE.Group
  private position: THREE.Vector3
  private health = 100
  private maxHealth = 100
  private isDying = false

  // AI 상태
  private state: "idle" | "chasing" | "attacking" = "idle"
  private detectionRange = 30
  private attackRange = 3
  private moveSpeed = 4
  private attackCooldown = 1.5
  private attackTimer = 0
  private hasAttacked = false

  constructor(scene: THREE.Scene, player: Player) {
    this.scene = scene
    this.player = player

    // 랜덤 위치 생성
    this.position = new THREE.Vector3(Math.random() * 40 - 20, 1, Math.random() * 40 - 20)

    this.mesh = this.createEnemyMesh()
    this.mesh.position.copy(this.position)
    this.scene.add(this.mesh)
  }

  /**
   * 적 메시 생성
   */
  private createEnemyMesh(): THREE.Group {
    const group = new THREE.Group()

    // 몸통
    const bodyGeometry = new THREE.BoxGeometry(1, 1.5, 0.5)
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xff4444 })
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
    body.position.y = 0.75
    body.castShadow = true
    group.add(body)

    // 머리
    const headGeometry = new THREE.SphereGeometry(0.4, 16, 16)
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0xff6666 })
    const head = new THREE.Mesh(headGeometry, headMaterial)
    head.position.y = 1.8
    head.castShadow = true
    group.add(head)

    return group
  }

  /**
   * 적 업데이트
   */
  public update(deltaTime: number): void {
    if (this.isDying) return

    const playerPos = this.player.getPosition()
    const distance = this.position.distanceTo(playerPos)

    // AI 상태 결정
    if (distance < this.attackRange) {
      this.state = "attacking"
    } else if (distance < this.detectionRange) {
      this.state = "chasing"
    } else {
      this.state = "idle"
    }

    // 상태에 따른 행동
    switch (this.state) {
      case "chasing":
        this.chasePlayer(deltaTime, playerPos)
        this.hasAttacked = false
        break
      case "attacking":
        this.attackPlayer(deltaTime)
        break
      case "idle":
        this.hasAttacked = false
        break
    }

    // 공격 쿨다운 업데이트
    if (this.attackTimer > 0) {
      this.attackTimer -= deltaTime
    }

    // 메시 위치 업데이트
    this.mesh.position.copy(this.position)
  }

  /**
   * 플레이어 추적
   */
  private chasePlayer(deltaTime: number, playerPos: THREE.Vector3): void {
    const direction = new THREE.Vector3().subVectors(playerPos, this.position)
    direction.y = 0
    direction.normalize()

    this.position.x += direction.x * this.moveSpeed * deltaTime
    this.position.z += direction.z * this.moveSpeed * deltaTime

    // 플레이어를 바라보도록 회전
    this.mesh.lookAt(playerPos.x, this.position.y, playerPos.z)
  }

  /**
   * 플레이어 공격
   */
  private attackPlayer(deltaTime: number): void {
    if (this.attackTimer <= 0 && !this.hasAttacked) {
      this.hasAttacked = true
      this.attackTimer = this.attackCooldown
    }
  }

  /**
   * 현재 프레임에 공격했는지 확인
   */
  public isAttacking(): boolean {
    if (this.hasAttacked && this.attackTimer > this.attackCooldown - 0.1) {
      return true
    }
    return false
  }

  /**
   * 데미지 받기
   */
  public takeDamage(amount: number): void {
    if (this.isDying) return

    this.health -= amount

    // 피격 효과
    const material = (this.mesh.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial
    material.emissive.setHex(0xffffff)
    setTimeout(() => {
      material.emissive.setHex(0x000000)
    }, 100)

    if (this.health <= 0) {
      this.die()
    }
  }

  /**
   * 죽음 처리
   */
  private die(): void {
    this.isDying = true
    this.mesh.visible = false
  }

  /**
   * 리스폰
   */
  public respawn(): void {
    this.health = this.maxHealth
    this.isDying = false
    this.position.set(Math.random() * 40 - 20, 1, Math.random() * 40 - 20)
    this.mesh.position.copy(this.position)
    this.mesh.visible = true
  }

  /**
   * 적이 죽었는지 확인
   */
  public isDead(): boolean {
    return this.isDying
  }

  /**
   * 적의 위치 가져오기
   */
  public getPosition(): THREE.Vector3 {
    return this.position.clone()
  }

  /**
   * 정리
   */
  public destroy(): void {
    this.scene.remove(this.mesh)
  }
}
