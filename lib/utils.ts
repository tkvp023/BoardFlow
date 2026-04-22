import { v4 as uuidv4 } from 'uuid'

export function generateUserId(): string {
  if (typeof window === 'undefined') return ''
  let userId = localStorage.getItem('boardflow_user_id')
  if (!userId) {
    userId = uuidv4()
    localStorage.setItem('boardflow_user_id', userId)
  }
  return userId
}

export function getUserName(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('boardflow_user_name') || ''
}

export function setUserName(name: string): void {
  localStorage.setItem('boardflow_user_name', name)
}

export function copyToClipboard(text: string): void {
  navigator.clipboard.writeText(text)
}

