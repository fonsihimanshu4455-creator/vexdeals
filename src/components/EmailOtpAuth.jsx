import { useEffect, useRef, useState } from 'react';
import { Phone, RefreshCw, ShieldCheck, ArrowLeft } from 'lucide-react';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { phoneAuth, phoneAuthReady } from '../config/firebaseAuth';

// Mobile OTP sign-in/sign-up via Firebase Phone Auth (Google sends the SMS).
// Calls onVerified({ email: '', phone, name }) once verified.
export default function EmailOtpAuth({ onVerified, askName = true, cta = 'Send OTP', compact = false }) {
  const [step, setStep] = useState('input'); // 'input' | 'otp'
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendIn, setResendIn] = useState(0);
  const timerRef = useRef(null);
  const recaptchaElRef = useRef(null);
  const verifierRef = useRef(null);
  const confirmationRef = useRef(null);

  const cleanPhone = phone.replace(/\D/g, '').slice(-10);

  useEffect(() => () => {
    clearInterval(timerRef.current);
    try { verifierRef.current?.clear(); } catch { /* ignore */ }
    verifierRef.current = null;
  }, []);

  const startResendTimer = () => {
    setResendIn(30);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendIn((s) => { if (s <= 1) { clearInterval(timerRef.current); return 0; } return s - 1; });
    }, 1000);
  };

  const mapErr = (err) => {
    const c = String(err?.code || '');
    if (c.includes('invalid-verification-code')) return 'Galat OTP. Dobara try karo.';
    if (c.includes('code-expired')) return 'OTP expire ho gaya. Resend karo.';
    if (c.includes('too-many-requests')) return 'Bahut zyada attempts. Thodi der baad try karo.';
    if (c.includes('invalid-phone-number')) return 'Sahi 10-digit mobile number daalo.';
    if (c.includes('operation-not-allowed')) return 'Phone login Firebase Console me enable nahi hai.';
    if (c.includes('captcha') || c.includes('app-credential')) return 'Verification fail. Page refresh karke dobara karo.';
    if (c.includes('billing-not-enabled')) return 'Firebase billing (Blaze) enable karna padega.';
    return err?.message || 'Kuch galat hua. Dobara try karo.';
  };

  const sendPhoneOtp = async () => {
    if (!phoneAuthReady) throw new Error('Phone OTP abhi setup nahi hua (Firebase auth config missing).');
    if (!verifierRef.current) {
      verifierRef.current = new RecaptchaVerifier(phoneAuth, recaptchaElRef.current, { size: 'invisible' });
    }
    confirmationRef.current = await signInWithPhoneNumber(phoneAuth, `+91${cleanPhone}`, verifierRef.current);
  };

  const sendOtp = async () => {
    setError('');
    if (askName && !name.trim()) { setError('Apna naam daalo.'); return; }
    if (cleanPhone.length !== 10) {
      setError('Sahi 10-digit mobile number daalo.'); return;
    }
    setLoading(true);
    try {
      await sendPhoneOtp();
      setStep('otp');
      startResendTimer();
    } catch (err) {
      try { verifierRef.current?.clear(); } catch { /* ignore */ }
      verifierRef.current = null;
      setError(mapErr(err));
    }
    setLoading(false);
  };

  const verifyOtp = async () => {
    setError('');
    const code = otp.trim();
    if (code.length < 4) { setError('Pura code daalo.'); return; }
    setLoading(true);
    try {
      if (!confirmationRef.current) throw new Error('Pehle OTP bhejo.');
      await confirmationRef.current.confirm(code);
      onVerified({ email: '', phone: cleanPhone, name: name.trim() });
    } catch (err) {
      setError(mapErr(err));
    }
    setLoading(false);
  };

  const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-500';

  return (
    <div className={compact ? '' : 'space-y-4'}>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-2.5 text-sm mb-3">{error}</div>
      )}

      {step === 'input' ? (
        <div className="space-y-3">
          {askName && (
            <input className={inputCls} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
          )}
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-sm text-gray-500 font-medium">+91</span>
            <input className={`${inputCls} pl-12`} type="tel" inputMode="numeric" maxLength={10} placeholder="10-digit mobile number"
              value={cleanPhone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} onKeyDown={(e) => { if (e.key === 'Enter') sendOtp(); }} />
          </div>
          <button onClick={sendOtp} disabled={loading}
            className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? <><RefreshCw size={16} className="animate-spin" /> Sending…</> : <>{cta} <Phone size={16} /></>}
          </button>
          <p className="text-xs text-gray-400 text-center">Mobile pe 6-digit code aayega — password ki zaroorat nahi.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <button onClick={() => { setStep('input'); setOtp(''); setError(''); }} className="text-xs text-gray-500 flex items-center gap-1 hover:text-primary-600">
            <ArrowLeft size={13} /> Change number
          </button>
          <p className="text-sm text-gray-600">Code bheja gaya <b>+91 {cleanPhone}</b> pe. Daalo:</p>
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

      {/* Invisible reCAPTCHA container for Firebase phone auth */}
      <div ref={recaptchaElRef} />
    </div>
  );
}
