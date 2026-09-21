import { createCrudApi } from './createCrudApi'
import { purchaseRequests, rfqs, vendorQuotations, purchaseOrders, goodsReceipts, purchaseInvoices } from '../data/procurement'

export const procurementApi = {
  requests: createCrudApi({ store: purchaseRequests, idPrefix: 'PR', searchFields: ['item', 'project'] }),
  rfqs: createCrudApi({ store: rfqs, idPrefix: 'RFQ', searchFields: ['item'] }),
  vendorQuotations: createCrudApi({ store: vendorQuotations, idPrefix: 'VQ', searchFields: ['rfq', 'vendor'] }),
  purchaseOrders: createCrudApi({ store: purchaseOrders, idPrefix: 'PO', searchFields: ['item', 'project'] }),
  goodsReceipts: createCrudApi({ store: goodsReceipts, idPrefix: 'GRN', searchFields: ['po'] }),
  purchaseInvoices: createCrudApi({ store: purchaseInvoices, idPrefix: 'PINV', searchFields: ['po'] }),
}
