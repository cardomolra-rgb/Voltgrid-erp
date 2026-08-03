import React, { useState } from 'react';
import { Truck, Fuel, Plus, Edit, Trash2, Gauge, Wrench, ShieldCheck, DollarSign, X } from 'lucide-react';
import { Vehicle, FuelLog, Obra } from '../types';

interface FleetModuleProps {
  vehicles: Vehicle[];
  fuelLogs: FuelLog[];
  obras: Obra[];
  onAddVehicle?: (vehicle: Vehicle) => void;
  onUpdateVehicle?: (vehicle: Vehicle) => void;
  onDeleteVehicle?: (vehicleId: string) => void;
  onAddFuelLog: (log: FuelLog) => void;
  onUpdateFuelLog?: (log: FuelLog) => void;
  onDeleteFuelLog?: (logId: string) => void;
}

export const FleetModule: React.FC<FleetModuleProps> = ({
  vehicles,
  fuelLogs,
  obras,
  onAddVehicle,
  onUpdateVehicle,
  onDeleteVehicle,
  onAddFuelLog,
  onUpdateFuelLog,
  onDeleteFuelLog,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'veiculos' | 'combustivel'>('veiculos');
  const [showFuelModal, setShowFuelModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  // Form State for Vehicle Registration/Edit
  const [vehModel, setVehModel] = useState('');
  const [vehPlate, setVehPlate] = useState('');
  const [vehType, setVehType] = useState<Vehicle['type']>('Munck');
  const [vehYear, setVehYear] = useState(2025);
  const [vehStatus, setVehStatus] = useState<Vehicle['status']>('Em Operação');
  const [vehKm, setVehKm] = useState(15000);
  const [vehDriver, setVehDriver] = useState('');
  const [vehIpva, setVehIpva] = useState<Vehicle['ipvaStatus']>('Pago');
  const [vehInsurance, setVehInsurance] = useState('2026-12-31');
  const [vehAvgKml, setVehAvgKml] = useState(3.5);

  // Form State for Fuel Log
  const [editingFuelLog, setEditingFuelLog] = useState<FuelLog | null>(null);
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id || '');
  const [obraId, setObraId] = useState(obras[0]?.id || '');
  const [driverName, setDriverName] = useState('Marcos Silva');
  const [stationName, setStationName] = useState('Posto Shell Anhanguera');
  const [fuelDate, setFuelDate] = useState(new Date().toISOString().split('T')[0]);
  const [liters, setLiters] = useState(120);
  const [pricePerLiter, setPricePerLiter] = useState(6.00);
  const [initialKm, setInitialKm] = useState(68100);
  const [finalKm, setFinalKm] = useState(68450);

  const handleOpenAddVehicle = () => {
    setEditingVehicle(null);
    setVehModel('');
    setVehPlate('');
    setVehType('Munck');
    setVehYear(2025);
    setVehStatus('Em Operação');
    setVehKm(15000);
    setVehDriver('');
    setVehIpva('Pago');
    setVehInsurance('2026-12-31');
    setVehAvgKml(3.5);
    setShowVehicleModal(true);
  };

  const handleOpenEditVehicle = (veh: Vehicle) => {
    setEditingVehicle(veh);
    setVehModel(veh.model);
    setVehPlate(veh.plate);
    setVehType(veh.type);
    setVehYear(veh.year);
    setVehStatus(veh.status);
    setVehKm(veh.currentKm);
    setVehDriver(veh.assignedDriver || '');
    setVehIpva(veh.ipvaStatus);
    setVehInsurance(veh.insuranceValidity || '2026-12-31');
    setVehAvgKml(veh.avgKmLiter || 3.5);
    setShowVehicleModal(true);
  };

  const handleDeleteVehicleClick = (vehId: string) => {
    if (confirm('Tem certeza de que deseja excluir este veículo da frota?')) {
      if (onDeleteVehicle) {
        onDeleteVehicle(vehId);
      }
    }
  };

  const handleOpenAddFuelModal = () => {
    setEditingFuelLog(null);
    setVehicleId(vehicles[0]?.id || '');
    setObraId(obras[0]?.id || '');
    setDriverName('Marcos Silva');
    setStationName('Posto Shell Anhanguera');
    setFuelDate(new Date().toISOString().split('T')[0]);
    setLiters(120);
    setPricePerLiter(6.00);
    setInitialKm(68100);
    setFinalKm(68450);
    setShowFuelModal(true);
  };

  const handleOpenEditFuelModal = (log: FuelLog) => {
    setEditingFuelLog(log);
    setVehicleId(log.vehicleId);
    setObraId(log.obraId);
    setDriverName(log.driverName);
    setStationName(log.stationName || 'Posto Shell Anhanguera');
    setFuelDate(log.date || new Date().toISOString().split('T')[0]);
    setLiters(log.liters);
    setPricePerLiter(log.pricePerLiter);
    setInitialKm(log.initialKm);
    setFinalKm(log.finalKm);
    setShowFuelModal(true);
  };

  const handleDeleteFuelLogClick = (logId: string) => {
    if (confirm('Tem certeza de que deseja excluir este registro de abastecimento? O lançamento correspondente no Contas a Pagar do Financeiro também será removido.')) {
      if (onDeleteFuelLog) {
        onDeleteFuelLog(logId);
      }
    }
  };

  const handleSaveVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehModel || !vehPlate) return;

    if (editingVehicle && onUpdateVehicle) {
      const updatedVeh: Vehicle = {
        ...editingVehicle,
        plate: vehPlate.toUpperCase(),
        model: vehModel,
        type: vehType,
        year: vehYear,
        status: vehStatus,
        currentKm: vehKm,
        ipvaStatus: vehIpva,
        insuranceValidity: vehInsurance,
        assignedDriver: vehDriver || 'Motorista Não Atribuído',
        avgKmLiter: vehAvgKml,
      };
      onUpdateVehicle(updatedVeh);
    } else {
      const newVeh: Vehicle = {
        id: `VEH-${Date.now()}`,
        plate: vehPlate.toUpperCase(),
        model: vehModel,
        type: vehType,
        year: vehYear,
        status: vehStatus,
        currentKm: vehKm,
        lastOilChangeKm: vehKm,
        ipvaStatus: vehIpva,
        insuranceValidity: vehInsurance,
        assignedDriver: vehDriver || 'Motorista Não Atribuído',
        avgKmLiter: vehAvgKml,
      };
      if (onAddVehicle) {
        onAddVehicle(newVeh);
      }
    }

    setShowVehicleModal(false);
  };

  const handleSaveFuel = (e: React.FormEvent) => {
    e.preventDefault();
    const veh = vehicles.find((v) => v.id === vehicleId);
    const obra = obras.find((o) => o.id === obraId);
    const calcKm = finalKm - initialKm;
    const totalVal = liters * pricePerLiter;
    const avgKml = calcKm > 0 && liters > 0 ? Number((calcKm / liters).toFixed(2)) : 0;
    const costKm = calcKm > 0 ? Number((totalVal / calcKm).toFixed(2)) : 0;

    if (editingFuelLog && onUpdateFuelLog) {
      const updatedLog: FuelLog = {
        ...editingFuelLog,
        date: fuelDate,
        driverName,
        vehicleId: veh?.id || editingFuelLog.vehicleId,
        vehiclePlate: veh?.plate || editingFuelLog.vehiclePlate,
        vehicleModel: veh?.model || editingFuelLog.vehicleModel,
        obraId: obra?.id || editingFuelLog.obraId,
        obraCode: obra?.projectNumber || obra?.code || editingFuelLog.obraCode,
        stationName,
        liters,
        totalValue: totalVal,
        pricePerLiter,
        initialKm,
        finalKm,
        calculatedKm: calcKm,
        avgConsumptionKml: avgKml,
        costPerKm: costKm,
      };
      onUpdateFuelLog(updatedLog);
    } else {
      const newLog: FuelLog = {
        id: `FL-${Date.now()}`,
        date: fuelDate,
        driverName,
        vehicleId: veh?.id || vehicles[0]?.id || 'VEH-001',
        vehiclePlate: veh?.plate || vehicles[0]?.plate || 'ABC-1234',
        vehicleModel: veh?.model || vehicles[0]?.model || 'Munck',
        obraId: obra?.id || obras[0]?.id || 'OBR-2026-001',
        obraCode: obra?.projectNumber || obra?.code || obras[0]?.projectNumber || obras[0]?.code || 'PRJ-001',
        stationName,
        liters,
        totalValue: totalVal,
        pricePerLiter,
        initialKm,
        finalKm,
        calculatedKm: calcKm,
        avgConsumptionKml: avgKml,
        costPerKm: costKm,
      };
      onAddFuelLog(newLog);
    }

    setShowFuelModal(false);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm">
        <div>
          <h1 className="text-base font-semibold text-zinc-100 flex items-center space-x-2 font-mono">
            <Truck className="w-5 h-5 text-amber-500" />
            <span>Gestão de Frota, Máquinas & Controle de Combustível</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Cadastro de veículos, edição/exclusão, Munck 45t, retroescavadeiras e histórico de abastecimentos.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Button: Cadastro de Veículo */}
          <button
            onClick={handleOpenAddVehicle}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Cadastrar Veículo</span>
          </button>

          {/* Button: Abastecimento */}
          <button
            onClick={handleOpenAddFuelModal}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center space-x-1.5 shadow-md transition-all cursor-pointer"
          >
            <Fuel className="w-4 h-4 stroke-[2.5]" />
            <span>Registrar Abastecimento</span>
          </button>
        </div>
      </div>

      {/* Subtab Toggle */}
      <div className="flex items-center space-x-2 border-b border-zinc-800 pb-2 text-xs font-bold font-mono">
        <button
          onClick={() => setActiveSubTab('veiculos')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeSubTab === 'veiculos'
              ? 'bg-amber-500 text-zinc-950 font-black'
              : 'text-zinc-400 hover:bg-zinc-800'
          }`}
        >
          Veículos & Equipamentos ({vehicles.length})
        </button>

        <button
          onClick={() => setActiveSubTab('combustivel')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeSubTab === 'combustivel'
              ? 'bg-amber-500 text-zinc-950 font-black'
              : 'text-zinc-400 hover:bg-zinc-800'
          }`}
        >
          Histórico de Abastecimentos ({fuelLogs.length})
        </button>
      </div>

      {/* SUBTAB 1: VEICULOS */}
      {activeSubTab === 'veiculos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vehicles.map((veh) => (
            <div
              key={veh.id}
              className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm space-y-4 hover:border-amber-500/40 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold text-[10px] font-mono">
                    {veh.type}
                  </span>
                  <h3 className="text-sm font-extrabold text-zinc-100 mt-1">
                    {veh.model}
                  </h3>
                  <p className="text-xs font-mono text-zinc-400">Placa: {veh.plate} • Ano: {veh.year}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono ${
                      veh.status === 'Em Operação'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {veh.status}
                  </span>

                  {/* Actions: Edit & Delete */}
                  <button
                    type="button"
                    onClick={() => handleOpenEditVehicle(veh)}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-blue-600 text-zinc-400 hover:text-white transition-colors"
                    title="Editar Veículo"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteVehicleClick(veh.id)}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-600 text-zinc-400 hover:text-white transition-colors"
                    title="Excluir Veículo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 text-[11px] bg-zinc-950 p-3 rounded-xl border border-zinc-800 font-mono">
                <div>
                  <span className="text-zinc-500 block text-[10px]">Hodômetro Atual</span>
                  <span className="font-bold text-zinc-100">{veh.currentKm.toLocaleString('pt-BR')} KM/Horas</span>
                </div>

                <div>
                  <span className="text-zinc-500 block text-[10px]">Motorista Atribuído</span>
                  <span className="font-bold text-zinc-100">{veh.assignedDriver}</span>
                </div>

                <div>
                  <span className="text-zinc-500 block text-[10px]">IPVA / Seguro</span>
                  <span className="font-bold text-emerald-400">{veh.ipvaStatus} (Venc: {veh.insuranceValidity})</span>
                </div>

                <div>
                  <span className="text-zinc-500 block text-[10px]">Média Consumo Esperada</span>
                  <span className="font-bold text-amber-400">{veh.avgKmLiter} KM/L</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUBTAB 2: COMBUSTIVEL */}
      {activeSubTab === 'combustivel' && (
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-zinc-100 uppercase font-mono">
              Logs de Abastecimento & Integração Automática com Financeiro
            </h3>
            <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              ⚡ Sincronizado com Contas a Pagar
            </span>
          </div>

          <div className="space-y-2">
            {fuelLogs.map((log) => (
              <div
                key={log.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono gap-3 hover:border-zinc-700 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className="font-bold text-zinc-100">{log.vehicleModel}</span>
                    <span className="text-[10px] text-zinc-400">({log.vehiclePlate})</span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold text-[10px]">
                      {log.obraCode}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold text-[10px] font-sans">
                      {log.stationName || 'Posto Shell'}
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      {log.date}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-sans">
                    Motorista: <strong>{log.driverName}</strong> • Trajeto: <strong>{log.calculatedKm} km</strong> ({log.initialKm} ➔ {log.finalKm} KM)
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-4">
                  <div className="text-right">
                    <span className="font-black text-emerald-400 block text-sm">
                      R$ {log.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-zinc-400 block font-sans">
                      {log.liters}L (R$ {log.pricePerLiter.toFixed(2)}/L) • Média: {log.avgConsumptionKml} KM/L
                    </span>
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className="flex items-center space-x-1.5 border-l border-zinc-800 pl-3">
                    <button
                      type="button"
                      onClick={() => handleOpenEditFuelModal(log)}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-blue-600 text-zinc-400 hover:text-white transition-colors"
                      title="Editar Abastecimento"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteFuelLogClick(log.id)}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-600 text-zinc-400 hover:text-white transition-colors"
                      title="Excluir Abastecimento"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal 1: Cadastro / Edição de Veículo */}
      {showVehicleModal && (
        <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider font-mono flex items-center space-x-2">
                <Truck className="w-4 h-4 text-blue-400" />
                <span>{editingVehicle ? 'Editar Veículo / Equipamento' : 'Cadastrar Novo Veículo / Equipamento'}</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowVehicleModal(false)}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveVehicle} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-zinc-300 block mb-1">Modelo / Descrição do Veículo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Caminhão Guindaste Munck 45t / Toyota Hilux 4x4..."
                  value={vehModel}
                  onChange={(e) => setVehModel(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Placa *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: ABC-1D23"
                    value={vehPlate}
                    onChange={(e) => setVehPlate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Ano de Fabricação</label>
                  <input
                    type="number"
                    value={vehYear}
                    onChange={(e) => setVehYear(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Categoria / Tipo</label>
                  <select
                    value={vehType}
                    onChange={(e) => setVehType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500 font-sans"
                  >
                    <option value="Munck">Munck / Guindaste</option>
                    <option value="Caminhão Cesto Linha Viva">Caminhão Cesto Linha Viva</option>
                    <option value="Picape Cesta">Picape Cesta Isolada</option>
                    <option value="Utilitário 4x4">Utilitário 4x4 / Picape</option>
                    <option value="Retroescavadeira">Retroescavadeira</option>
                    <option value="Moto">Moto de Inspeção</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Status Operacional</label>
                  <select
                    value={vehStatus}
                    onChange={(e) => setVehStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500 font-sans"
                  >
                    <option value="Em Operação">Em Operação</option>
                    <option value="Em Manutenção">Em Manutenção</option>
                    <option value="Reservado">Reservado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Hodômetro Atual (KM/Horas)</label>
                  <input
                    type="number"
                    value={vehKm}
                    onChange={(e) => setVehKm(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Média Estimada (KM/L)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={vehAvgKml}
                    onChange={(e) => setVehAvgKml(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-zinc-300 block mb-1">Motorista Responsável</label>
                <input
                  type="text"
                  placeholder="Nome do motorista ou operador principal..."
                  value={vehDriver}
                  onChange={(e) => setVehDriver(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowVehicleModal(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 font-medium text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-sm transition-colors"
                >
                  {editingVehicle ? 'Salvar Alterações' : 'Salvar Veículo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Fuel Log (Cadastro / Edição) */}
      {showFuelModal && (
        <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
          <div className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider font-mono flex items-center space-x-2">
                <Fuel className="w-4 h-4 text-amber-500" />
                <span>{editingFuelLog ? 'Editar Lançamento de Abastecimento' : 'Registrar Abastecimento de Veículo/Máquina'}</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowFuelModal(false)}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFuel} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Veículo / Equipamento *</label>
                  <select
                    value={vehicleId}
                    onChange={(e) => setVehicleId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500 font-sans"
                  >
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.model} ({v.plate})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Obra Vinculada *</label>
                  <select
                    value={obraId}
                    onChange={(e) => setObraId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500 font-sans"
                  >
                    {obras.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.projectNumber || o.code} - {o.projectName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Posto de Combustível / Fornecedor</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Posto Shell Anhanguera"
                    value={stationName}
                    onChange={(e) => setStationName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500 font-sans"
                  />
                </div>

                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Data do Abastecimento</label>
                  <input
                    type="date"
                    required
                    value={fuelDate}
                    onChange={(e) => setFuelDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-zinc-300 block mb-1">Motorista / Condutor Responsável</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do motorista..."
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Litros Abastecidos</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={liters}
                    onChange={(e) => setLiters(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Preço por Litro (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={pricePerLiter}
                    onChange={(e) => setPricePerLiter(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">KM Inicial (Leitura)</label>
                  <input
                    type="number"
                    value={initialKm}
                    onChange={(e) => setInitialKm(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">KM Final (Leitura)</label>
                  <input
                    type="number"
                    value={finalKm}
                    onChange={(e) => setFinalKm(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              {/* Total Calculation & Financial Sync Preview */}
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between font-mono">
                <div>
                  <span className="text-[10px] text-emerald-400 font-bold block">VALOR TOTAL DO ABASTECIMENTO</span>
                  <span className="text-[10px] text-zinc-400 font-sans">Lançamento automático no Contas a Pagar</span>
                </div>
                <span className="text-base font-black text-emerald-400">
                  R$ {(liters * pricePerLiter).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowFuelModal(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 font-semibold text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-md transition-colors cursor-pointer"
                >
                  {editingFuelLog ? 'Salvar Alterações e Atualizar Financeiro' : 'Salvar e Lançar no Financeiro (Contas a Pagar)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
