import { createCrudApi } from './createCrudApi'
import { designs, documents, documentFolders } from '../data/designs'
import { drawings, drawingCategories } from '../data/drawings'
import { mockGet, mockMutate } from './mockClient'

export const designApi = {
  designs: createCrudApi({ store: designs, idPrefix: 'DSN', searchFields: ['stage', 'notes'] }),
  drawings: createCrudApi({ store: drawings, idPrefix: 'DRW', searchFields: ['number', 'name', 'category'] }),
  documents: createCrudApi({ store: documents, idPrefix: 'DOC', searchFields: ['name', 'folder', 'department'] }),
  drawingCategories,
  documentFolders,
  async addRevision(drawingId, note) {
    return mockMutate(() => {
      const d = drawings.find((x) => x.id === drawingId)
      if (!d) throw new Error('not found')
      const num = d.revisions.length
      const rev = `Rev ${String(num).padStart(2, '0')}`
      d.revisions.push({ rev, date: new Date().toISOString().slice(0, 10), note })
      d.revision = rev
      d.status = 'under-review'
      return d
    })
  },
}
