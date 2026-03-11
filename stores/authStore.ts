'use client'

import { create } from 'zustand'

type User = {
  id: string
  email: string
  name?: string
  role: 'admin' | 'user'
}

type AuthState = {
  user: User | null
  accessToken: string | null

  setAuth: (user: User, token: string) => void
  hydrate: () => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({

  user: null,
  accessToken: null,

  /* ================= SET AUTH ================= */

  setAuth: (user, token) => {

    localStorage.setItem('accessToken', token)
    localStorage.setItem('user', JSON.stringify(user))

    set({
      user,
      accessToken: token
    })
  },

  /* ================= HYDRATE ================= */

  hydrate: () => {

    if (typeof window === 'undefined') return

    const token = localStorage.getItem('accessToken')
    const user = localStorage.getItem('user')

    if (!token || !user) return

    set({
      accessToken: token,
      user: JSON.parse(user)
    })

  },

  /* ================= LOGOUT ================= */

  logout: () => {

    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')

    set({
      user: null,
      accessToken: null
    })

  }

}))