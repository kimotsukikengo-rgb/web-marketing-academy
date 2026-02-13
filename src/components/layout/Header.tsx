"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { GraduationCap, LogOut, Menu, X } from "lucide-react"
import { useState } from "react"

export function Header() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900 hidden sm:block">
              クラプロMarketing Academy
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
            >
              ダッシュボード
            </Link>
            <Link
              href="/courses"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
            >
              コース一覧
            </Link>
            <Link
              href="/dashboard/analytics"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
            >
              分析
            </Link>
            <Link
              href="/dashboard/review"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
            >
              復習
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {session?.user && (
              <div className="hidden md:flex items-center gap-3">
                <span className="text-sm text-slate-600">
                  {session.user.name}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-sm text-slate-500 hover:text-red-600 transition flex items-center gap-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-slate-600"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <nav className="px-4 py-3 space-y-1">
            <Link
              href="/dashboard"
              className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
              onClick={() => setMenuOpen(false)}
            >
              ダッシュボード
            </Link>
            <Link
              href="/courses"
              className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
              onClick={() => setMenuOpen(false)}
            >
              コース一覧
            </Link>
            <Link
              href="/dashboard/analytics"
              className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
              onClick={() => setMenuOpen(false)}
            >
              分析
            </Link>
            <Link
              href="/dashboard/review"
              className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
              onClick={() => setMenuOpen(false)}
            >
              復習
            </Link>
            {session?.user && (
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
              >
                ログアウト
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
