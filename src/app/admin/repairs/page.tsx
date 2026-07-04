'use client';

import React, { useState } from 'react';
import { useAdminStore } from '@/store/adminStore';
import { DataTable, Column } from '@/components/admin/DataTable';
import { RepairRequest, RepairMessage } from '@/types';
import { Wrench, Eye, Send, DollarSign, MessageSquare, ShieldAlert, Clock, CheckCircle } from 'lucide-react';

export default function AdminRepairsPage() {
  const { repairs, updateRepairStatus, addRepairMessage } = useAdminStore();
  const [selectedRepairId, setSelectedRepairId] = useState<string | null>(null);
  
  // Messaging input
  const [messageText, setMessageText] = useState('');
  
  // Repair Cost input
  const [costInput, setCostInput] = useState<string>('');

  const getStatusBadge = (status: RepairRequest['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'repairing':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'inspecting':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'received':
        return 'bg-zinc-350 bg-zinc-700/30 text-zinc-300 border border-zinc-700/40';
      case 'submitted':
      default:
        return 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20';
    }
  };

  const handleSendMessage = (e: React.FormEvent, repairId: string) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    addRepairMessage(repairId, messageText.trim());
    setMessageText('');
  };

  const handleUpdateCost = (repairId: string) => {
    const parsedCost = Number(costInput);
    if (isNaN(parsedCost) || parsedCost < 0) {
      alert('Please enter a valid cost amount.');
      return;
    }
    const repair = repairs.find((r) => r.id === repairId);
    if (repair) {
      updateRepairStatus(repairId, repair.status, parsedCost);
      alert('Cost estimation updated successfully!');
      setCostInput('');
    }
  };

  const columns: Column<RepairRequest>[] = [
    {
      header: 'Ticket ID',
      accessor: (repair) => <span className="font-mono font-bold text-zinc-400">{repair.id}</span>,
      sortKey: 'id',
    },
    {
      header: 'Device Name',
      accessor: (repair) => <span className="font-semibold text-zinc-200">{repair.deviceName}</span>,
      sortKey: 'deviceName',
    },
    {
      header: 'Customer',
      accessor: (repair) => <span className="text-zinc-300 font-medium">{repair.pickupAddress.name}</span>,
    },
    {
      header: 'Pickup Date',
      accessor: (repair) => (
        <span className="font-mono text-zinc-500">
          {repair.preferredDate} ({repair.preferredTime})
        </span>
      ),
      sortKey: 'preferredDate',
    },
    {
      header: 'Estimated Cost',
      accessor: (repair) => (
        <span className="font-mono text-zinc-200">
          {repair.cost !== undefined ? `â‚¹${repair.cost}` : 'Pending Quote'}
        </span>
      ),
      sortKey: 'cost',
    },
    {
      header: 'Status',
      accessor: (repair) => (
        <span className={`inline-flex px-2.5 py-0.5 rounded-full font-mono text-[9px] font-bold uppercase tracking-wider ${getStatusBadge(repair.status)}`}>
          {repair.status}
        </span>
      ),
      sortKey: 'status',
    },
    {
      header: 'Actions',
      accessor: (repair) => (
        <button
          onClick={() => {
            setSelectedRepairId(selectedRepairId === repair.id ? null : repair.id);
            setCostInput(repair.cost?.toString() || '');
          }}
          className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors"
          title="Inspect Ticket"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  const selectedRepair = repairs.find((r) => r.id === selectedRepairId);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-sans tracking-tight text-zinc-100 flex items-center gap-2">
          Repair Control Station
        </h1>
        <p className="text-xs text-zinc-500 mt-1 font-mono uppercase tracking-wide">
          Manage hardware repairs, send user quotes, schedule pickups, and chat with clients.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        {/* Table View */}
        <div className={selectedRepair ? 'xl:col-span-2 space-y-6' : 'xl:col-span-3 space-y-6'}>
          <DataTable
            data={repairs}
            columns={columns}
            searchKey="deviceName"
            searchPlaceholder="Search by device..."
            rowKey={(r) => r.id}
            initialSort={{ key: 'id', direction: 'desc' }}
            pageSize={8}
          />
        </div>

        {/* Selected Repair Inspection / Chat panel */}
        {selectedRepair && (
          <div className="border border-zinc-900 bg-zinc-950/60 rounded-2xl overflow-hidden sticky top-28 animate-fade-in flex flex-col max-h-[780px]">
            {/* Header info */}
            <div className="p-5 border-b border-zinc-900 bg-black/30 flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                  Control Console
                </span>
                <h3 className="text-base font-bold text-zinc-200 font-mono leading-none">
                  Ticket: {selectedRepair.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRepairId(null)}
                className="text-xs text-zinc-500 hover:text-zinc-300 font-mono uppercase font-semibold"
              >
                Close
              </button>
            </div>

            {/* Content Details */}
            <div className="p-5 space-y-5 overflow-y-auto flex-grow">
              <div className="space-y-1.5">
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider font-semibold">
                  Device Info
                </span>
                <h4 className="text-sm font-bold text-zinc-100">{selectedRepair.deviceName}</h4>
                <p className="text-xs text-zinc-400 bg-zinc-900/40 border border-zinc-900 p-3 rounded-xl leading-relaxed">
                  {selectedRepair.issueDesc}
                </p>
              </div>

              {/* Status Update operations */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider font-semibold">
                    Set Work Status
                  </span>
                  <select
                    value={selectedRepair.status}
                    onChange={(e) => updateRepairStatus(selectedRepair.id, e.target.value as RepairRequest['status'])}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 cursor-pointer focus:outline-none"
                  >
                    <option value="submitted">Submitted</option>
                    <option value="received">Received</option>
                    <option value="inspecting">Inspecting</option>
                    <option value="repairing">Repairing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                {/* Estimate Cost updates */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider font-semibold">
                    Submit Quote (â‚¹)
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="e.g. 150"
                      value={costInput}
                      onChange={(e) => setCostInput(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 font-mono focus:outline-none"
                    />
                    <button
                      onClick={() => handleUpdateCost(selectedRepair.id)}
                      className="px-2.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-mono font-bold text-zinc-200 rounded-xl"
                    >
                      Set
                    </button>
                  </div>
                </div>
              </div>

              {/* Client Conversation */}
              <div className="space-y-3 pt-3 border-t border-zinc-900">
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider font-semibold flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-zinc-500" />
                  Client Chat logs
                </span>

                <div className="h-44 overflow-y-auto border border-zinc-900 bg-zinc-900/10 rounded-xl p-3 space-y-2 flex flex-col">
                  {selectedRepair.messages.length === 0 ? (
                    <span className="text-[10px] text-zinc-600 text-center font-mono my-auto">
                      No communications initiated yet.
                    </span>
                  ) : (
                    selectedRepair.messages.map((msg) => {
                      const isAdmin = msg.sender === 'admin';
                      return (
                        <div
                          key={msg.id}
                          className={`max-w-[80%] rounded-xl px-3.5 py-2 text-xs space-y-0.5 ${
                            isAdmin
                              ? 'bg-amber-500/10 text-amber-300 border border-yellow-500/10 self-end'
                              : 'bg-zinc-800/80 text-zinc-300 self-start'
                          }`}
                        >
                          <p>{msg.text}</p>
                          <span className="text-[8px] text-zinc-500 font-mono block text-right">
                            {isAdmin ? 'Admin' : 'Client'} â€¢{' '}
                            {new Date(msg.timestamp).toLocaleTimeString(undefined, {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>

                <form
                  onSubmit={(e) => handleSendMessage(e, selectedRepair.id)}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    placeholder="Enter chat update..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="flex-grow bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="p-2.5 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 text-black hover:shadow-lg transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
