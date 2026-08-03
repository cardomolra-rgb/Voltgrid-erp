import React, { useState } from 'react';
import { Package, ShoppingCart, Search, Plus, QrCode, ArrowDownRight, ArrowUpRight, AlertTriangle, CheckCircle2, Truck, DollarSign, RefreshCw } from 'lucide-react';
import { InventoryItem, StockMovement, PurchaseOrder, Obra } from '../types';

interface StockPurchasesModuleProps {
  inventory: InventoryItem[];
  movements: StockMovement[];
  purchases: PurchaseOrder[];
  obras: Obra[];
  onAddStockMovement: (movement: StockMovement) => void;
  onAddPurchaseOrder: (po: PurchaseOrder) => void;
}

export const StockPurchasesModule: React.FC<StockPurchasesModuleProps> = ({
  inventory,
  movements,
  purchases,
  obras,
  onAddStockMovement,
  onAddPurchaseOrder,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'estoque' | 'movimentacoes' | 'compras'>('estoque');
  const [searchTerm, setSearchTerm] = useState('');

  // Stock Movement Modal
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(inventory[0]?.id || '');
  const [movementType, setMovementType] = useState<'Entrada' | 'Saída Obra'>('Saída Obra');
  const [movementQty, setMovementQty] = useState(1);
  const [selectedObraId, setSelectedObraId] = useState(obras[0]?.id || '');

  // New Purchase Order Modal
  const [showPOModal, setShowPOModal] = useState(false);
  const [poSupplier, setPoSupplier] = useState('WEG Equipamentos Elétricos');
  const [poVal, setPoVal] = useState(35000);

  const filteredInventory = inventory.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveMovement = (e: React.FormEvent) => {
    e.preventDefault();
    const item = inventory.find((i) => i.id === selectedItemId);
    const obra = obras.find((o) => o.id === selectedObraId);
    if (!item) return;

    const newMov: StockMovement = {
      id: `MOV-${Date.now()}`,
      itemId: item.id,
      itemName: item.name,
      type: movementType,
      quantity: movementQty,
      unit: item.unit,
      obraId: movementType === 'Saída Obra' ? obra?.id : undefined,
      obraCode: movementType === 'Saída Obra' ? (obra?.projectNumber || obra?.code) : undefined,
      unitCost: item.unitCost,
      totalValue: movementQty * item.unitCost,
      date: new Date().toISOString().split('T')[0],
      responsible: 'Almoxarife Sérgio',
      notes: movementType === 'Saída Obra' ? `Baixa automática para ${obra?.projectNumber || obra?.code}` : 'Entrada em estoque',
    };

    onAddStockMovement(newMov);
    setShowMovementModal(false);
  };

  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    const newPo: PurchaseOrder = {
      id: `PED-2026-09${purchases.length + 1}`,
      number: `PO-882${purchases.length + 3}`,
      requester: 'Depto de Compras VoltGrid',
      status: 'Cotação',
      supplierName: poSupplier,
      totalValue: poVal,
      createdAt: new Date().toISOString().split('T')[0],
      deliveryDate: '2026-08-15',
      items: [
        {
          itemId: 'MAT-001',
          itemName: 'Lote de Materiais Elétricos de Distribuição',
          quantity: 1,
          unitPrice: poVal,
          totalPrice: poVal,
        },
      ],
    };
    onAddPurchaseOrder(newPo);
    setShowPOModal(false);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header & Subtabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm">
        <div>
          <h1 className="text-base font-semibold text-zinc-100 flex items-center space-x-2 font-mono">
            <Package className="w-5 h-5 text-blue-500" />
            <span>Almoxarifado, Estoque & Módulo de Compras (RDU/RDR)</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Controle de postes, transformadores, cabos, chaves, QR Code, preço médio e baixa automática por obra.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowMovementModal(true)}
            className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-sm transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Movimentar Estoque</span>
          </button>

          <button
            onClick={() => setShowPOModal(true)}
            className="px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs flex items-center space-x-1.5 border border-zinc-700 transition-all"
          >
            <ShoppingCart className="w-4 h-4 text-blue-400" />
            <span>Nova Cotação/Pedido</span>
          </button>
        </div>
      </div>

      {/* Subtab Toggle */}
      <div className="flex items-center space-x-2 border-b border-zinc-800 pb-2 text-xs font-medium">
        <button
          onClick={() => setActiveSubTab('estoque')}
          className={`px-3.5 py-1.5 rounded-lg transition-all ${
            activeSubTab === 'estoque'
              ? 'bg-zinc-100 text-zinc-900 font-semibold shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
          }`}
        >
          Materiais em Estoque ({inventory.length})
        </button>

        <button
          onClick={() => setActiveSubTab('movimentacoes')}
          className={`px-3.5 py-1.5 rounded-lg transition-all ${
            activeSubTab === 'movimentacoes'
              ? 'bg-zinc-100 text-zinc-900 font-semibold shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
          }`}
        >
          Histórico de Entradas / Saídas ({movements.length})
        </button>

        <button
          onClick={() => setActiveSubTab('compras')}
          className={`px-3.5 py-1.5 rounded-lg transition-all ${
            activeSubTab === 'compras'
              ? 'bg-zinc-100 text-zinc-900 font-semibold shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
          }`}
        >
          Pedidos de Compra ({purchases.length})
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          placeholder="Buscar material por código, nome ou categoria..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-sans"
        />
      </div>

      {/* SUBTAB 1: ESTOQUE */}
      {activeSubTab === 'estoque' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3">Código / Material</th>
                <th className="py-2.5 px-3">Categoria</th>
                <th className="py-2.5 px-3">Qtd Atual</th>
                <th className="py-2.5 px-3">Mínima</th>
                <th className="py-2.5 px-3">Reservado Obra</th>
                <th className="py-2.5 px-3">Custo Médio Unit.</th>
                <th className="py-2.5 px-3">Localização Pátio</th>
                <th className="py-2.5 px-3">QR Code</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filteredInventory.map((item) => {
                const isLow = item.currentQuantity <= item.minQuantity;
                return (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 dark:text-white">{item.code}</div>
                      <div className="text-[11px] text-slate-500">{item.name}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px]">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-black">
                      <span className={isLow ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'}>
                        {item.currentQuantity} {item.unit}
                      </span>
                      {isLow && (
                        <span className="ml-2 text-[9px] font-bold text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded">
                          ABAIXO DO MÍNIMO
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {item.minQuantity} {item.unit}
                    </td>
                    <td className="py-3 px-3 font-bold text-amber-500">
                      {item.reservedQuantity} {item.unit}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-200">
                      R$ {item.avgCost.toLocaleString('pt-BR')}
                    </td>
                    <td className="py-3 px-3 text-slate-500">{item.storageLocation}</td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px] text-slate-600 dark:text-slate-400">
                        <QrCode className="w-3 h-3 text-amber-500" />
                        <span>{item.barcodeQr}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* SUBTAB 2: MOVIMENTAÇÕES */}
      {activeSubTab === 'movimentacoes' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase">
            Registro de Movimentações (Entradas e Saídas para Obras)
          </h3>

          <div className="space-y-2">
            {movements.map((mov) => (
              <div
                key={mov.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs"
              >
                <div className="flex items-center space-x-3">
                  {mov.type === 'Entrada' ? (
                    <ArrowDownRight className="w-5 h-5 text-emerald-500 shrink-0" />
                  ) : (
                    <ArrowUpRight className="w-5 h-5 text-rose-500 shrink-0" />
                  )}
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{mov.itemName}</p>
                    <p className="text-[11px] text-slate-400">
                      {mov.type} • Data: {mov.date} • Resp: {mov.responsible}
                      {mov.obraCode && <strong className="text-amber-500 ml-1">({mov.obraCode})</strong>}
                    </p>
                  </div>
                </div>

                <div className="text-right font-black">
                  <span className={mov.type === 'Entrada' ? 'text-emerald-500' : 'text-rose-500'}>
                    {mov.type === 'Entrada' ? '+' : '-'} {mov.quantity} {mov.unit}
                  </span>
                  <p className="text-[10px] text-slate-400">
                    Total: R$ {mov.totalValue.toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 3: COMPRAS */}
      {activeSubTab === 'compras' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase">
            Pedidos de Compras & Cotações de Materiais
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {purchases.map((po) => (
              <div
                key={po.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-amber-500">{po.number}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 font-bold text-[10px]">
                    {po.status}
                  </span>
                </div>

                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{po.supplierName}</p>
                  <p className="text-[11px] text-slate-400">Solicitante: {po.requester}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 text-[10px]">Previsão Entrega: {po.deliveryDate}</span>
                  <span className="font-black text-slate-900 dark:text-white text-sm">
                    R$ {po.totalValue.toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Movement Modal */}
      {showMovementModal && (
        <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-4 shadow-2xl">
            <h2 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider font-mono">
              Registrar Movimentação de Estoque
            </h2>

            <form onSubmit={handleSaveMovement} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-zinc-300 block mb-1">Tipo de Movimento</label>
                <select
                  value={movementType}
                  onChange={(e) => setMovementType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500 font-sans"
                >
                  <option value="Saída Obra">Saída para Obra (Baixa Automática)</option>
                  <option value="Entrada">Entrada (Recebimento/NF)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-zinc-300 block mb-1">Material</label>
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500 font-sans"
                >
                  {inventory.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.code} - {i.name} ({i.currentQuantity} em estoque)
                    </option>
                  ))}
                </select>
              </div>

              {movementType === 'Saída Obra' && (
                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Obra Destino</label>
                  <select
                    value={selectedObraId}
                    onChange={(e) => setSelectedObraId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500 font-sans"
                  >
                    {obras.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.projectNumber || o.code} - {o.projectName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="font-semibold text-zinc-300 block mb-1">Quantidade</label>
                <input
                  type="number"
                  min="1"
                  value={movementQty}
                  onChange={(e) => setMovementQty(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowMovementModal(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors"
                >
                  Confirmar Baixa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PO Modal */}
      {showPOModal && (
        <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-4 shadow-2xl">
            <h2 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider font-mono">
              Nova Cotação / Pedido de Compra
            </h2>

            <form onSubmit={handleCreatePO} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-zinc-300 block mb-1">Fornecedor Homologado</label>
                <input
                  type="text"
                  required
                  value={poSupplier}
                  onChange={(e) => setPoSupplier(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-300 block mb-1">Valor Total Cotação (R$)</label>
                <input
                  type="number"
                  required
                  value={poVal}
                  onChange={(e) => setPoVal(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowPOModal(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors"
                >
                  Emitir Pedido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
