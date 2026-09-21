import { createCrudApi } from './createCrudApi'
import { assets, assetAssignments, assetMaintenance } from '../data/assets'
import { vehicles, drivers, fuelLogs, vehicleMaintenance } from '../data/fleet'
import { mockGet } from './mockClient'

export const assetApi = {
  assets: createCrudApi({ store: assets, idPrefix: 'AST', searchFields: ['name', 'category'] }),
  assignments: createCrudApi({ store: assetAssignments, idPrefix: 'ASG', searchFields: ['asset', 'employee'] }),
  maintenance: createCrudApi({ store: assetMaintenance, idPrefix: 'MNT', searchFields: ['type'] }),
}

export const fleetApi = {
  vehicles: createCrudApi({ store: vehicles, idPrefix: 'VEH', searchFields: ['regNo', 'model', 'driver'] }),
  drivers: createCrudApi({ store: drivers, idPrefix: 'DRV', searchFields: ['name'] }),
  fuelLogs: createCrudApi({ store: fuelLogs, idPrefix: 'FUEL', searchFields: ['vehicle'] }),
  maintenance: createCrudApi({ store: vehicleMaintenance, idPrefix: 'VMT', searchFields: ['type'] }),
  async summary() {
    const active = vehicles.filter((v) => v.status === 'active').length
    const maintenance = vehicles.filter((v) => v.status === 'maintenance').length
    const fuelCost = fuelLogs.reduce((s, f) => s + f.cost, 0)
    return mockGet({ total: vehicles.length, active, maintenance, fuelCost })
  },
}
