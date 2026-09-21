export const pipelineStages = ['New', 'Qualified', 'Requirement', 'Site Visit', 'Proposal', 'Negotiation', 'Won', 'Lost']

export const opportunities = [
  { id: 'OPP-201', client: 'Vantage Builders LLP', project: '15-Storey Mixed-Use Tower', value: 68000000, probability: 40, owner: 'EMP-017', stage: 'Proposal', expectedClose: '2024-11-15', leadId: 'LEAD-102' },
  { id: 'OPP-202', client: 'Coastal Hospitality Pvt Ltd', project: 'Boutique Resort - 28 Keys', value: 54000000, probability: 55, owner: 'EMP-017', stage: 'Negotiation', expectedClose: '2024-10-30', leadId: 'LEAD-104' },
  { id: 'OPP-203', client: 'Zenith Retail Spaces', project: 'Flagship Store Rollout (6 sites)', value: 21000000, probability: 25, owner: 'EMP-017', stage: 'Site Visit', expectedClose: '2024-12-05', leadId: 'LEAD-106' },
  { id: 'OPP-204', client: 'Horizon Business Centre', project: 'Co-working Fit-out', value: 34500000, probability: 60, owner: 'EMP-017', stage: 'Proposal', expectedClose: '2024-11-01', leadId: 'LEAD-108' },
  { id: 'OPP-205', client: 'Prestige Wellness Group', project: 'Spa & Wellness Centre', value: 41000000, probability: 30, owner: 'EMP-017', stage: 'Requirement', expectedClose: '2024-12-20', leadId: 'LEAD-110' },
  { id: 'OPP-206', client: 'Aditi & Rohan Sarin', project: 'Sea-facing Apartment Interiors', value: 7400000, probability: 70, owner: 'EMP-018', stage: 'Negotiation', expectedClose: '2024-10-10', leadId: 'LEAD-111' },
  { id: 'OPP-207', client: 'Sundar Textiles Ltd', project: 'Corporate Office + Welfare Facility', value: 29500000, probability: 15, owner: 'EMP-017', stage: 'New', expectedClose: '2025-01-15', leadId: 'LEAD-112' },
  { id: 'OPP-208', client: 'Arnav Chopra', project: '3BHK Renovation', value: 4500000, probability: 65, owner: 'EMP-018', stage: 'Qualified', expectedClose: '2024-10-18', leadId: 'LEAD-101' },
  { id: 'OPP-209', client: 'Ishaan & Kavita Rathore', project: 'Farmhouse Design', value: 12000000, probability: 20, owner: 'EMP-018', stage: 'New', expectedClose: '2024-12-28', leadId: 'LEAD-103' },
  { id: 'OPP-210', client: 'Ritu & Manav Oberoi', project: 'Penthouse Interiors', value: 9800000, probability: 100, owner: 'EMP-018', stage: 'Won', expectedClose: '2024-07-30', leadId: 'LEAD-107' },
  { id: 'OPP-211', client: 'Rakesh Bansal', project: 'Apartment Interior Design', value: 3200000, probability: 0, owner: 'EMP-018', stage: 'Lost', expectedClose: '2024-08-28', leadId: 'LEAD-105' },
  { id: 'OPP-212', client: 'Dr. Nisha Reddy', project: 'Lakeside Weekend Home', value: 15600000, probability: 20, owner: 'EMP-018', stage: 'New', expectedClose: '2025-01-30', leadId: 'LEAD-109' },
]

export const getOpportunityById = (id) => opportunities.find((o) => o.id === id)
