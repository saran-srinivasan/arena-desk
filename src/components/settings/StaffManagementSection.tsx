import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Plus, Trash2, Edit2, X } from 'lucide-react';
import { Staff, UserRole } from '../../types';
import { staffApi } from '../../api/staffApi';

export const StaffManagementSection: React.FC = () => {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  const fetchStaff = async () => {
    setIsLoading(true);
    try {
      const data = await staffApi.getAll();
      setStaffList(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Delete this staff member?')) {
      await staffApi.delete(id);
      fetchStaff();
    }
  };

  return (
    <motion.div className="bg-surface-container rounded-xl overflow-hidden border border-border">
      <div className="p-5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-on-surface">Staff Management</h3>
            <p className="text-[10px] text-on-surface-variant">Manage staff accounts and permissions</p>
          </div>
        </div>
        <button
          onClick={() => { setEditingStaff(null); setIsModalOpen(true); }}
          className="text-primary text-xs font-bold hover:underline flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>
      <div className="divide-y divide-border">
        {isLoading ? (
          <div className="p-5 text-sm text-on-surface-variant">Loading...</div>
        ) : staffList.length === 0 ? (
          <div className="p-5 text-sm text-on-surface-variant">No staff found.</div>
        ) : (
          staffList.map(staff => (
            <div key={staff.id} className="px-5 py-3 flex items-center justify-between hover:bg-surface-container-high/30 transition-colors">
              <div className="flex flex-col">
                <span className="text-sm text-on-surface font-medium">{staff.name}</span>
                <span className="text-xs text-on-surface-variant">{staff.email}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs px-2 py-1 bg-surface-container-highest rounded-md">{staff.role}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setEditingStaff(staff); setIsModalOpen(true); }} className="text-primary hover:text-primary/80">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(staff.id)} className="text-error hover:text-error/80">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <StaffModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        staffToEdit={editingStaff} 
        onSaved={fetchStaff} 
      />
    </motion.div>
  );
};

const StaffModal: React.FC<{ isOpen: boolean; onClose: () => void; staffToEdit: Staff | null; onSaved: () => void; }> = ({ isOpen, onClose, staffToEdit, onSaved }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('Admin');

  useEffect(() => {
    if (isOpen) {
      if (staffToEdit) {
        setName(staffToEdit.name);
        setEmail(staffToEdit.email);
        setPhone(staffToEdit.phone || '');
        setRole(staffToEdit.role);
      } else {
        setName('');
        setEmail('');
        setPhone('');
        setRole('Admin');
      }
    }
  }, [isOpen, staffToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dto = { name, email, phone, role };
    try {
      if (staffToEdit) {
        await staffApi.update(staffToEdit.id, dto);
      } else {
        await staffApi.create(dto);
      }
      onSaved();
      onClose();
    } catch (e) {
      console.error(e);
      alert('Failed to save.');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="bg-surface-container w-full max-w-sm rounded-2xl relative flex flex-col overflow-hidden border border-border-strong">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-bold">{staffToEdit ? 'Edit Staff' : 'New Staff'}</h2>
            <button onClick={onClose}><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-on-surface-variant">Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-surface-container-lowest border border-border px-4 py-3 rounded-xl" required />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-on-surface-variant">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-surface-container-lowest border border-border px-4 py-3 rounded-xl" required />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-on-surface-variant">Phone (Optional)</label>
              <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-surface-container-lowest border border-border px-4 py-3 rounded-xl" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-on-surface-variant">Role</label>
              <select value={role} onChange={e => setRole(e.target.value as UserRole)} className="w-full bg-surface-container-lowest border border-border px-4 py-3 rounded-xl" required>
                <option value="Admin">Admin</option>
                <option value="Super Admin">Super Admin</option>
              </select>
            </div>
            <button type="submit" className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold">Save</button>
          </form>
        </div>
      </div>
    </AnimatePresence>
  );
};
