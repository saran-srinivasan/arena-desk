import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Building2, Plus, Trash2, Edit2, X } from 'lucide-react';
import { Resource, SportType } from '../../types';
import { resourceApi } from '../../api/resourceApi';

export const FacilityConfigurationSection: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  const fetchResources = async () => {
    setIsLoading(true);
    try {
      const data = await resourceApi.getAll();
      setResources(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Delete this facility?')) {
      await resourceApi.delete(id);
      fetchResources();
    }
  };

  return (
    <motion.div className="bg-surface-container rounded-xl overflow-hidden border border-border">
      <div className="p-5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-on-surface">Facility Configuration</h3>
            <p className="text-[10px] text-on-surface-variant">Configure courts, turfs, and resource groups</p>
          </div>
        </div>
        <button
          onClick={() => { setEditingResource(null); setIsModalOpen(true); }}
          className="text-primary text-xs font-bold hover:underline flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>
      <div className="divide-y divide-border">
        {isLoading ? (
          <div className="p-5 text-sm text-on-surface-variant">Loading...</div>
        ) : resources.length === 0 ? (
          <div className="p-5 text-sm text-on-surface-variant">No facilities found.</div>
        ) : (
          resources.map(res => (
            <div key={res.id} className="px-5 py-3 flex items-center justify-between hover:bg-surface-container-high/30 transition-colors">
              <div className="flex flex-col">
                <span className="text-sm text-on-surface font-medium">{res.name}</span>
                <span className="text-xs text-on-surface-variant">{res.type} {res.subType ? `- ${res.subType}` : ''}</span>
              </div>
              <div className="flex items-center gap-4">
                {res.maxCapacity && res.maxCapacity > 1 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-primary/10 text-primary rounded border border-primary/20">
                    Cap: {res.maxCapacity}
                  </span>
                )}
                <span className="text-xs px-2 py-1 bg-surface-container-highest rounded-md">{res.supportedSports.join(', ')}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setEditingResource(res); setIsModalOpen(true); }} className="text-primary hover:text-primary/80">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(res.id)} className="text-error hover:text-error/80">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <ResourceModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        resourceToEdit={editingResource} 
        onSaved={fetchResources} 
      />
    </motion.div>
  );
};

const ResourceModal: React.FC<{ isOpen: boolean; onClose: () => void; resourceToEdit: Resource | null; onSaved: () => void; }> = ({ isOpen, onClose, resourceToEdit, onSaved }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'Court' | 'Turf' | 'Pool'>('Court');
  const [subType, setSubType] = useState('');
  const [sharedGroup, setSharedGroup] = useState('');
  const [sports, setSports] = useState<SportType[]>([]);
  const [maxCapacity, setMaxCapacity] = useState(1);

  useEffect(() => {
    if (isOpen) {
      if (resourceToEdit) {
        setName(resourceToEdit.name);
        setType(resourceToEdit.type);
        setSubType(resourceToEdit.subType || '');
        setSharedGroup(resourceToEdit.sharedGroup || '');
        setSports(resourceToEdit.supportedSports);
        setMaxCapacity(resourceToEdit.maxCapacity || 1);
      } else {
        setName('');
        setType('Court');
        setSubType('');
        setSharedGroup('');
        setSports(['Cricket']);
        setMaxCapacity(1);
      }
    }
  }, [isOpen, resourceToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dto = { name, type, subType, sharedGroup, supportedSports: sports, maxCapacity };
    try {
      if (resourceToEdit) {
        await resourceApi.update(resourceToEdit.id, dto);
      } else {
        await resourceApi.create(dto);
      }
      onSaved();
      onClose();
    } catch (e) {
      console.error(e);
      alert('Failed to save.');
    }
  };

  const toggleSport = (s: SportType) => {
    if (sports.includes(s)) setSports(sports.filter(x => x !== s));
    else setSports([...sports, s]);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="bg-surface-container w-full max-w-sm rounded-2xl relative flex flex-col overflow-hidden border border-border-strong max-h-[90vh]">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-bold">{resourceToEdit ? 'Edit Facility' : 'New Facility'}</h2>
            <button onClick={onClose}><X className="w-5 h-5" /></button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <form id="res-form" onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-on-surface-variant">Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-surface-container-lowest border border-border px-4 py-3 rounded-xl" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-on-surface-variant">Type</label>
                <select value={type} onChange={e => setType(e.target.value as any)} className="w-full bg-surface-container-lowest border border-border px-4 py-3 rounded-xl" required>
                  <option value="Court">Court</option>
                  <option value="Turf">Turf</option>
                  <option value="Pool">Pool</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-on-surface-variant">Sub Type (Optional)</label>
                  <input type="text" value={subType} onChange={e => setSubType(e.target.value)} className="w-full bg-surface-container-lowest border border-border px-4 py-3 rounded-xl" placeholder="e.g. 25m" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-on-surface-variant">Max Capacity</label>
                  <input type="number" min="1" value={maxCapacity} onChange={e => setMaxCapacity(parseInt(e.target.value) || 1)} className="w-full bg-surface-container-lowest border border-border px-4 py-3 rounded-xl" required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-on-surface-variant">Supported Sports</label>
                <div className="flex flex-wrap gap-2">
                  {(['Cricket', 'Pickleball', 'Volleyball', 'Basketball', 'Swimming'] as SportType[]).map(s => (
                    <button
                      key={s} type="button"
                      onClick={() => toggleSport(s)}
                      className={`px-3 py-1.5 rounded-lg text-sm border ${sports.includes(s) ? 'bg-primary/20 border-primary text-primary' : 'border-border text-on-surface-variant hover:bg-surface-container-high'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          </div>
          <div className="px-6 py-4 border-t border-border bg-surface-container-low">
             <button type="submit" form="res-form" className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold disabled:opacity-50" disabled={sports.length === 0}>Save</button>
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
};
