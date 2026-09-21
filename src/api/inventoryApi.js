import { createCrudApi } from './createCrudApi'
import { mockGet } from './mockClient'
import { items, warehouses, stockTransfers } from '../data/inventory'

export const inventoryApi = {
  items: createCrudApi({ store: items, idPrefix: 'ITM', searchFields: ['name', 'sku', 'category'] }),
  warehouses: createCrudApi({ store: warehouses, idPrefix: 'WH', searchFields: ['name', 'location'] }),
  transfers: createCrudApi({ store: stockTransfers, idPrefix: 'STX', searchFields: ['item'] }),
  async summary() {
    const totalValue = items.reduce((s, i) => s + i.quantity * i.unitCost, 0)
    const lowStock = items.filter((i) => i.status === 'low-stock').length
    const outOfStock = items.filter((i) => i.status === 'out-of-stock').length
    return mockGet({ totalValue, lowStock, outOfStock, totalItems: items.length })
  },
}
