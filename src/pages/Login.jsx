import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Smartphone, ArrowRight, RefreshCw, CheckCircle, PhoneCall } from 'lucide-react';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth, firebaseConfigReady } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { VexLogoFull } from '../components/Logo';

// ── Mobile detection ────────────────────────────────────────────────────────
const isMobileDevice = () => {
  const ua = navigator.userAgent || '';
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) ||
    window.innerWidth < 768
  );
};

// ── Map Firebase phone → our user record ────────────────────────────────────
// Returns a safe user object (no password) or null
const findUserByPhone = async (phone) => {
  const { users } = await import('../data/users');
  // Normalize: strip spaces, dashes; compare last 10 digits
  const digits = (p) => p.replace(/\D/g, '').slice(-10);
  const found = users.find(
    (u) => u.role === 'customer' && digits(u.phone) === digits(phone)
  );
  if (!found) return null;
  const { password: _, ...safeUser } = found;
  return safeUser;
};

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [isMobile, setIsMobile]       = useState(true);
  const [step, setStep]               = useState('phone'); // 'phone' | 'otp' | 'success'
  const [phone, setPhone]             = useState('');
  const [otp, setOtp]                 = useState(['', '', '', '', '', '']);
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [confirmationResult, setConfirmationResult] = useState(null);

  const recaptchaRef  = useRef(null);
  const recaptchaInit = useRef(false);
  const otpInputs     = useRef([]);

  // ── Redirect if already logged in ────────────────────────────────────────
  useEffect(() => {
    if (user) navigate(user.role === 'customer' ? '/' : '/admin');
  }, [user, navigate]);

  // ── Mobile check ─────────────────────────────────────────────────────────
  useEffect(() => {
    setIsMobile(isMobileDevice());
    const handler = () => setIsMobile(isMobileDevice());
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // ── Countdown timer for resend ─────────────────────────────────────────
  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [resendTimer]);

  // ── Init reCAPTCHA (invisible) ────────────────────────────────────────
  const initRecaptcha = () => {
    if (recaptchaInit.current) return;
    recaptchaInit.current = true;
    try {
      recaptchaRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {},
        'expired-callback': () => { recaptchaInit.current = false; },
      });
    } catch (e) {
      console.error('reCAPTCHA init failed', e);
    }
  };

  // ── Send OTP ─────────────────────────────────────────────────────────────
  const handleSendOTP = async () => {
    setError('');
    if (!firebaseConfigReady) {
      setError('OTP login is not configured yet. Please contact support.');
      return;
    }
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    const fullPhone = cleaned.startsWith('91') ? `+${cleaned}` : `+91${cleaned}`;

    setLoading(true);
    try {
      initRecaptcha();
      const result = await signInWithPhoneNumber(auth, fullPhone, recaptchaRef.current);
      setConfirmationResult(result);
      setStep('otp');
      setResendTimer(30);
    } catch (err) {
      console.error(err);
      recaptchaInit.current = false;
      if (err.code === 'auth/invalid-phone-number') {
        setError('Invalid phone number. Use format: 9876543210');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try after some time.');
      } else {
        setError(err.message || 'Failed to send OTP. Check your Firebase config.');
      }
    }
    setLoading(false);
  };

  // ── OTP digit input handler ───────────────────────────────────────────────
  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpInputs.current[index + 1]?.focus();
    if (!value && index > 0) otpInputs.current[index - 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      otpInputs.current[5]?.focus();
    }
  };

  // ── Verify OTP ────────────────────────────────────────────────────────────
  const handleVerifyOTP = async () => {
    setError('');
    const code = otp.join('');
    if (code.length < 6) {
      setError('Enter the complete 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const credential = await confirmationResult.confirm(code);
      const firebasePhone = credential.user.phoneNumber;

      // Map Firebase phone → our user record
      const foundUser = await findUserByPhone(firebasePhone);
      if (foundUser) {
        // Directly set the user in AuthContext
        login(foundUser.email, null, foundUser); // pass pre-verified user
        setStep('success');
        setTimeout(() => navigate('/'), 1500);
      } else {
        // Phone not registered — auto-create guest customer
        const guestUser = {
          id: Date.now(),
          name: `Customer ${firebasePhone.slice(-4)}`,
          email: `${firebasePhone.replace('+', '')}@phone.vexdeals.com`,
          phone: firebasePhone,
          role: 'customer',
          avatar: `https://picsum.photos/seed/${Date.now()}/100/100`,
          joinDate: new Date().toISOString().split('T')[0],
          totalOrders: 0,
          totalSpent: 0,
          status: 'Active',
        };
        login(guestUser.email, null, guestUser);
        setStep('success');
        setTimeout(() => navigate('/'), 1500);
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/invalid-verification-code') {
        setError('Incorrect OTP. Please check and try again.');
      } else if (err.code === 'auth/code-expired') {
        setError('OTP expired. Please request a new one.');
      } else {
        setError('Verification failed. Please try again.');
      }
    }
    setLoading(false);
  };

  // ── Desktop block ─────────────────────────────────────────────────────────
  if (!isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-navy-900 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-24 h-24 bg-accent-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-accent-500/40">
            <Smartphone size={36} className="text-accent-400" />
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-3">Mobile Only</h2>
          <p className="text-primary-200 text-sm leading-relaxed mb-6">
            Customer login is available exclusively on mobile devices.
            Please open this page on your smartphone.
          </p>
          <Link to="/" className="block w-full bg-accent-500 text-primary-900 py-3 rounded-xl font-bold hover:bg-accent-400 transition-colors">
            Back to Home
          </Link>
          <p className="text-primary-400 text-xs mt-4">
            Staff?{' '}
            <Link to="/admin-login" className="text-accent-400 underline font-medium">Admin Portal →</Link>
          </p>
        </div>
      </div>
    );
  }

  // ── Success screen ────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-900 to-primary-800 flex items-center justify-center">
        <div className="text-center px-8">
          <CheckCircle size={64} className="text-emerald-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Logged In!</h2>
          <p className="text-primary-300 text-sm">Taking you to the store…</p>
        </div>
      </div>
    );
  }

  // ── PHONE STEP ────────────────────────────────────────────────────────────
  if (step === 'phone') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-900 to-primary-800 flex flex-col">
        <div className="text-center pt-12 pb-6 px-4">
          <Link to="/" className="inline-block mb-2">
            <VexLogoFull />
          </Link>
          <h1 className="text-xl font-bold text-white mt-4">Welcome Back</h1>
          <p className="text-primary-300 text-sm mt-1">Enter your mobile number to continue</p>
        </div>

        <div className="flex-1 bg-white rounded-t-3xl px-6 pt-8 pb-10">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-5">
              {error}
            </div>
          )}

          <div className="mb-5">
            <label className="block text-sm font-semibold text-primary-800 mb-2">
              Mobile Number
            </label>
            <div className="flex border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-primary-600 transition-colors">
              <div className="flex items-center gap-1 px-3 bg-gray-50 border-r border-gray-200 shrink-0">
                <span className="text-base">🇮🇳</span>
                <span className="text-sm font-semibold text-gray-600">+91</span>
              </div>
              <input
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="9876543210"
                className="flex-1 px-4 py-3 text-lg font-semibold outline-none tracking-widest bg-white"
                autoFocus
              />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">We'll send a 6-digit OTP to verify</p>
          </div>

          <button
            onClick={handleSendOTP}
            disabled={loading || phone.replace(/\D/g, '').length < 10}
            className="w-full bg-primary-700 text-white py-4 rounded-xl font-bold text-base hover:bg-primary-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <RefreshCw size={20} className="animate-spin" />
            ) : (
              <><PhoneCall size={18} /> Get OTP</>
            )}
          </button>

          {/* Invisible reCAPTCHA container */}
          <div id="recaptcha-container" />

          <p className="text-center text-xs text-gray-400 mt-6 leading-relaxed">
            By continuing you agree to VexDeals{' '}
            <a href="#" className="text-primary-600 underline">Terms</a>{' '}
            &amp;{' '}
            <a href="#" className="text-primary-600 underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    );
  }

  // ── OTP STEP ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-900 to-primary-800 flex flex-col">
      <div className="text-center pt-12 pb-6 px-4">
        <Link to="/" className="inline-block mb-2">
          <VexLogoFull />
        </Link>
      </div>

      <div className="flex-1 bg-white rounded-t-3xl px-6 pt-8 pb-10">
        <button
          onClick={() => { setStep('phone'); setOtp(['','','','','','']); setError(''); }}
          className="flex items-center gap-1 text-gray-400 hover:text-gray-600 text-sm mb-6"
        >
          ← Change number
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <PhoneCall size={24} className="text-primary-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Verify OTP</h2>
          <p className="text-gray-500 text-sm mt-1">
            OTP sent to <span className="font-bold text-gray-800">+91 {phone}</span>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-5">
            {error}
          </div>
        )}

        {/* 6-digit OTP boxes */}
        <div className="flex gap-2 justify-center mb-6" onPaste={handleOtpPaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (otpInputs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(i, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Backspace' && !digit && i > 0) {
                  otpInputs.current[i - 1]?.focus();
                }
              }}
              className={`w-11 h-14 text-center text-2xl font-black border-2 rounded-xl outline-none transition-colors ${
                digit ? 'border-primary-600 bg-primary-50 text-primary-800' : 'border-gray-200 text-gray-900'
              } focus:border-primary-600`}
            />
          ))}
        </div>

        <button
          onClick={handleVerifyOTP}
          disabled={loading || otp.join('').length < 6}
          className="w-full bg-primary-700 text-white py-4 rounded-xl font-bold text-base hover:bg-primary-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <RefreshCw size={20} className="animate-spin" />
          ) : (
            <><CheckCircle size={18} /> Verify & Login</>
          )}
        </button>

        {/* Resend OTP */}
        <div className="text-center mt-5">
          {resendTimer > 0 ? (
            <p className="text-sm text-gray-400">
              Resend OTP in <span className="font-bold text-primary-700">{resendTimer}s</span>
            </p>
          ) : (
            <button
              onClick={() => { setOtp(['','','','','','']); setError(''); setStep('phone'); }}
              className="text-sm text-primary-600 font-semibold hover:underline"
            >
              Resend OTP →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
