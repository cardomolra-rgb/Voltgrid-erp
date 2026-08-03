import {
  Obra,
  ObraExpense,
  FuelLog,
  FinancialAccount,
  StockMovement,
} from '../types';

export interface ObraFinancialSummary {
  contractValue: number;
  directExpensesSum: number;
  fuelCostsSum: number;
  financialPayableSum: number;
  stockExitsSum: number;
  totalCostsSpent: number;
  calculatedProfit: number;
  profitMarginPercent: number;
}

export function calculateObraFinancials(
  obra: Obra,
  expenses: ObraExpense[] = [],
  fuelLogs: FuelLog[] = [],
  financials: FinancialAccount[] = [],
  movements: StockMovement[] = []
): ObraFinancialSummary {
  // Direct expenses added to Obra
  const directExpensesSum = (expenses || [])
    .filter((e) => e && e.obraId === obra.id)
    .reduce((acc, e) => acc + (Number(e.value) || 0), 0);

  // Fuel & fleet costs for Obra
  const fuelCostsSum = (fuelLogs || [])
    .filter((f) => f && f.obraId === obra.id)
    .reduce((acc, f) => acc + (Number(f.totalValue) || ((Number(f.liters) || 0) * (Number(f.pricePerLiter) || 0))), 0);

  // Accounts Payable for Obra
  const financialPayableSum = (financials || [])
    .filter((f) => f && f.type === 'Pagar' && f.obraId === obra.id)
    .reduce((acc, f) => acc + (Number(f.totalValue) || 0), 0);

  // Stock Material exits for Obra
  const stockExitsSum = (movements || [])
    .filter((m) => m && m.type === 'Saída Obra' && m.obraId === obra.id)
    .reduce((acc, m) => acc + ((Number(m.quantity) || 0) * (Number(m.unitCost) || 0)), 0);

  // Total Costs Spent (Sum of all costs added)
  const totalCostsSpent = directExpensesSum + fuelCostsSum + financialPayableSum + stockExitsSum;

  // Contract Value
  const contractValue = Number(obra.totalValue) || 0;

  // Realized Profit = Contract Value - Total Costs Spent
  // If no expenses or costs logged yet, default to contractValue - (materialValue + laborValue)
  const initialEstimatedCosts = (Number(obra.materialValue) || 0) + (Number(obra.laborValue) || 0);
  const calculatedProfit = totalCostsSpent > 0
    ? contractValue - totalCostsSpent
    : contractValue - initialEstimatedCosts;

  const profitMarginPercent = contractValue > 0 ? (calculatedProfit / contractValue) * 100 : 0;

  return {
    contractValue,
    directExpensesSum,
    fuelCostsSum,
    financialPayableSum,
    stockExitsSum,
    totalCostsSpent,
    calculatedProfit,
    profitMarginPercent,
  };
}
