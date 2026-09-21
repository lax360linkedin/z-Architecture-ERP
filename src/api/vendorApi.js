import { createCrudApi } from './createCrudApi'
import { vendors } from '../data/vendors'
import { purchaseOrders, purchaseInvoices } from '../data/procurement'
import { mockGet } from './mockClient'

const vendorsApi = createCrudApi({ store: vendors, idPrefix: 'VEN', searchFields: ['name', 'category', 'city'] })

export const vendorApi = {
  ...vendorsApi,
  async ordersFor(vendorId) {
    return mockGet(purchaseOrders.filter((po) => po.vendor === vendorId))
  },
  async invoicesFor(vendorId) {
    return mockGet(purchaseInvoices.filter((pi) => pi.vendor === vendorId))
  },
}
