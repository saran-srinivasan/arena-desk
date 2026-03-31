import React from 'react';
import { motion } from 'motion/react';
import { Camera, RefreshCcw, CheckCircle2, Info, UserPlus, ShieldAlert } from 'lucide-react';
import { cn } from '../lib/utils';
import { useBookings } from '../contexts/BookingContext';
import { useToast } from '../contexts/ToastContext';
import { SportType, Customer } from '../types';
import { useNavigate } from 'react-router-dom';

interface FormState {
  name: string;
  phone: string;
  email: string;
  preferredSport: SportType;
}

export const OnboardingView: React.FC = () => {

  const { addCustomer } = useBookings();
  const { success } = useToast();
  const navigate = useNavigate();
  const [photoCaptured, setPhotoCaptured] = React.useState(false);
  const [photoUrl, setPhotoUrl] = React.useState<string | null>(null);
  const [formState, setFormState] = React.useState<FormState>({
    name: '',
    phone: '',
    email: '',
    preferredSport: 'Cricket',
  });
  const [errors, setErrors] = React.useState<Partial<Record<keyof FormState, string>>>({});
  const [submitted, setSubmitted] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  // Start webcam
  React.useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 600, height: 600 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Camera not available:', err);
    }
  };

  const capturePhoto = () => {
    if (!canvasRef.current || !videoRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = 600;
    canvas.height = 600;
    ctx.drawImage(videoRef.current, 0, 0, 600, 600);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setPhotoUrl(dataUrl);
    setPhotoCaptured(true);
  };

  const retakePhoto = () => {
    setPhotoCaptured(false);
    setPhotoUrl(null);
  };

  const updateField = (field: keyof FormState, value: string) => {
    setFormState(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!formState.name.trim()) newErrors.name = 'Name is required';
    if (!formState.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formState.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) {
      newErrors.email = 'Invalid email format';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const customer: Customer = {
      id: `c-${Date.now()}`,
      name: formState.name,
      phone: formState.phone,
      email: formState.email,
      preferredSport: formState.preferredSport,
      photoUrl: photoUrl || undefined,
      createdAt: new Date().toISOString(),
      totalBookings: 0,
    };
    addCustomer(customer);
    success('Customer Onboarded', `${customer.name} has been added successfully.`);
    setSubmitted(true);

    // Reset after brief display
    setTimeout(() => {
      navigate('/customers');
    }, 1500);
  };

  const sports: SportType[] = ['Cricket', 'Pickleball', 'Volleyball', 'Basketball', 'Swimming'];

  if (submitted) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-primary mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-on-surface">Customer Onboarded!</h2>
          <p className="text-on-surface-variant mt-2">Redirecting to Customers...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-8 lg:p-12 no-scrollbar">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-6xl mx-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Registration Form */}
          <div className="lg:col-span-7 space-y-8">
            <section className="bg-surface-container rounded-xl p-8 border-l-4 border-primary">
              <div className="flex items-center gap-3 mb-8">
                <UserPlus className="text-primary w-6 h-6" />
                <h3 className="text-xl font-bold text-on-surface tracking-tight">Identity & Details</h3>
              </div>

              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant px-1">Full Name</label>
                    <input
                      value={formState.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      className={cn(
                        "w-full bg-surface-container-lowest border-0 border-b-2 focus:ring-0 text-on-surface px-4 py-3 rounded-t-lg transition-colors placeholder:text-on-surface-variant/30",
                        errors.name ? "border-error" : "border-border focus:border-primary"
                      )}
                      placeholder="e.g. Marcus Aurelius"
                    />
                    {errors.name && <p className="text-[10px] text-error font-bold px-1">{errors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant px-1">Phone Number</label>
                    <input
                      value={formState.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      className={cn(
                        "w-full bg-surface-container-lowest border-0 border-b-2 focus:ring-0 text-on-surface px-4 py-3 rounded-t-lg transition-colors placeholder:text-on-surface-variant/30",
                        errors.phone ? "border-error" : "border-border focus:border-primary"
                      )}
                      placeholder="+1 (555) 000-0000"
                    />
                    {errors.phone && <p className="text-[10px] text-error font-bold px-1">{errors.phone}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant px-1">Email Address</label>
                  <input
                    value={formState.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className={cn(
                      "w-full bg-surface-container-lowest border-0 border-b-2 focus:ring-0 text-on-surface px-4 py-3 rounded-t-lg transition-colors placeholder:text-on-surface-variant/30",
                      errors.email ? "border-error" : "border-border focus:border-primary"
                    )}
                    placeholder="customer@domain.com"
                  />
                  {errors.email && <p className="text-[10px] text-error font-bold px-1">{errors.email}</p>}
                </div>

                <div className="space-y-4 pt-4">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant px-1 block">Preferred Sport</label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {sports.map((sport) => (
                      <button
                        key={sport}
                        type="button"
                        onClick={() => updateField('preferredSport', sport)}
                        className={cn(
                          "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all group",
                          formState.preferredSport === sport
                            ? "bg-primary-container/10 border-primary text-primary"
                            : "bg-surface-container-high border-transparent hover:border-border-strong text-on-surface-variant"
                        )}
                      >
                        <span className="text-[11px] font-bold">{sport}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            </section>
          </div>

          {/* Right Column: Photo Capture */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <section className="bg-surface-container rounded-xl overflow-hidden flex flex-col shadow-2xl">
              <div className="p-6 border-b border-border flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Camera className="text-primary w-5 h-5" />
                  <h3 className="font-bold text-on-surface">Live Photo Capture</h3>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-error-container text-error uppercase tracking-tighter">Live Feed</span>
              </div>

              <div className="aspect-square bg-black relative overflow-hidden group">
                {!photoCaptured ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <div className="w-64 h-80 border-2 border-dashed border-primary/50 rounded-[4rem] flex items-center justify-center">
                        <div className="w-full h-full border-2 border-primary rounded-[4rem] animate-pulse opacity-20" />
                      </div>
                      <p className="mt-4 text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">Align face within frame</p>
                    </div>

                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                      <button
                        onClick={capturePhoto}
                        className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-on-primary shadow-lg hover:scale-105 active:scale-95 transition-all"
                      >
                        <Camera className="w-8 h-8 fill-current" />
                      </button>
                    </div>
                  </>
                ) : (
                  <img src={photoUrl || ''} alt="Captured" className="w-full h-full object-cover" />
                )}
              </div>

              <div className="p-6 bg-surface-container-high grid grid-cols-2 gap-4">
                <button
                  onClick={retakePhoto}
                  className="flex items-center justify-center gap-2 py-3 rounded-lg bg-surface-container-highest text-on-surface text-sm font-bold hover:bg-surface-container transition-colors"
                >
                  <RefreshCcw className="w-4 h-4" /> Retake
                </button>
                <button
                  onClick={capturePhoto}
                  disabled={photoCaptured}
                  className={cn(
                    "flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all",
                    photoCaptured
                      ? "bg-primary/30 text-on-primary/50 cursor-not-allowed"
                      : "bg-primary-container text-on-primary hover:brightness-110"
                  )}
                >
                  <CheckCircle2 className="w-4 h-4" /> {photoCaptured ? 'Captured' : 'Use Photo'}
                </button>
              </div>
            </section>

            {photoCaptured && photoUrl && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-surface-container-high/50 backdrop-blur-xl rounded-xl p-6 flex items-center gap-6 border border-border"
              >
                <div className="w-24 h-24 rounded-lg bg-surface-container-lowest border border-border-strong overflow-hidden shrink-0">
                  <img src={photoUrl} alt="Captured" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 space-y-2">
                  <h4 className="text-xs font-black text-on-surface-variant uppercase tracking-widest leading-none">Capture Result</h4>
                  <p className="text-sm text-on-surface font-medium italic">"Image quality: Optimal"</p>
                  <div className="h-1.5 w-full bg-surface-container-lowest rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[92%]" />
                  </div>
                  <p className="text-[10px] text-on-surface-variant">Photo captured successfully</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <footer className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-on-surface-variant" />
            <p className="text-sm text-on-surface-variant">Customer will receive an automated welcome email with login credentials.</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 md:flex-none px-8 py-3 rounded-xl text-on-surface font-bold hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 md:flex-none px-12 py-4 rounded-xl bg-primary text-on-primary font-black text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              Save and Onboard
            </button>
          </div>
        </footer>
      </motion.div>
    </div>
  );
};
