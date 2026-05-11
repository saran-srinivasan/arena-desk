import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GraduationCap, Plus, Search, Edit3, X, Trash2, Users, Clock,
  Calendar, MapPin, Award, UserCheck, UserX, Check, ChevronDown,
  Activity, BarChart3
} from 'lucide-react';
import { cn } from '../lib/utils';
import { batchApi } from '../api/batchApi';
import { coachApi } from '../api/coachApi';
import { enrollmentApi } from '../api/enrollmentApi';
import { attendanceApi } from '../api/attendanceApi';
import { customerApi } from '../api/customerApi';
import { useBookings } from '../contexts/BookingContext';
import type {
  CoachingBatch, Coach, CoachPerformance, StudentEnrollment, AttendanceRecord,
  Customer, SportType, BatchLevel
} from '../types';

const sportColors: Record<string, string> = {
  Cricket: 'bg-green-500/10 text-green-400 border-green-500/20',
  Pickleball: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  Volleyball: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Swimming: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  Basketball: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
};

const statusColors: Record<string, string> = {
  Active: 'bg-green-500/10 text-green-400 border-green-500/20',
  Upcoming: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Completed: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  Cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
  Inactive: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

const paymentColors: Record<string, string> = {
  Paid: 'bg-green-500/10 text-green-400 border-green-500/20',
  Pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  Overdue: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const attendanceColors: Record<string, string> = {
  Present: 'bg-green-500/10 text-green-400 border-green-500/20',
  Absent: 'bg-red-500/10 text-red-400 border-red-500/20',
  Late: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  Excused: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

type TabType = 'batches' | 'coaches' | 'enrollments' | 'attendance';

export const CoachingView: React.FC = () => {
  const { resources } = useBookings();
  const [tab, setTab] = React.useState<TabType>('batches');
  const [batches, setBatches] = React.useState<CoachingBatch[]>([]);
  const [coaches, setCoaches] = React.useState<Coach[]>([]);
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [enrollments, setEnrollments] = React.useState<StudentEnrollment[]>([]);
  const [attendanceRecords, setAttendanceRecords] = React.useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Selections
  const [selectedBatchId, setSelectedBatchId] = React.useState('');
  const [selectedDate, setSelectedDate] = React.useState(new Date().toISOString().slice(0, 10));

  // Modals
  const [showBatchModal, setShowBatchModal] = React.useState(false);
  const [editingBatch, setEditingBatch] = React.useState<CoachingBatch | null>(null);
  const [showCoachModal, setShowCoachModal] = React.useState(false);
  const [editingCoach, setEditingCoach] = React.useState<Coach | null>(null);
  const [showEnrollModal, setShowEnrollModal] = React.useState(false);
  const [coachPerformance, setCoachPerformance] = React.useState<CoachPerformance | null>(null);

  // Batch form
  const [batchForm, setBatchForm] = React.useState({
    name: '', sport: 'Swimming' as SportType, coachId: '', resourceId: '',
    scheduleDays: [] as string[], startTime: '06:00', endTime: '07:00',
    startDate: '', endDate: '', maxStudents: 15, level: 'All' as BatchLevel,
    fee: 0, notes: '',
  });

  // Coach form
  const [coachForm, setCoachForm] = React.useState({
    name: '', phone: '', email: '', sportSpecializations: [] as SportType[],
  });

  // Enroll form
  const [enrollStudentId, setEnrollStudentId] = React.useState('');

  // Attendance working state
  const [attendanceMarks, setAttendanceMarks] = React.useState<Record<string, string>>({});

  React.useEffect(() => { loadData(); }, []);

  React.useEffect(() => {
    if (selectedBatchId && tab === 'enrollments') loadEnrollments();
  }, [selectedBatchId, tab]);

  React.useEffect(() => {
    if (selectedBatchId && selectedDate && tab === 'attendance') loadAttendance();
  }, [selectedBatchId, selectedDate, tab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [b, c, cust] = await Promise.all([batchApi.getAll(), coachApi.getAll(), customerApi.getAll()]);
      setBatches(b); setCoaches(c); setCustomers(cust);
      if (b.length > 0 && !selectedBatchId) setSelectedBatchId(b[0].id);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const loadEnrollments = async () => {
    try { const e = await enrollmentApi.getByBatch(selectedBatchId); setEnrollments(e); }
    catch (err) { console.error(err); }
  };

  const loadAttendance = async () => {
    try {
      const a = await attendanceApi.getByBatchAndDate(selectedBatchId, selectedDate);
      setAttendanceRecords(a);
      const marks: Record<string, string> = {};
      a.forEach(r => { marks[r.enrollmentId] = r.status; });
      setAttendanceMarks(marks);
    } catch (err) { console.error(err); }
  };

  // Batch CRUD
  const openCreateBatch = () => {
    setEditingBatch(null);
    setBatchForm({ name: '', sport: 'Swimming', coachId: '', resourceId: '', scheduleDays: [], startTime: '06:00', endTime: '07:00', startDate: '', endDate: '', maxStudents: 15, level: 'All', fee: 0, notes: '' });
    setShowBatchModal(true);
  };

  const openEditBatch = (b: CoachingBatch) => {
    setEditingBatch(b);
    setBatchForm({
      name: b.name, sport: b.sport, coachId: b.coachId, resourceId: b.resourceId,
      scheduleDays: b.scheduleDays, startTime: b.startTime.slice(0, 5), endTime: b.endTime.slice(0, 5),
      startDate: b.startDate, endDate: b.endDate, maxStudents: b.maxStudents, level: b.level,
      fee: b.fee, notes: b.notes || '',
    });
    setShowBatchModal(true);
  };

  const saveBatch = async () => {
    try {
      if (editingBatch) await batchApi.update(editingBatch.id, batchForm);
      else await batchApi.create(batchForm);
      setShowBatchModal(false); loadData();
    } catch (err) { console.error(err); }
  };

  const deleteBatch = async (id: string) => {
    try { await batchApi.delete(id); loadData(); } catch (err) { console.error(err); }
  };

  // Coach CRUD
  const openCreateCoach = () => {
    setEditingCoach(null);
    setCoachForm({ name: '', phone: '', email: '', sportSpecializations: [] });
    setShowCoachModal(true);
  };

  const openEditCoach = (c: Coach) => {
    setEditingCoach(c);
    setCoachForm({ name: c.name, phone: c.phone, email: c.email, sportSpecializations: c.sportSpecializations });
    setShowCoachModal(true);
  };

  const saveCoach = async () => {
    try {
      if (editingCoach) await coachApi.update(editingCoach.id, coachForm);
      else await coachApi.create(coachForm);
      setShowCoachModal(false); loadData();
    } catch (err) { console.error(err); }
  };

  const viewPerformance = async (id: string) => {
    try { const p = await coachApi.getPerformance(id); setCoachPerformance(p); }
    catch (err) { console.error(err); }
  };

  // Enrollment
  const enrollStudent = async () => {
    if (!enrollStudentId || !selectedBatchId) return;
    try {
      await enrollmentApi.create({ studentId: enrollStudentId, batchId: selectedBatchId });
      setEnrollStudentId(''); setShowEnrollModal(false); loadEnrollments(); loadData();
    } catch (err) { console.error(err); }
  };

  const dropStudent = async (id: string) => {
    try { await enrollmentApi.drop(id); loadEnrollments(); loadData(); }
    catch (err) { console.error(err); }
  };

  // Attendance
  const toggleAttendance = (enrollmentId: string, status: string) => {
    setAttendanceMarks(prev => ({ ...prev, [enrollmentId]: prev[enrollmentId] === status ? 'Absent' : status }));
  };

  const saveAttendance = async () => {
    try {
      const records = Object.entries(attendanceMarks).map(([enrollmentId, status]) => ({
        enrollmentId, status: status as any,
      }));
      await attendanceApi.bulkMark({ batchId: selectedBatchId, date: selectedDate, markedBy: 'Alex Rivera', records });
      loadAttendance();
    } catch (err) { console.error(err); }
  };

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const sports: SportType[] = ['Cricket', 'Pickleball', 'Volleyball', 'Swimming', 'Basketball'];
  const levels: BatchLevel[] = ['Beginner', 'Intermediate', 'Advanced', 'All'];

  const tabs: { id: TabType; label: string }[] = [
    { id: 'batches', label: 'Batches' },
    { id: 'coaches', label: 'Coaches' },
    { id: 'enrollments', label: 'Enrollments' },
    { id: 'attendance', label: 'Attendance' },
  ];

  const selectedBatch = batches.find(b => b.id === selectedBatchId);

  return (
    <div className="flex-1 overflow-y-auto p-8 no-scrollbar space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-on-surface tracking-tight">Coaching</h2>
            <p className="text-xs text-on-surface-variant font-medium uppercase tracking-widest">
              {batches.length} batches · {coaches.length} coaches
            </p>
          </div>
        </div>
        <button
          onClick={tab === 'coaches' ? openCreateCoach : tab === 'enrollments' ? () => setShowEnrollModal(true) : openCreateBatch}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-bold hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" />
          {tab === 'coaches' ? 'Add Coach' : tab === 'enrollments' ? 'Enroll Student' : 'New Batch'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-container-high rounded-xl p-1">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn("flex-1 py-2.5 rounded-lg text-sm font-bold transition-all", tab === t.id ? "bg-primary text-on-primary shadow" : "text-on-surface-variant hover:text-on-surface")}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Batches Tab */}
      {tab === 'batches' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {batches.map((batch, i) => (
            <motion.div key={batch.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-surface-container rounded-xl p-5 border border-border hover:border-primary/20 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-sm font-bold text-on-surface">{batch.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-lg border", sportColors[batch.sport])}>{batch.sport}</span>
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-lg border", statusColors[batch.status])}>{batch.status}</span>
                    {batch.level !== 'All' && <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-primary/10 text-primary border border-primary/20">{batch.level}</span>}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEditBatch(batch)} className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant"><Edit3 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => deleteBatch(batch.id)} className="p-1.5 rounded-lg hover:bg-error/10 text-error"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>

              <div className="space-y-2 text-xs text-on-surface-variant">
                <div className="flex items-center gap-2"><Award className="w-3.5 h-3.5 text-primary" /><span className="text-on-surface font-medium">{batch.coachName}</span></div>
                <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /><span>{batch.resourceName}</span></div>
                <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /><span>{batch.startTime?.slice(0,5)} – {batch.endTime?.slice(0,5)}</span></div>
                <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /><span>{batch.scheduleDays?.join(', ')}</span></div>
              </div>

              <div className="mt-4 pt-3 border-t border-border">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-on-surface-variant">Students</span>
                  <span className="font-bold text-on-surface">{batch.enrolledCount ?? 0}/{batch.maxStudents}</span>
                </div>
                <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min(((batch.enrolledCount ?? 0) / batch.maxStudents), 100)}%` }} />
                </div>
                <div className="flex justify-between mt-2 text-[10px] text-on-surface-variant">
                  <span>₹{(batch.fee).toLocaleString()}</span>
                  <span>{batch.startDate} → {batch.endDate}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Coaches Tab */}
      {tab === 'coaches' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {coaches.map((coach, i) => {
            const coachBatches = batches.filter(b => b.coachId === coach.id);
            const activeCount = coachBatches.filter(b => b.status === 'Active').length;
            const totalStudents = coachBatches.reduce((s, b) => s + (b.enrolledCount ?? 0), 0);
            return (
              <motion.div key={coach.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-surface-container rounded-xl p-5 border border-border hover:border-primary/20 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg ring-2 ring-primary/20">
                    {coach.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-on-surface truncate">{coach.name}</h4>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditCoach(coach)} className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant"><Edit3 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => viewPerformance(coach.id)} className="p-1.5 rounded-lg hover:bg-primary/10 text-primary"><BarChart3 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {coach.sportSpecializations.map(s => (
                        <span key={s} className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border", sportColors[s])}>{s}</span>
                      ))}
                    </div>
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-lg border mt-1 inline-block", statusColors[coach.status])}>{coach.status}</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-border grid grid-cols-3 gap-2 text-center">
                  <div><div className="text-lg font-black text-on-surface">{coachBatches.length}</div><div className="text-[9px] text-on-surface-variant uppercase">Batches</div></div>
                  <div><div className="text-lg font-black text-primary">{activeCount}</div><div className="text-[9px] text-on-surface-variant uppercase">Active</div></div>
                  <div><div className="text-lg font-black text-on-surface">{totalStudents}</div><div className="text-[9px] text-on-surface-variant uppercase">Students</div></div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Enrollments Tab */}
      {tab === 'enrollments' && (
        <div className="space-y-4">
          <select value={selectedBatchId} onChange={e => setSelectedBatchId(e.target.value)}
            className="bg-surface-container-low border border-border rounded-xl px-4 py-2.5 text-sm text-on-surface focus:border-primary focus:ring-0 w-full max-w-md">
            {batches.map(b => <option key={b.id} value={b.id}>{b.name} — {b.coachName}</option>)}
          </select>

          {selectedBatch && (
            <div className="bg-surface-container-high/50 rounded-xl p-4 border border-border flex items-center gap-4 text-xs">
              <span className={cn("font-bold px-2 py-0.5 rounded-lg border", sportColors[selectedBatch.sport])}>{selectedBatch.sport}</span>
              <span className="text-on-surface-variant">{selectedBatch.scheduleDays?.join(', ')} · {selectedBatch.startTime?.slice(0,5)}–{selectedBatch.endTime?.slice(0,5)}</span>
              <span className="text-on-surface font-bold ml-auto">{selectedBatch.enrolledCount ?? 0}/{selectedBatch.maxStudents} enrolled</span>
            </div>
          )}

          <div className="space-y-2">
            {enrollments.map((enr, i) => (
              <motion.div key={enr.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-surface-container rounded-xl p-4 border border-border flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                    {enr.studentName?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-on-surface">{enr.studentName}</h5>
                    <span className="text-[10px] text-on-surface-variant">Enrolled {enr.enrollmentDate}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-lg border", paymentColors[enr.paymentStatus])}>{enr.paymentStatus}</span>
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-lg border", statusColors[enr.status] || statusColors.Active)}>{enr.status}</span>
                  {enr.status === 'Active' && (
                    <button onClick={() => dropStudent(enr.id)} className="p-1.5 rounded-lg hover:bg-error/10 text-on-surface-variant hover:text-error transition-colors" title="Drop student">
                      <UserX className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
            {enrollments.length === 0 && (
              <div className="text-center py-12 text-on-surface-variant/30">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-10" />
                <p className="text-sm italic">No students enrolled in this batch.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Attendance Tab */}
      {tab === 'attendance' && (
        <div className="space-y-4">
          <div className="flex gap-4">
            <select value={selectedBatchId} onChange={e => setSelectedBatchId(e.target.value)}
              className="bg-surface-container-low border border-border rounded-xl px-4 py-2.5 text-sm text-on-surface focus:border-primary focus:ring-0 flex-1 max-w-md">
              {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
              className="bg-surface-container-low border border-border rounded-xl px-4 py-2.5 text-sm text-on-surface focus:border-primary focus:ring-0" />
            <button onClick={saveAttendance}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-bold hover:brightness-110 active:scale-95 transition-all">
              <Check className="w-4 h-4" /> Save
            </button>
          </div>

          <div className="space-y-2">
            {enrollments.filter(e => e.status === 'Active').map((enr, i) => {
              const mark = attendanceMarks[enr.id] || 'Absent';
              return (
                <motion.div key={enr.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-surface-container rounded-xl p-4 border border-border flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                      {enr.studentName?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <span className="text-sm font-bold text-on-surface">{enr.studentName}</span>
                  </div>
                  <div className="flex gap-2">
                    {(['Present', 'Absent', 'Late', 'Excused'] as const).map(status => (
                      <button key={status} onClick={() => toggleAttendance(enr.id, status)}
                        className={cn(
                          "text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all",
                          mark === status ? attendanceColors[status] + ' ring-1 ring-offset-1 ring-offset-surface-container' : 'text-on-surface-variant border-border hover:border-border-strong'
                        )}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </motion.div>
              );
            })}
            {enrollments.filter(e => e.status === 'Active').length === 0 && (
              <div className="text-center py-12 text-on-surface-variant/30">
                <UserCheck className="w-12 h-12 mx-auto mb-3 opacity-10" />
                <p className="text-sm italic">No active students to mark attendance for.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Batch Modal */}
      <AnimatePresence>
        {showBatchModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200]" onClick={() => setShowBatchModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-surface-container rounded-2xl p-8 w-full max-w-2xl shadow-2xl border border-border max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-on-surface mb-6">{editingBatch ? 'Edit Batch' : 'Create Batch'}</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Batch Name</label>
                    <input value={batchForm.name} onChange={e => setBatchForm(p => ({ ...p, name: e.target.value }))}
                      className="w-full mt-1 bg-surface-container-lowest border border-border rounded-lg px-4 py-2.5 text-sm text-on-surface focus:border-primary focus:ring-0" placeholder="e.g. Swimming Beginners A" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Sport</label>
                    <select value={batchForm.sport} onChange={e => setBatchForm(p => ({ ...p, sport: e.target.value as SportType }))}
                      className="w-full mt-1 bg-surface-container-lowest border border-border rounded-lg px-4 py-2.5 text-sm text-on-surface focus:border-primary focus:ring-0">
                      {sports.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Coach</label>
                    <select value={batchForm.coachId} onChange={e => setBatchForm(p => ({ ...p, coachId: e.target.value }))}
                      className="w-full mt-1 bg-surface-container-lowest border border-border rounded-lg px-4 py-2.5 text-sm text-on-surface focus:border-primary focus:ring-0">
                      <option value="">Select coach...</option>
                      {coaches.filter(c => c.status === 'Active').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Resource</label>
                    <select value={batchForm.resourceId} onChange={e => setBatchForm(p => ({ ...p, resourceId: e.target.value }))}
                      className="w-full mt-1 bg-surface-container-lowest border border-border rounded-lg px-4 py-2.5 text-sm text-on-surface focus:border-primary focus:ring-0">
                      <option value="">Select resource...</option>
                      {resources.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-2">Schedule Days</label>
                  <div className="flex gap-2">
                    {days.map(d => (
                      <button key={d} type="button" onClick={() => setBatchForm(p => ({
                        ...p, scheduleDays: p.scheduleDays.includes(d) ? p.scheduleDays.filter(x => x !== d) : [...p.scheduleDays, d]
                      }))} className={cn("px-3 py-1.5 rounded-lg text-xs font-bold border transition-all",
                        batchForm.scheduleDays.includes(d) ? "bg-primary/10 text-primary border-primary/30" : "text-on-surface-variant border-border")}>{d}</button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Start Time</label>
                    <input type="time" value={batchForm.startTime} onChange={e => setBatchForm(p => ({ ...p, startTime: e.target.value }))}
                      className="w-full mt-1 bg-surface-container-lowest border border-border rounded-lg px-4 py-2.5 text-sm text-on-surface focus:border-primary focus:ring-0" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">End Time</label>
                    <input type="time" value={batchForm.endTime} onChange={e => setBatchForm(p => ({ ...p, endTime: e.target.value }))}
                      className="w-full mt-1 bg-surface-container-lowest border border-border rounded-lg px-4 py-2.5 text-sm text-on-surface focus:border-primary focus:ring-0" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Start Date</label>
                    <input type="date" value={batchForm.startDate} onChange={e => setBatchForm(p => ({ ...p, startDate: e.target.value }))}
                      className="w-full mt-1 bg-surface-container-lowest border border-border rounded-lg px-4 py-2.5 text-sm text-on-surface focus:border-primary focus:ring-0" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">End Date</label>
                    <input type="date" value={batchForm.endDate} onChange={e => setBatchForm(p => ({ ...p, endDate: e.target.value }))}
                      className="w-full mt-1 bg-surface-container-lowest border border-border rounded-lg px-4 py-2.5 text-sm text-on-surface focus:border-primary focus:ring-0" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Max Students</label>
                    <input type="number" value={batchForm.maxStudents} onChange={e => setBatchForm(p => ({ ...p, maxStudents: parseInt(e.target.value) || 15 }))}
                      className="w-full mt-1 bg-surface-container-lowest border border-border rounded-lg px-4 py-2.5 text-sm text-on-surface focus:border-primary focus:ring-0" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Level</label>
                    <select value={batchForm.level} onChange={e => setBatchForm(p => ({ ...p, level: e.target.value as BatchLevel }))}
                      className="w-full mt-1 bg-surface-container-lowest border border-border rounded-lg px-4 py-2.5 text-sm text-on-surface focus:border-primary focus:ring-0">
                      {levels.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Fee (₹)</label>
                    <input type="number" value={batchForm.fee} onChange={e => setBatchForm(p => ({ ...p, fee: (parseFloat(e.target.value) || 0) }))}
                      className="w-full mt-1 bg-surface-container-lowest border border-border rounded-lg px-4 py-2.5 text-sm text-on-surface focus:border-primary focus:ring-0" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowBatchModal(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-on-surface hover:bg-surface-container-high transition-colors">Cancel</button>
                <button onClick={saveBatch} className="px-6 py-2.5 rounded-xl text-sm font-bold bg-primary text-on-primary hover:brightness-110 active:scale-95 transition-all">
                  {editingBatch ? 'Update' : 'Create'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Coach Modal */}
      <AnimatePresence>
        {showCoachModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200]" onClick={() => setShowCoachModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-surface-container rounded-2xl p-8 w-full max-w-lg shadow-2xl border border-border" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-on-surface mb-6">{editingCoach ? 'Edit Coach' : 'Add Coach'}</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Full Name</label>
                  <input value={coachForm.name} onChange={e => setCoachForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full mt-1 bg-surface-container-lowest border border-border rounded-lg px-4 py-2.5 text-sm text-on-surface focus:border-primary focus:ring-0" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Phone</label>
                    <input value={coachForm.phone} onChange={e => setCoachForm(p => ({ ...p, phone: e.target.value }))}
                      className="w-full mt-1 bg-surface-container-lowest border border-border rounded-lg px-4 py-2.5 text-sm text-on-surface focus:border-primary focus:ring-0" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Email</label>
                    <input value={coachForm.email} onChange={e => setCoachForm(p => ({ ...p, email: e.target.value }))}
                      className="w-full mt-1 bg-surface-container-lowest border border-border rounded-lg px-4 py-2.5 text-sm text-on-surface focus:border-primary focus:ring-0" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-2">Sport Specializations</label>
                  <div className="flex flex-wrap gap-2">
                    {sports.map(s => (
                      <button key={s} type="button" onClick={() => setCoachForm(p => ({
                        ...p, sportSpecializations: p.sportSpecializations.includes(s) ? p.sportSpecializations.filter(x => x !== s) : [...p.sportSpecializations, s]
                      }))} className={cn("text-xs font-bold px-3 py-1.5 rounded-lg border transition-all",
                        coachForm.sportSpecializations.includes(s) ? sportColors[s] : "text-on-surface-variant border-border")}>{s}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowCoachModal(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-on-surface hover:bg-surface-container-high transition-colors">Cancel</button>
                <button onClick={saveCoach} className="px-6 py-2.5 rounded-xl text-sm font-bold bg-primary text-on-primary hover:brightness-110 active:scale-95 transition-all">
                  {editingCoach ? 'Update' : 'Add'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enroll Student Modal */}
      <AnimatePresence>
        {showEnrollModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200]" onClick={() => setShowEnrollModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-surface-container rounded-2xl p-8 w-full max-w-lg shadow-2xl border border-border" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-on-surface mb-6">Enroll Student</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Batch</label>
                  <select value={selectedBatchId} onChange={e => setSelectedBatchId(e.target.value)}
                    className="w-full mt-1 bg-surface-container-lowest border border-border rounded-lg px-4 py-2.5 text-sm text-on-surface focus:border-primary focus:ring-0">
                    {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Student</label>
                  <select value={enrollStudentId} onChange={e => setEnrollStudentId(e.target.value)}
                    className="w-full mt-1 bg-surface-container-lowest border border-border rounded-lg px-4 py-2.5 text-sm text-on-surface focus:border-primary focus:ring-0">
                    <option value="">Select student...</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowEnrollModal(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-on-surface hover:bg-surface-container-high transition-colors">Cancel</button>
                <button onClick={enrollStudent} disabled={!enrollStudentId}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold bg-primary text-on-primary hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed">Enroll</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Performance Modal */}
      <AnimatePresence>
        {coachPerformance && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200]" onClick={() => setCoachPerformance(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-surface-container rounded-2xl p-8 w-full max-w-md shadow-2xl border border-border" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-on-surface mb-2">{coachPerformance.coach.name}</h3>
              <p className="text-xs text-on-surface-variant mb-6">Coach Performance Summary</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container-high rounded-xl p-4 text-center">
                  <div className="text-2xl font-black text-on-surface">{coachPerformance.totalBatches}</div>
                  <div className="text-[10px] text-on-surface-variant uppercase tracking-wider mt-1">Total Batches</div>
                </div>
                <div className="bg-surface-container-high rounded-xl p-4 text-center">
                  <div className="text-2xl font-black text-primary">{coachPerformance.activeBatches}</div>
                  <div className="text-[10px] text-on-surface-variant uppercase tracking-wider mt-1">Active Batches</div>
                </div>
                <div className="bg-surface-container-high rounded-xl p-4 text-center">
                  <div className="text-2xl font-black text-on-surface">{coachPerformance.totalStudents}</div>
                  <div className="text-[10px] text-on-surface-variant uppercase tracking-wider mt-1">Total Students</div>
                </div>
                <div className="bg-surface-container-high rounded-xl p-4 text-center">
                  <div className="text-2xl font-black" style={{ color: coachPerformance.averageAttendancePercent >= 75 ? 'var(--primary)' : coachPerformance.averageAttendancePercent >= 50 ? 'var(--tertiary)' : 'var(--error)' }}>
                    {coachPerformance.averageAttendancePercent}%
                  </div>
                  <div className="text-[10px] text-on-surface-variant uppercase tracking-wider mt-1">Avg Attendance</div>
                </div>
              </div>
              <button onClick={() => setCoachPerformance(null)} className="w-full mt-6 px-5 py-2.5 rounded-xl text-sm font-bold bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors">Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
