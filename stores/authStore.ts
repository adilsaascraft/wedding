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
  hydrated: boolean
  setAuth: (user: User, token: string) => void
  logout: () => void
}

const getInitialAuth = () => {
  if (typeof window === 'undefined') {
    return { user: null, accessToken: null }
  }

  const token = localStorage.getItem('accessToken')
  const user = localStorage.getItem('user')

  return {
    accessToken: token,
    user: user ? JSON.parse(user) : null
  }
}

export const useAuthStore = create<AuthState>((set) => ({

  ...getInitialAuth(),
  hydrated: true,

  setAuth: (user, token) => {

    localStorage.setItem('accessToken', token)
    localStorage.setItem('user', JSON.stringify(user))

    set({
      user,
      accessToken: token
    })
  },

  logout: () => {

    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')

    set({
      user: null,
      accessToken: null
    })
  }

}))