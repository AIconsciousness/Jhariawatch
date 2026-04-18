import React from 'react';
import { BlueprintSatellite, BlueprintRadar } from '../components/BlueprintIcons';

const NexusTest = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-10">
      <div className="bg-white p-10 rounded-3xl shadow-2xl blueprint-card sketch-border max-w-lg w-full">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-blue-100 rounded-2xl">
            <BlueprintSatellite className="w-12 h-12 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">VISTA PROTOCOL</h1>
            <p className="technical-label opacity-40">System Handshake Finalized</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-xl border-l-4 border-blue-600">
            <p className="text-sm font-bold text-slate-700">Authentic Design Status:</p>
            <p className="text-xs text-slate-500 italic mt-1 font-medium">Blueprint-Sketch Aesthetic Verified. Schematic Icons Loaded.</p>
          </div>
          
          <div className="flex items-center gap-2 mt-8">
             <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Environment Stabilized</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NexusTest;
