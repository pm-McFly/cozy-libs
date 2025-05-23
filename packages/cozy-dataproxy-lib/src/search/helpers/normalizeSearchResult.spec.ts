import CozyClient from 'cozy-client'
import { IOCozyContact, IOCozyFile } from 'cozy-client/types/types'

import {
  getCleanedFilePath,
  normalizeSearchResult
} from './normalizeSearchResult'
import { FILES_DOCTYPE } from '../consts'
import { EnrichedSearchResult } from '../types'

const fakeFlatDomainClient = {
  getStackClient: () => ({
    uri: 'https://claude.mycozy.cloud'
  }),
  getInstanceOptions: () => ({
    subdomain: 'flat'
  })
} as unknown as CozyClient

describe('Should normalize files results', () => {
  test('Should handle files', () => {
    const doc = {
      _id: 'SOME_FILE_ID',
      _type: 'io.cozy.files',
      type: 'file',
      dir_id: 'PARENT_ID',
      name: 'SOME_FILE_NAME',
      path: 'SOME/FILE/PATH'
    }
    const searchResult = {
      doctype: 'io.cozy.files',
      doc: doc
    } as unknown as EnrichedSearchResult

    const result = normalizeSearchResult(
      fakeFlatDomainClient,
      searchResult,
      'someQuery'
    )

    expect(result).toStrictEqual({
      doc: doc,
      slug: 'drive',
      title: 'SOME_FILE_NAME',
      subTitle: 'SOME/FILE/PATH',
      url: 'https://claude-drive.mycozy.cloud/#/folder/PARENT_ID/file/SOME_FILE_ID',
      secondaryUrl: 'https://claude-drive.mycozy.cloud/#/folder/PARENT_ID'
    })
  })

  test('Should handle notes', () => {
    const doc = {
      _id: 'SOME_NOTE_ID',
      _type: 'io.cozy.files',
      type: 'file',
      dir_id: 'PARENT_ID',
      name: 'SOME_NOTE_NAME.cozy-note',
      path: 'SOME/NOTE/PATH',
      metadata: {
        title: 'Some note title',
        version: 1
      }
    }
    const searchResult = {
      doctype: 'io.cozy.files',
      doc: doc
    } as unknown as EnrichedSearchResult

    const result = normalizeSearchResult(
      fakeFlatDomainClient,
      searchResult,
      'someQuery'
    )

    expect(result).toStrictEqual({
      doc: doc,
      slug: 'notes',
      title: 'SOME_NOTE_NAME.cozy-note',
      subTitle: 'SOME/NOTE/PATH',
      url: 'https://claude-notes.mycozy.cloud/#/n/SOME_NOTE_ID',
      secondaryUrl: 'https://claude-drive.mycozy.cloud/#/folder/PARENT_ID'
    })
  })

  test('Should handle folders', () => {
    const doc = {
      _id: 'SOME_FODLER_ID',
      _type: 'io.cozy.files',
      type: 'directory',
      name: 'SOME_FOLDER_NAME',
      path: 'SOME/FOLDER/PATH',
      dir_id: 'PARENT_ID'
    }
    const searchResult = {
      doctype: 'io.cozy.files',
      doc: doc
    } as unknown as EnrichedSearchResult

    const result = normalizeSearchResult(
      fakeFlatDomainClient,
      searchResult,
      'someQuery'
    )

    expect(result).toStrictEqual({
      doc: doc,
      slug: 'drive',
      title: 'SOME_FOLDER_NAME',
      subTitle: 'SOME/FOLDER/PATH',
      url: 'https://claude-drive.mycozy.cloud/#/folder/SOME_FODLER_ID',
      secondaryUrl: 'https://claude-drive.mycozy.cloud/#/folder/PARENT_ID'
    })
  })
})

describe('Should normalize contacts results', () => {
  test(`Should use contact's displayName for title if exists`, () => {
    const doc = {
      _id: 'SOME_CONTACT_ID',
      _type: 'io.cozy.contacts',
      displayName: 'John Doe',
      jobTitle: 'Developper'
    }
    const searchResult = {
      doctype: 'io.cozy.files',
      doc: doc,
      fields: ['displayName', 'jobTitle']
    } as unknown as EnrichedSearchResult

    const result = normalizeSearchResult(
      fakeFlatDomainClient,
      searchResult,
      'John'
    )

    expect(result).toStrictEqual({
      doc: doc,
      slug: 'contacts',
      title: 'John Doe',
      subTitle: 'Developper',
      url: 'https://claude-contacts.mycozy.cloud/#/SOME_CONTACT_ID',
      secondaryUrl: null
    })
  })

  test(`Should use contact's fullname for title if exists`, () => {
    const doc = {
      _id: 'SOME_CONTACT_ID',
      _type: 'io.cozy.contacts',
      fullname: 'John Claude Doe',
      jobTitle: 'Developper'
    }
    const searchResult = {
      doctype: 'io.cozy.files',
      doc: doc,
      fields: ['displayName', 'jobTitle']
    } as unknown as EnrichedSearchResult

    const result = normalizeSearchResult(
      fakeFlatDomainClient,
      searchResult,
      'John'
    )

    expect(result).toStrictEqual({
      doc: doc,
      slug: 'contacts',
      title: 'John Claude Doe',
      subTitle: 'Developper',
      url: 'https://claude-contacts.mycozy.cloud/#/SOME_CONTACT_ID',
      secondaryUrl: null
    })
  })

  test(`Should use null for title if no displayName nor fullname exists on the contact`, () => {
    const doc = {
      _id: 'SOME_CONTACT_ID',
      _type: 'io.cozy.contacts',
      jobTitle: 'Developper'
    }
    const searchResult = {
      doctype: 'io.cozy.files',
      doc: doc,
      fields: ['displayName', 'jobTitle']
    } as unknown as EnrichedSearchResult

    const result = normalizeSearchResult(
      fakeFlatDomainClient,
      searchResult,
      'John'
    )

    expect(result).toStrictEqual({
      doc: doc,
      slug: 'contacts',
      title: null,
      subTitle: 'Developper',
      url: 'https://claude-contacts.mycozy.cloud/#/SOME_CONTACT_ID',
      secondaryUrl: null
    })
  })

  test(`Should use null for subtitle if no matching field`, () => {
    const doc = {
      _id: 'SOME_CONTACT_ID',
      _type: 'io.cozy.contacts',
      displayName: 'John Doe',
      jobTitle: 'Developper'
    }
    const searchResult = {
      doctype: 'io.cozy.files',
      doc: doc,
      fields: []
    } as unknown as EnrichedSearchResult

    const result = normalizeSearchResult(
      fakeFlatDomainClient,
      searchResult,
      'John'
    )

    expect(result).toStrictEqual({
      doc: doc,
      slug: 'contacts',
      title: 'John Doe',
      subTitle: null,
      url: 'https://claude-contacts.mycozy.cloud/#/SOME_CONTACT_ID',
      secondaryUrl: null
    })
  })

  test(`Should handle email in matching fields`, () => {
    const doc = {
      _id: 'SOME_CONTACT_ID',
      _type: 'io.cozy.contacts',
      displayName: 'John Doe',
      email: [
        {
          address: 'JohnDoe@cozy.mail'
        }
      ]
    }
    const searchResult = {
      doctype: 'io.cozy.files',
      doc: doc,
      fields: ['displayName', 'email[]:address']
    } as unknown as EnrichedSearchResult

    const result = normalizeSearchResult(
      fakeFlatDomainClient,
      searchResult,
      'John'
    )

    expect(result).toStrictEqual({
      doc: doc,
      slug: 'contacts',
      title: 'John Doe',
      subTitle: 'JohnDoe@cozy.mail',
      url: 'https://claude-contacts.mycozy.cloud/#/SOME_CONTACT_ID',
      secondaryUrl: null
    })
  })
})

describe('Should normalize apps results', () => {
  test(`Should use app's description from locales for name if exists`, () => {
    const doc = {
      _id: 'SOME_APP_ID',
      _type: 'io.cozy.apps',
      slug: 'drive',
      name: 'Cozy Drive',
      locales: {
        en: {
          short_description: 'Some app description'
        }
      }
    }
    const searchResult = {
      doctype: 'io.cozy.files',
      doc: doc,
      fields: ['displayName', 'email[]:address']
    } as unknown as EnrichedSearchResult

    const result = normalizeSearchResult(
      fakeFlatDomainClient,
      searchResult,
      'John'
    )

    expect(result).toStrictEqual({
      doc: doc,
      slug: 'drive',
      title: 'Cozy Drive',
      subTitle: 'Some app description',
      url: 'https://claude-drive.mycozy.cloud/#/',
      secondaryUrl: null
    })
  })

  test(`Should use app's name for name if no description exists in locales`, () => {
    const doc = {
      _id: 'SOME_APP_ID',
      _type: 'io.cozy.apps',
      slug: 'drive',
      name: 'Cozy Drive'
    }
    const searchResult = {
      doctype: 'io.cozy.files',
      doc: doc,
      fields: ['displayName', 'email[]:address']
    } as unknown as EnrichedSearchResult

    const result = normalizeSearchResult(
      fakeFlatDomainClient,
      searchResult,
      'John'
    )

    expect(result).toStrictEqual({
      doc: doc,
      slug: 'drive',
      title: 'Cozy Drive',
      subTitle: 'Cozy Drive',
      url: 'https://claude-drive.mycozy.cloud/#/',
      secondaryUrl: null
    })
  })
})

describe('Should normalize unknown doctypes', () => {
  test(``, () => {
    const doc = {
      _id: 'SOME_APP_ID',
      _type: 'io.cozy.unknown',
      slug: 'drive',
      name: 'Cozy Drive'
    }
    const searchResult = {
      doctype: 'io.cozy.files',
      doc: doc,
      fields: ['displayName', 'email[]:address']
    } as unknown as EnrichedSearchResult

    const result = normalizeSearchResult(
      fakeFlatDomainClient,
      searchResult,
      'John'
    )

    expect(result).toStrictEqual({
      doc: doc,
      slug: null,
      title: null,
      subTitle: null,
      url: null,
      secondaryUrl: null
    })
  })
})

describe('getCleanedFilePath', () => {
  it('should return the document unchanged if it is not an IOCozyFile', () => {
    const doc = { fullname: 'name' } as IOCozyContact
    expect(getCleanedFilePath(doc)).toEqual(doc)
  })

  it('should return the document unchanged if path is undefined', () => {
    const doc = { _type: FILES_DOCTYPE, name: 'name' } as IOCozyFile
    expect(getCleanedFilePath(doc)).toEqual(doc)
  })

  it('should remove name from path if path ends with name', () => {
    const doc = {
      _type: FILES_DOCTYPE,
      path: '/the/path/myname',
      name: 'myname'
    } as IOCozyFile
    const expected = { ...doc, path: '/the/path' }
    expect(getCleanedFilePath(doc)).toEqual(expected)
  })

  it('should return the document unchanged if path does not end with name', () => {
    const doc = {
      _type: FILES_DOCTYPE,
      path: '/the/path/othername',
      name: 'name'
    } as IOCozyFile
    expect(getCleanedFilePath(doc)).toEqual(doc)
  })
})
