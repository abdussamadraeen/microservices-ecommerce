"use client";

import { useState, useEffect } from "react";
import {
  X,
  CreditCard,
  Smartphone,
  Building2,
  Wallet,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Lock,
  ArrowLeft,
} from "lucide-react";

interface DemoPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paymentId: string, method: string) => void;
  amount: number;
  currency?: string;
  merchantName?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

type PaymentStep = "select" | "card" | "upi" | "netbanking" | "wallet" | "processing" | "success" | "failed";

const DemoPaymentModal = ({
  isOpen,
  onClose,
  onSuccess,
  amount,
  currency = "INR",
  merchantName = "Xiaomi India Store",
  customerName = "",
  customerEmail = "",
  customerPhone = "",
}: DemoPaymentModalProps) => {
  const [step, setStep] = useState<PaymentStep>("select");
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState("Initializing safe connection...");
  const [error, setError] = useState<string | null>(null);

  // Card form state
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState(customerName);

  // UPI state
  const [upiId, setUpiId] = useState("");
  const [upiApp, setUpiApp] = useState("");

  // Netbanking state
  const [selectedBank, setSelectedBank] = useState("");

  // Wallet state
  const [selectedWallet, setSelectedWallet] = useState("");
  const [walletPhone, setWalletPhone] = useState(customerPhone);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep("select");
      setSelectedMethod("");
      setProcessingProgress(0);
      setProcessingStatus("Initializing safe connection...");
      setError(null);
      setCardNumber("");
      setCardExpiry("");
      setCardCvv("");
      setUpiId("");
      setSelectedBank("");
      setSelectedWallet("");
    }
  }, [isOpen]);

  // Processing animation
  useEffect(() => {
    if (step === "processing") {
      const messages = [
        "Contacting Bank Gateway...",
        "Verifying Credentials...",
        "Checking Balance & Limits...",
        "Authorizing Transaction...",
        "Encrypting Data Packets...",
        "Finalizing Transfer...",
        "Updating Order Database..."
      ];
      
      const interval = setInterval(() => {
        setProcessingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            // Random success (90% chance) or failure
            const success = Math.random() > 0.1;
            setTimeout(() => {
              if (success) {
                setStep("success");
              } else {
                setStep("failed");
                setError("Payment declined by bank server. Please try again.");
              }
            }, 800);
            return 100;
          }
          // Update status message based on progress
          const msgIndex = Math.floor((prev / 100) * messages.length);
          if (messages[msgIndex]) setProcessingStatus(messages[msgIndex]);
          
          return prev + Math.random() * 8 + 2;
        });
      }, 300);
      return () => clearInterval(interval);
    }
  }, [step]);

  // Handle success
  useEffect(() => {
    if (step === "success") {
      const paymentId = `pay_demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const timer = setTimeout(() => {
        onSuccess(paymentId, selectedMethod);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [step, onSuccess, selectedMethod]);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(" ") : value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  const processPayment = () => {
    setStep("processing");
    setProcessingProgress(0);
  };

  const getCardType = () => {
    const num = cardNumber.replace(/\s/g, "");
    if (num.startsWith("4")) return "visa";
    if (num.startsWith("5")) return "mastercard";
    if (num.startsWith("6")) return "rupay";
    if (num.startsWith("3")) return "amex";
    return "card";
  };

  if (!isOpen) return null;

  const formattedAmount = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
  }).format(amount / 100);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 transition-all duration-500 ease-out font-sans">
      {/* Anime-style Backdrop with Blur */}
      <div 
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl transition-opacity duration-300"
        onClick={step !== "processing" ? onClose : undefined}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900/0 to-slate-900/0" />
      </div>

      {/* Main Modal Container - Cyber/Glass Style */}
      <div className="relative w-full max-w-4xl bg-slate-900/90 border border-slate-700/50 rounded-3xl shadow-[0_0_50px_-12px_rgba(124,58,237,0.5)] overflow-hidden scale-100 transition-all duration-300 flex flex-col md:flex-row h-[80vh] md:h-[600px]">
        
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-fuchsia-600/10 rounded-full blur-3xl -z-10" />
        
        {/* Left Sidebar - Navigation */}
        <div className="w-full md:w-64 bg-slate-950/50 backdrop-blur-md border-b md:border-b-0 md:border-r border-white/5 p-4 flex flex-col gap-2 relative">
          
          {/* Logo/Brand Area */}
          <div className="mb-6 px-2 py-2 flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <div>
              <h2 className="text-white font-bold tracking-wider text-sm">RAZORPAY</h2>
              <p className="text-[10px] text-cyan-400 font-medium tracking-widest">SECURE GATEWAY</p>
            </div>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => { setSelectedMethod("card"); setStep("card"); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${step === "card" ? "bg-white/10 text-white shadow-lg shadow-purple-500/10 border border-white/10" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
            >
              {step === "card" && <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600/20 to-cyan-600/20" />}
              <CreditCard className={`w-5 h-5 relative z-10 transition-transform group-hover:scale-110 ${step === "card" ? "text-cyan-400" : "text-slate-500"}`} />
              <div className="text-left relative z-10">
                <p className="text-sm font-semibold">Credit/Debit Card</p>
              </div>
              {step === "card" && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan-400 rounded-l-full shadow-[0_0_10px_cyan]" />}
            </button>

            <button
              onClick={() => { setSelectedMethod("upi"); setStep("upi"); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${step === "upi" ? "bg-white/10 text-white shadow-lg shadow-purple-500/10 border border-white/10" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
            >
              {step === "upi" && <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600/20 to-cyan-600/20" />}
              <Smartphone className={`w-5 h-5 relative z-10 transition-transform group-hover:scale-110 ${step === "upi" ? "text-fuchsia-400" : "text-slate-500"}`} />
              <div className="text-left relative z-10 flex-1 flex items-center justify-between">
                <p className="text-sm font-semibold">UPI / QR</p>
                <span className="text-[9px] bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-0.5 rounded-full font-bold shadow-sm">HOT</span>
              </div>
              {step === "upi" && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-fuchsia-400 rounded-l-full shadow-[0_0_10px_magenta]" />}
            </button>

            <button
              onClick={() => { setSelectedMethod("netbanking"); setStep("netbanking"); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${step === "netbanking" ? "bg-white/10 text-white shadow-lg shadow-purple-500/10 border border-white/10" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
            >
              {step === "netbanking" && <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600/20 to-cyan-600/20" />}
              <Building2 className={`w-5 h-5 relative z-10 transition-transform group-hover:scale-110 ${step === "netbanking" ? "text-violet-400" : "text-slate-500"}`} />
              <div className="text-left relative z-10">
                <p className="text-sm font-semibold">Netbanking</p>
              </div>
              {step === "netbanking" && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-violet-400 rounded-l-full shadow-[0_0_10px_violet]" />}
            </button>

            <button
              onClick={() => { setSelectedMethod("wallet"); setStep("wallet"); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${step === "wallet" ? "bg-white/10 text-white shadow-lg shadow-purple-500/10 border border-white/10" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
            >
               {step === "wallet" && <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600/20 to-cyan-600/20" />}
              <Wallet className={`w-5 h-5 relative z-10 transition-transform group-hover:scale-110 ${step === "wallet" ? "text-emerald-400" : "text-slate-500"}`} />
              <div className="text-left relative z-10">
                <p className="text-sm font-semibold">Wallets</p>
              </div>
              {step === "wallet" && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-400 rounded-l-full shadow-[0_0_10px_emerald]" />}
            </button>
          </div>
            
             {/* Security Badge Bottom Left */}
             <div className="absolute bottom-4 left-4 right-4 bg-slate-800/50 rounded-lg p-3 border border-white/5">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>100% Secure Payment</span>
                </div>
            </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 bg-slate-900 relative flex flex-col">
            {/* Header Info */}
            <div className="p-6 border-b border-white/5 bg-white/5 backdrop-blur-sm flex justify-between items-center">
                 <div>
                    <h1 className="text-slate-400 text-xs uppercase tracking-wider mb-1">Paying to</h1>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_cyan]"></div>
                        <h2 className="text-white font-bold text-lg">{merchantName}</h2>
                    </div>
                 </div>
                 <div className="text-right">
                    <h1 className="text-slate-400 text-xs uppercase tracking-wider mb-1">Total Amount</h1>
                    <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-blue-200 drop-shadow-lg">{formattedAmount}</p>
                 </div>
            </div>

             {/* Close Button Absolute */}
             {step !== "processing" && (
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white bg-black/20 hover:bg-white/10 rounded-full transition-all"
                >
                    <X className="w-5 h-5" />
                </button>
             )}


          {/* Scrollable Content */}
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
            
            {/* 1. SELECT SCREEN */}
            {step === "select" && (
              <div className="h-full flex flex-col items-center justify-center space-y-6 text-center opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-2 animate-pulse">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/50">
                        <Lock className="w-8 h-8 text-white" />
                    </div>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white mb-2">Select Payment Method</h3>
                    <p className="text-slate-400 max-w-xs mx-auto text-sm">Choose from our wide range of secure payment options to complete your transaction.</p>
                </div>
                <div className="grid grid-cols-4 gap-4 mt-8">
                     {["visa", "mastercard", "rupay", "upi"].map((brand) => (
                        <div key={brand} className="w-12 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">{brand}</span>
                        </div>
                     ))}
                </div>
              </div>
            )}

            {/* 2. CARD PAYMENT */}
            {step === "card" && (
            <div className="space-y-6 animate-[slideUp_0.3s_ease-out]">
              <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-cyan-400" />
                    Card Details
                  </h3>
              </div>
              
                {/* 3D Card Visual */}
                <div className="relative w-full h-48 rounded-2xl bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4c1d95] p-6 text-white shadow-2xl shadow-indigo-900/50 overflow-hidden group transition-all hover:scale-[1.02] duration-300 border border-white/10">
                   {/* Holographic Overlay */}
                   <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                   <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/30 rounded-full blur-3xl group-hover:bg-cyan-400/40 transition-all"></div>
                   <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-fuchsia-500/30 rounded-full blur-3xl group-hover:bg-fuchsia-400/40 transition-all"></div>
                   
                   <div className="relative z-10 flex flex-col justify-between h-full">
                        <div className="flex justify-between items-start">
                            <div className="w-12 h-8 bg-gradient-to-r from-yellow-200 to-yellow-400 rounded flex items-center justify-center shadow-lg">
                                <span className="text-[8px] text-yellow-800 font-bold uppercase tracking-widest">Chip</span>
                            </div>
                            <span className="text-lg font-bold italic tracking-wider opacity-80">{getCardType().toUpperCase()}</span>
                        </div>
                        <div className="space-y-4">
                            <p className="text-2xl font-mono tracking-widest drop-shadow-md">{cardNumber || "#### #### #### ####"}</p>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] text-indigo-200 uppercase tracking-wider mb-1">Card Holder</p>
                                    <p className="font-medium tracking-wide">{cardName || "YOUR NAME"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-indigo-200 uppercase tracking-wider mb-1">Expires</p>
                                    <p className="font-mono">{cardExpiry || "MM/YY"}</p>
                                </div>
                            </div>
                        </div>
                   </div>
                </div>

              <div className="space-y-4">
                  <div className="bg-slate-800/50 p-1 rounded-xl border border-white/10 shadow-inner group focus-within:ring-2 ring-cyan-500/50">
                    <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        placeholder="Card Number"
                        maxLength={19}
                        className="w-full bg-transparent p-3 text-white placeholder-slate-500 outline-none font-mono"
                    />
                  </div>
              
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800/50 p-1 rounded-xl border border-white/10 shadow-inner focus-within:ring-2 ring-cyan-500/50">
                        <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                            placeholder="MM / YY"
                            maxLength={5}
                            className="w-full bg-transparent p-3 text-white placeholder-slate-500 outline-none font-mono text-center"
                        />
                    </div>
                    <div className="bg-slate-800/50 p-1 rounded-xl border border-white/10 shadow-inner focus-within:ring-2 ring-cyan-500/50">
                        <input
                            type="password"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                            placeholder="CVV"
                            maxLength={4}
                            className="w-full bg-transparent p-3 text-white placeholder-slate-500 outline-none font-mono text-center"
                        />
                    </div>
                  </div>

                  <div className="bg-slate-800/50 p-1 rounded-xl border border-white/10 shadow-inner focus-within:ring-2 ring-cyan-500/50">
                        <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value.toUpperCase())}
                        placeholder="Card Holder Name"
                        className="w-full bg-transparent p-3 text-white placeholder-slate-500 outline-none uppercase"
                        />
                  </div>
              </div>

              <div className="flex items-center gap-3 text-sm animate-pulse">
                <div className="relative flex items-center">
                    <input type="checkbox" id="saveCard" className="peer w-5 h-5 appearance-none border border-slate-500 rounded bg-slate-800 checked:bg-cyan-500 checked:border-cyan-500 transition-all" />
                    <CheckCircle2 className="w-3 h-3 text-white absolute top-1 left-1 opacity-0 peer-checked:opacity-100 pointer-events-none" />
                </div>
                <label htmlFor="saveCard" className="text-slate-400 cursor-pointer hover:text-cyan-400 transition-colors">Securely save card for future</label>
              </div>

              <button
                onClick={processPayment}
                disabled={cardNumber.length < 19 || cardExpiry.length < 5 || cardCvv.length < 3}
                className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_-5px_rgba(124,58,237,0.5)] hover:shadow-[0_0_30px_-5px_rgba(124,58,237,0.7)] hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2 group"
              >
                <Lock className="w-4 h-4 group-hover:animate-bounce" />
                <span>PAY {formattedAmount}</span>
              </button>
            </div>
          )}

          {/* 3. UPI PAYMENT */}
          {step === "upi" && (
            <div className="space-y-6 animate-[slideUp_0.3s_ease-out]">
              <div className="flex items-center justify-between mb-2">
                 <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-fuchsia-400" />
                    UPI Payment
                  </h3>
              </div>

              {/* UPI Apps - 3D Buttons */}
              <div className="grid grid-cols-4 gap-4 mb-4">
                {[
                  { id: "gpay", name: "GPay", color: "from-blue-500 to-blue-600", img: "https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" },
                  { id: "phonepe", name: "PhonePe", color: "from-indigo-500 to-purple-600", img: "https://download.logo.wine/logo/PhonePe/PhonePe-Logo.wine.png" },
                  { id: "paytm", name: "Paytm", color: "from-blue-400 to-cyan-500", img: "https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg" },
                  { id: "bhim", name: "BHIM", color: "from-green-500 to-emerald-600", img: "https://upload.wikimedia.org/wikipedia/en/thumb/9/9f/BHIM_UPI_Logo.svg/1200px-BHIM_UPI_Logo.svg.png" },
                ].map((app) => (
                  <button
                    key={app.id}
                    onClick={() => { setUpiApp(app.id); processPayment(); }}
                    className={`p-3 rounded-2xl border transition-all flex flex-col items-center gap-2 group relative overflow-hidden ${upiApp === app.id ? "border-cyan-500 bg-slate-800" : "border-slate-700 bg-slate-800/50 hover:bg-slate-700 hover:border-slate-500"}`}
                  >
                    <div className={`w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform p-1`}>
                      <img src={app.img} alt={app.name} className="w-full h-full object-contain" />
                    </div>
                    <span className="text-[10px] font-medium text-slate-400 group-hover:text-white">{app.name}</span>
                    {/* Hover Glow */}
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                  </button>
                ))}
              </div>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-slate-900 text-slate-500">or enter UPI ID</span>
                </div>
              </div>

              <div>
                <div className="bg-slate-800/50 p-1 rounded-xl border border-white/10 shadow-inner focus-within:ring-2 ring-fuchsia-500/50 flex">
                    <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="username@bank"
                    className="w-full bg-transparent p-3 text-white placeholder-slate-500 outline-none"
                    />
                </div>
                
                <div className="flex gap-2 mt-3 flex-wrap">
                  {["@ybl", "@paytm", "@okicici", "@oksbi"].map((suffix) => (
                    <button
                      key={suffix}
                      onClick={() => setUpiId(upiId.split("@")[0] + suffix)}
                      className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 hover:text-cyan-400 text-slate-400 border border-slate-700 rounded-full transition-all"
                    >
                      {suffix}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={processPayment}
                disabled={!upiId.includes("@")}
                className="w-full mt-4 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-fuchsia-500/30 flex items-center justify-center gap-2"
              >
                 <span>VERIFY & PAY</span>
                 <ArrowLeft className="w-4 h-4 rotate-180" />
              </button>
            </div>
            )}

            {/* 4. NETBANKING */}
            {step === "netbanking" && (
              <div className="space-y-6 animate-[slideUp_0.3s_ease-out]">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-5 h-5 text-violet-400" />
                <h3 className="text-lg font-bold text-white">Select Bank</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: "sbi", name: "SBI", color: "bg-white", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/SBI-logo.svg/1200px-SBI-logo.svg.png" },
                  { id: "hdfc", name: "HDFC", color: "bg-white", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/HDFC_Bank_Logo.svg/2560px-HDFC_Bank_Logo.svg.png" },
                  { id: "icici", name: "ICICI", color: "bg-white", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/ICICI_Bank_Logo.svg/2560px-ICICI_Bank_Logo.svg.png" },
                  { id: "axis", name: "Axis", color: "bg-white", img: "https://download.logo.wine/logo/Axis_Bank/Axis_Bank-Logo.wine.png" },
                ].map((bank) => (
                  <button
                    key={bank.id}
                    onClick={() => setSelectedBank(bank.id)}
                    className={`p-4 rounded-xl border transition-all flex items-center gap-4 group ${selectedBank === bank.id ? "border-violet-500 bg-slate-800" : "border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-slate-500"
                      }`}
                  >
                    <div className={`w-10 h-10 ${bank.color} rounded-lg flex items-center justify-center shadow-lg p-1`}>
                      <img src={bank.img} alt={bank.name} className="w-full h-full object-contain" />
                    </div>
                    <span className="text-sm font-medium text-slate-300 group-hover:text-white">{bank.name}</span>
                    {selectedBank === bank.id && <div className="ml-auto w-2 h-2 bg-violet-500 rounded-full box-shadow-[0_0_10px_violet]" />}
                  </button>
                ))}
              </div>

              <div className="bg-slate-800/50 p-1 rounded-xl border border-white/10 shadow-inner group mt-4">
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full bg-transparent p-3 text-white outline-none border-none cursor-pointer"
                    style={{ backgroundColor: 'transparent' }}
                  >
                    <option value="" className="bg-slate-900 text-slate-400">Select Other Bank</option>
                    <option value="kotak" className="bg-slate-900">Kotak Mahindra Bank</option>
                    <option value="bob" className="bg-slate-900">Bank of Baroda</option>
                    <option value="pnb" className="bg-slate-900">Punjab National Bank</option>
                    <option value="canara" className="bg-slate-900">Canara Bank</option>
                  </select>
              </div>

              <button
                onClick={processPayment}
                disabled={!selectedBank}
                className="w-full mt-6 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-violet-500/30"
              >
                PROCEED SECURELY
              </button>
            </div>
            )}

            {/* 5. WALLET */}
            {step === "wallet" && (
              <div className="space-y-6 animate-[slideUp_0.3s_ease-out]">
               <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Digital Wallets</h3>
              </div>

              <div className="space-y-3">
                {[
                  { id: "paytm", name: "Paytm Wallet", color: "bg-white", img: "https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg" },
                  { id: "phonepe", name: "PhonePe Wallet", color: "bg-white", img: "https://download.logo.wine/logo/PhonePe/PhonePe-Logo.wine.png" },
                  { id: "amazon", name: "Amazon Pay", color: "bg-white", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Amazon_Pay_logo.svg/2560px-Amazon_Pay_logo.svg.png" },
                  { id: "mobikwik", name: "MobiKwik", color: "bg-white", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/MobiKwik_Logo.svg/800px-MobiKwik_Logo.svg.png" },
                ].map((wallet) => (
                  <button
                    key={wallet.id}
                    onClick={() => setSelectedWallet(wallet.id)}
                    className={`w-full flex items-center gap-4 p-4 border rounded-xl transition-all group relative overflow-hidden ${selectedWallet === wallet.id ? "border-emerald-500 bg-slate-800" : "border-slate-700 bg-slate-800/30 hover:bg-slate-800 hover:border-slate-500"
                      }`}
                  >
                    {selectedWallet === wallet.id && <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent" />}
                    <div className={`w-12 h-10 ${wallet.color} rounded-lg flex items-center justify-center shadow-md z-10 p-1`}>
                      <img src={wallet.img} alt={wallet.name} className="w-full h-full object-contain" />
                    </div>
                    <span className="font-medium text-slate-300 group-hover:text-white z-10">{wallet.name}</span>
                    {selectedWallet === wallet.id && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-auto z-10 drop-shadow-[0_0_5px_rgba(16,185,129,0.8)]" />
                    )}
                  </button>
                ))}
              </div>

              {selectedWallet && (
                 <div className="bg-slate-800/50 p-1 rounded-xl border border-white/10 shadow-inner mt-4 animate-in fade-in slide-in-from-bottom-2">
                  <input
                    type="tel"
                    value={walletPhone}
                    onChange={(e) => setWalletPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="Linked Mobile Number"
                    maxLength={10}
                    className="w-full bg-transparent p-3 text-white placeholder-slate-500 outline-none"
                  />
                </div>
              )}

              <button
                onClick={processPayment}
                disabled={!selectedWallet || walletPhone.length < 10}
                className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/30"
              >
                PAY {formattedAmount}
              </button>
            </div>
            )}

            {/* 6. PROCESSING (GOD-LIKE ANIMATION) */}
            {step === "processing" && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-[fadeIn_0.5s_ease-out]">
              <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
                {/* Orbital Rings */}
                <div className="absolute inset-0 border-2 border-cyan-500/30 rounded-full animate-[spin_3s_linear_infinite]"></div>
                <div className="absolute inset-4 border-2 border-fuchsia-500/30 rounded-full animate-[spin_4s_linear_infinite_reverse]"></div>
                <div className="absolute inset-8 border-2 border-violet-500/30 rounded-full animate-[spin_5s_linear_infinite]"></div>
                
                {/* Glowing Core */}
                <div className="absolute inset-0 bg-cyan-500/10 rounded-full blur-xl animate-pulse"></div>
                <Loader2 className="w-12 h-12 text-white animate-spin relative z-10 drop-shadow-[0_0_10px_white]" />
              </div>

              <div className="space-y-3 z-10">
                <h3 className="text-2xl font-bold text-white tracking-widest uppercase">Processing</h3>
                <p className="text-cyan-400 text-sm font-mono animate-pulse">{processingStatus}</p>
              </div>

              {/* Progress Bar */}
              <div className="w-64 h-1 bg-slate-800 rounded-full overflow-hidden relative">
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_1s_infinite] z-20"></div>
                <div
                  className="bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 h-full rounded-full transition-all duration-300 shadow-[0_0_10px_cyan]"
                  style={{ width: `${Math.min(processingProgress, 100)}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mt-8">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                <span>256-BIT ENCRYPTED CHANNEL</span>
              </div>
            </div>
            )}

            {/* 7. SUCCESS */}
            {step === "success" && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-[popIn_0.5s_cubic-bezier(0.175,0.885,0.32,1.275)]">
              <div className="relative">
                 <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full"></div>
                 <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full mx-auto flex items-center justify-center shadow-lg shadow-green-500/50 relative z-10">
                    <CheckCircle2 className="w-12 h-12 text-white drop-shadow-md" />
                 </div>
              </div>
              
              <div>
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 mb-2">PAYMENT SUCCESSFUL</h2>
                <p className="text-slate-400">Transaction completed successfully</p>
              </div>

              <div className="w-full max-w-xs bg-slate-800/50 border border-green-500/20 rounded-xl p-4 flex justify-between items-center backdrop-blur-sm">
                <span className="text-slate-500 text-sm">Ref ID</span>
                <span className="font-mono text-green-400 font-bold">TXN_{Date.now().toString().slice(-6)}</span>
              </div>
              
              <div className="text-sm text-slate-500 animate-pulse">Redirecting you back shortly...</div>
            </div>
          )}

          {/* 8. FAILED */}
          {step === "failed" && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 animate-[shake_0.5s_ease-in-out]">
              <div className="relative">
                 <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full"></div>
                 <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-rose-600 rounded-full mx-auto flex items-center justify-center shadow-lg shadow-red-500/50 relative z-10">
                    <X className="w-12 h-12 text-white drop-shadow-md" />
                 </div>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-red-500 mb-2">PAYMENT FAILED</h2>
                <p className="text-slate-400 max-w-xs mx-auto">{error || "The transaction was declined by your bank."}</p>
              </div>

              <div className="w-full space-y-3">
                <button
                  onClick={() => setStep("select")}
                  className="w-full bg-white text-slate-900 font-bold py-3 rounded-xl hover:scale-105 transition-transform"
                >
                  RETRY PAYMENT
                </button>
                <button
                  onClick={onClose}
                  className="w-full text-slate-500 font-bold py-3 hover:text-white transition-colors"
                >
                  CANCEL
                </button>
              </div>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoPaymentModal;
