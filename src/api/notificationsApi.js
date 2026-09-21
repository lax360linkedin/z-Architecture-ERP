import { mockGet, mockMutate, nextId } from './mockClient'
import { notifications, chatChannels, chatMessages } from '../data/notifications'

// Pushes a live notification targeted at one employee — called from task
// (and other) mutation flows right after the mutation succeeds. Broadcast
// (seeded) notifications keep forUser: null.
export function notifyUser(employeeId, { category, title, priority = 'medium', link = '/tasks' }) {
  notifications.unshift({
    id: nextId('NOT'),
    category, title, priority, link,
    time: new Date().toISOString(),
    read: false,
    forUser: employeeId,
  })
}

export const notificationsApi = {
  async list(user) {
    const scoped = notifications.filter((n) => n.forUser == null || n.forUser === user?.employeeId)
    return mockGet(scoped)
  },
  async markRead(id) {
    return mockMutate(() => {
      const n = notifications.find((x) => x.id === id)
      if (n) n.read = true
      return n
    })
  },
  async markAllRead(user) {
    return mockMutate(() => {
      notifications.forEach((n) => {
        if (n.forUser == null || n.forUser === user?.employeeId) n.read = true
      })
      return notifications
    })
  },
}

export const communicationApi = {
  async channels() {
    return mockGet(chatChannels)
  },
  async messages(channelId) {
    return mockGet(chatMessages[channelId] || [])
  },
  async sendMessage(channelId, message) {
    return mockMutate(() => {
      if (!chatMessages[channelId]) chatMessages[channelId] = []
      const msg = { ...message, time: new Date().toISOString() }
      chatMessages[channelId].push(msg)
      return msg
    })
  },
}
