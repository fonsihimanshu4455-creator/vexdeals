import { useEffect, useRef, useState } from 'react';
import { Mail, Phone, RefreshCw, ShieldCheck, ArrowLeft } from 'lucide-react';

// Reusable OTP auth (signup + signin) over Email or Mobile. Channel tabs let
// the user pick. Calls onVerified({ email, phone, name }) once verified.
export default function EmailOtpAuth({ onVerified, askName = true, cta = 'Send OTP', compact = false, defaultChannel = 'email' }) {
  const [channel, setChannel] = useState(defaultChannel); // 'email' | 'phone'
  const [step, setStep] = useState('input');              // 'input' | 'otp'
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendIn, setResendIn] = useState(0);
  const timerRef = useRef(null);

  const isEmail = channel === 'email';
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);

  useEffect(() => () => clearInterval(timerRef.current), []);

  const startResendTimer = () => {
    setResendIn(30);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendIn((s) => { if (s <= 1) { clearInterval(timerRef.current); return 0; } return s - 1; });
    }, 1000);
  };

  const switchChannel = (c) => { setChannel(c); setStep('input'); setOtp(''); setError(''); };

  const sendOtp = async () => {
    setError('');
    if (askName && !name.trim()) { setError('Apna naam daalo.'); return; }
    if (isEmail) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError('Sahi email daalo.'); return; }
    } else if (cleanPhone.length !== 10) {
      setError('Sahi 10-digit mobile number daalo.'); return;
    }
    setLoading(true);
    try {
      const url = isEmail ? '/api/send-email-otp' : '/api/send-whatsapp-otp';
      const body = isEmail ? { email: email.trim().toLowerCase() } : { phone: cleanPhone };
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok || data.error || (!data.token && !data.success)) throw new Error(data.error || 'Could not send code.');
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
      const url = isEmail ? '/api/verify-email-otp' : '/api/verify-whatsapp-otp';
      const body = isEmail
        ? { email: email.trim().toLowerCase(), otp: code, token }
        : { phone: cleanPhone, otp: code, token };
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Wrong code.');
      onVerified({
        email: isEmail ? email.trim().toLowerCase() : '',
        phone: isEmail ? '' : cleanPhone,
        name: name.trim(),
      });
    } catch (err) {
      setError(err.message || 'Verification failed.');
    }
    setLoading(false);
  };

  const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-500';
  const tabCls = (active) => `flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-colors ${active ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500'}`;

  return (
    <div className={compact ? '' : 'space-y-4'}>
      {/* Channel tabs */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-3">
        <button type="button" onClick={() => switchChannel('email')} className={tabCls(isEmail)}><Mail size={15} /> Email</button>
        <button type="button" onClick={() => switchChannel('phone')} className={tabCls(!isEmail)}><Phone size={15} /> Mobile</button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-2.5 text-sm mb-3">{error}</div>
      )}

      {step === 'input' ? (
        <div className="space-y-3">
          {askName && (
            <input className={inputCls} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
          )}
          {isEmail ? (
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className={`${inputCls} pl-10`} type="email" placeholder="Email address" value={email}
                onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') sendOtp(); }} />
            </div>
          ) : (
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-sm text-gray-500 font-medium">+91</span>
              <input className={`${inputCls} pl-12`} type="tel" inputMode="numeric" maxLength={10} placeholder="10-digit mobile number"
                value={cleanPhone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} onKeyDown={(e) => { if (e.key === 'Enter') sendOtp(); }} />
            </div>
          )}
          <button onClick={sendOtp} disabled={loading}
            className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? <><RefreshCw size={16} className="animate-spin" /> Sending…</> : <>{cta} {isEmail ? <Mail size={16} /> : <Phone size={16} />}</>}
          </button>
          <p className="text-xs text-gray-400 text-center">{isEmail ? 'Email' : 'Mobile'} pe 6-digit code aayega — password ki zaroorat nahi.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <button onClick={() => { setStep('input'); setOtp(''); setError(''); }} className="text-xs text-gray-500 flex items-center gap-1 hover:text-primary-600">
            <ArrowLeft size={13} /> Change {isEmail ? 'email' : 'number'}
          </button>
          <p className="text-sm text-gray-600">Code bheja gaya <b>{isEmail ? email : `+91 ${cleanPhone}`}</b> pe. Daalo:</p>
          <input className={`${inputCls} text-center tracking-[10px] text-lg font-bold`} inputMode="numeric" maxLength={6} placeholder="------"
            value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} onKeyDown={(e) => { if (e.key === 'Enter') verifyOtp(); }} autoFocus />
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
