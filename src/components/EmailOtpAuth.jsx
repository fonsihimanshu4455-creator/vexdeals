import { useEffect, useRef, useState } from 'react';
import { Mail, RefreshCw, ShieldCheck, ArrowLeft } from 'lucide-react';

// Reusable email-OTP flow (signup + signin). Email → 6-digit code → verify.
// Calls onVerified({ email, name }) once the code checks out.
export default function EmailOtpAuth({ onVerified, askName = true, cta = 'Continue', compact = false }) {
  const [step, setStep] = useState('email');      // 'email' | 'otp'
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendIn, setResendIn] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => () => clearInterval(timerRef.current), []);

  const startResendTimer = () => {
    setResendIn(30);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendIn((s) => { if (s <= 1) { clearInterval(timerRef.current); return 0; } return s - 1; });
    }, 1000);
  };

  const sendOtp = async () => {
    setError('');
    const e = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) { setError('Sahi email daalo.'); return; }
    if (askName && !name.trim()) { setError('Apna naam daalo.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/send-email-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: e }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not send code.');
      setToken(data.token);
      setStep('otp');
      startResendTimer();
    } catch (err) {
      setError(err.message || 'Could not send code.');
    }
    setLoading(false);
  };

  const verifyOtp = async () => {
    setError('');
    const code = otp.trim();
    if (code.length < 4) { setError('Pura code daalo.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/verify-email-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: code, token }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Wrong code.');
      onVerified({ email: email.trim().toLowerCase(), name: name.trim() });
    } catch (err) {
      setError(err.message || 'Verification failed.');
    }
    setLoading(false);
  };

  const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-500';

  return (
    <div className={compact ? '' : 'space-y-4'}>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-2.5 text-sm mb-3">{error}</div>
      )}

      {step === 'email' ? (
        <div className="space-y-3">
          {askName && (
            <input className={inputCls} placeholder="Your name" value={name}
              onChange={(e) => setName(e.target.value)} />
          )}
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className={`${inputCls} pl-10`} type="email" placeholder="Email address" value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') sendOtp(); }} />
          </div>
          <button onClick={sendOtp} disabled={loading}
            className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? <><RefreshCw size={16} className="animate-spin" /> Sending…</> : <>{cta} <Mail size={16} /></>}
          </button>
          <p className="text-xs text-gray-400 text-center">Hum email pe ek 6-digit code bhejenge — password ki zaroorat nahi.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <button onClick={() => { setStep('email'); setOtp(''); setError(''); }}
            className="text-xs text-gray-500 flex items-center gap-1 hover:text-primary-600">
            <ArrowLeft size={13} /> Change email
          </button>
          <p className="text-sm text-gray-600">Code bheja gaya <b>{email}</b> pe. Daalo:</p>
          <input className={`${inputCls} text-center tracking-[10px] text-lg font-bold`} inputMode="numeric"
            maxLength={6} placeholder="------" value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            onKeyDown={(e) => { if (e.key === 'Enter') verifyOtp(); }} autoFocus />
          <button onClick={verifyOtp} disabled={loading}
            className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? <><RefreshCw size={16} className="animate-spin" /> Verifying…</> : <><ShieldCheck size={16} /> Verify & Continue</>}
          </button>
          <div className="text-center">
            {resendIn > 0
              ? <span className="text-xs text-gray-400">Resend code in {resendIn}s</span>
              : <button onClick={sendOtp} disabled={loading} className="text-xs text-primary-600 font-semibold hover:underline">Resend code</button>}
          </div>
        </div>
      )}
    </div>
  );
}
