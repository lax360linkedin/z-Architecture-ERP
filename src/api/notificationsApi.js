import { mockGet, mockMutate } from './mockClient'
import { notifications, chatChannels, chatMessages } from '../data/notifications'

export const notificationsApi = {
  async list() {
    return mockGet(notifications)
  },
  async markRead(id) {
    return mockMutate(() => {
      const n = notifications.find((x) => x.id === id)
      if (n) n.read = true
      return n
    })
  },
  async markAllRead() {
    return mockMutate(() => {
      notifications.forEach((n) => (n.read = true))
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
