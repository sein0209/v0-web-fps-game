"use client"

import { useEffect, useRef, useState } from "react"
import { Game } from "@/components/fps/game"

export default function FPSPage() {
  const [gameStarted, setGameStarted] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const gameRef = useRef<Game | null>(null)

  useEffect(() => {
    if (gameStarted && !gameRef.current) {
      gameRef.current = new Game()
      gameRef.current.init()
      gameRef.current.start()
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy()
        gameRef.current = null
      }
    }
  }, [gameStarted])

  const handleStart = () => {
    setGameStarted(true)
  }

  const handleRestart = () => {
    if (gameRef.current) {
      gameRef.current.destroy()
      gameRef.current = null
    }
    setGameStarted(false)
    setIsPaused(false)
    setTimeout(() => setGameStarted(true), 100)
  }

  if (!gameStarted) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black">
        <div className="text-center space-y-8">
          <h1 className="text-6xl font-bold text-cyan-400 tracking-wider">COMBAT ZONE</h1>
          <div className="space-y-4 text-zinc-400">
            <div className="space-y-2">
              <h2 className="text-2xl text-zinc-200 font-semibold">조작법</h2>
              <p className="text-lg">W/A/S/D - 이동</p>
              <p className="text-lg">Shift - 달리기</p>
              <p className="text-lg">Space - 점프</p>
              <p className="text-lg">마우스 - 시점 이동</p>
              <p className="text-lg">좌클릭 - 사격</p>
              <p className="text-lg">R - 재장전</p>
              <p className="text-lg">ESC - 일시정지</p>
            </div>
          </div>
          <button
            onClick={handleStart}
            className="px-12 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xl rounded-sm transition-colors uppercase tracking-wider"
          >
            게임 시작
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div id="game-container" className="w-full h-screen" />
      {isPaused && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="text-center space-y-6">
            <h2 className="text-4xl font-bold text-cyan-400">일시정지</h2>
            <button
              onClick={handleRestart}
              className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-lg rounded-sm transition-colors"
            >
              재시작
            </button>
          </div>
        </div>
      )}
    </>
  )
}
