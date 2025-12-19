/**
 * 입력 관리 클래스
 * 키보드와 마우스 입력을 처리
 */
export class InputManager {
  private keys: { [key: string]: boolean } = {}
  private mouseMovement = { x: 0, y: 0 }
  private mouseButtons: { [button: number]: boolean } = {}
  private isLocked = false

  constructor() {
    this.setupEventListeners()
  }

  /**
   * 이벤트 리스너 설정
   */
  private setupEventListeners(): void {
    // 키보드 이벤트
    document.addEventListener("keydown", this.onKeyDown.bind(this))
    document.addEventListener("keyup", this.onKeyUp.bind(this))

    // 마우스 이벤트
    document.addEventListener("mousedown", this.onMouseDown.bind(this))
    document.addEventListener("mouseup", this.onMouseUp.bind(this))
    document.addEventListener("mousemove", this.onMouseMove.bind(this))

    // Pointer Lock 이벤트
    document.addEventListener("click", this.requestPointerLock.bind(this))
    document.addEventListener("pointerlockchange", this.onPointerLockChange.bind(this))
  }

  /**
   * Pointer Lock 요청
   */
  private requestPointerLock(): void {
    if (!this.isLocked) {
      document.body.requestPointerLock()
    }
  }

  /**
   * Pointer Lock 상태 변경
   */
  private onPointerLockChange(): void {
    this.isLocked = document.pointerLockElement === document.body
  }

  /**
   * 키 다운 이벤트
   */
  private onKeyDown(event: KeyboardEvent): void {
    this.keys[event.code] = true
  }

  /**
   * 키 업 이벤트
   */
  private onKeyUp(event: KeyboardEvent): void {
    this.keys[event.code] = false
  }

  /**
   * 마우스 다운 이벤트
   */
  private onMouseDown(event: MouseEvent): void {
    this.mouseButtons[event.button] = true
  }

  /**
   * 마우스 업 이벤트
   */
  private onMouseUp(event: MouseEvent): void {
    this.mouseButtons[event.button] = false
  }

  /**
   * 마우스 이동 이벤트
   */
  private onMouseMove(event: MouseEvent): void {
    if (this.isLocked) {
      this.mouseMovement.x = event.movementX
      this.mouseMovement.y = event.movementY
    }
  }

  /**
   * 키가 눌려있는지 확인
   */
  public isKeyPressed(code: string): boolean {
    return this.keys[code] || false
  }

  /**
   * 마우스 버튼이 눌려있는지 확인
   */
  public isMouseButtonPressed(button: number): boolean {
    return this.mouseButtons[button] || false
  }

  /**
   * 마우스 이동량 가져오기 및 리셋
   */
  public getMouseMovement(): { x: number; y: number } {
    const movement = { ...this.mouseMovement }
    this.mouseMovement = { x: 0, y: 0 }
    return movement
  }

  /**
   * Pointer Lock 상태 확인
   */
  public isPointerLocked(): boolean {
    return this.isLocked
  }

  /**
   * 정리
   */
  public destroy(): void {
    document.removeEventListener("keydown", this.onKeyDown.bind(this))
    document.removeEventListener("keyup", this.onKeyUp.bind(this))
    document.removeEventListener("mousedown", this.onMouseDown.bind(this))
    document.removeEventListener("mouseup", this.onMouseUp.bind(this))
    document.removeEventListener("mousemove", this.onMouseMove.bind(this))
    document.removeEventListener("click", this.requestPointerLock.bind(this))
    document.removeEventListener("pointerlockchange", this.onPointerLockChange.bind(this))

    if (this.isLocked && document.exitPointerLock) {
      document.exitPointerLock()
    }
  }
}
