import { Q, fetchPolicies } from 'cozy-client'

const CONTACTS_DOCTYPE = 'io.cozy.contacts'
export const CHAT_CONVERSATIONS_DOCTYPE = 'io.cozy.ai.chat.conversations'
export const CHAT_EVENTS_DOCTYPE = 'io.cozy.ai.chat.events'
export const FILES_DOCTYPE = 'io.cozy.files'

const defaultFetchPolicy = fetchPolicies.olderThan(86400) // 24 hours

export const buildFilesByIds = ids => {
  return {
    definition: Q(FILES_DOCTYPE).getByIds(ids),
    options: {
      as: `${FILES_DOCTYPE}/${ids.join('')}`,
      fetchPolicy: defaultFetchPolicy
    }
  }
}

export const buildChatConversationQueryById = id => {
  return {
    definition: Q(CHAT_CONVERSATIONS_DOCTYPE).getById(id),
    options: {
      as: `${CHAT_CONVERSATIONS_DOCTYPE}/${id}`,
      fetchPolicy: defaultFetchPolicy,
      singleDocData: true
    }
  }
}

export const buildMyselfQuery = () => {
  return {
    definition: Q(CONTACTS_DOCTYPE).where({ me: true }),
    options: {
      as: `${CONTACTS_DOCTYPE}/myself`,
      fetchPolicy: defaultFetchPolicy
    }
  }
}
