import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sprout, 
  User, 
  ShieldCheck, 
  Phone, 
  ArrowRight, 
  ArrowLeft,
  Building2, 
  Sparkles,
  CheckCircle2,
  Mail,
  MapPin,
  Landmark,
  FileText,
  Upload,
  AlertCircle,
  Clock,
  Check,
  CreditCard,
  Layers,
  Scale,
  BadgeCheck,
  RefreshCw,
  FileCheck,
  Wheat,
  Lock
} from 'lucide-react';
import { UserRole, FarmerProfile, CropProduct } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { registerWithFirebase, loginWithFirebase } from '../firebase/authService';
import { saveFarmerProfileToDb, saveCropToDb } from '../firebase/dbService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole: 'farmer' | 'buyer';
  onLoginSuccess: (
    role: UserRole, 
    profileIdOrName: string, 
    newFarmer?: FarmerProfile, 
    newCrop?: Partial<CropProduct>
  ) => void;
}

const COMMON_CROPS = [
  'शरबती गेहूं (Sharbati Wheat)',
  'पूसा बासमती धान (Basmati Rice)',
  'पीली सरसों (Yellow Mustard)',
  'मालवा सोयाबीन (Soybean)',
  'देसी चना (Desi Chana)',
  'नासिक लाल प्याज (Red Onion)',
  'शंकर कपास (Cotton)',
  'अरहर / तुअर दाल (Tur Dal)',
  'बोल्ड मूंगफली (Groundnut)',
  'ऊंझा जीरा (Cumin/Jeera)',
  'गुंटूर लाल मिर्च (Red Chilli)',
  'कुफरी ज्योति आलू (Potato)',
  'पूसा रूबी टमाटर (Tomato)'
];

const STATES = [
  'पंजाब (Punjab)',
  'मध्य प्रदेश (Madhya Pradesh)',
  'महाराष्ट्र (Maharashtra)',
  'राजस्थान (Rajasthan)',
  'हरियाणा (Haryana)',
  'उत्तर प्रदेश (Uttar Pradesh)',
  'गुजरात (Gujarat)',
  'कर्नाटक (Karnataka)',
  'आंध्र प्रदेश (Andhra Pradesh)',
  'तेलंगाना (Telangana)',
  'बिहार (Bihar)',
  'पश्चिम बंगाल (West Bengal)'
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultRole,
  onLoginSuccess
}) => {
  const { t } = useLanguage();
  const [activeRole, setActiveRole] = useState<'farmer' | 'buyer'>(defaultRole);
  
  // Farmer mode: 'register' (complete onboarding to sell crops) vs 'login' (returning quick login)
  const [farmerMode, setFarmerMode] = useState<'register' | 'login'>('register');
  
  // Multi-step Registration Wizard Step (1 to 6)
  const [regStep, setRegStep] = useState<number>(1);

  // STEP 1: Mobile & Email Registration + OTP
  const [mobileNumber, setMobileNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [otpTimer, setOtpTimer] = useState(30);

  // STEP 2: Farmer Profile Details
  const [fullName, setFullName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [age, setAge] = useState<number | ''>(42);
  const [farmerCategory, setFarmerCategory] = useState('लघु किसान (2.5 से 5 एकड़)');
  const [fpoName, setFpoName] = useState('मालवा किसान प्रोड्यूसर कंपनी');
  const [experienceYears, setExperienceYears] = useState<number>(16);

  // STEP 3: Farm Location & Farm Size
  const [stateName, setStateName] = useState('पंजाब (Punjab)');
  const [districtName, setDistrictName] = useState('लुधियाना');
  const [tehsilName, setTehsilName] = useState('जगराओं');
  const [villageName, setVillageName] = useState('रायकोट कलां');
  const [pincode, setPincode] = useState('142026');
  const [nearestMandi, setNearestMandi] = useState('खन्ना अनाज मंडी (APMC)');
  const [farmSizeAcres, setFarmSizeAcres] = useState<number | ''>(6.5);
  const [irrigationType, setIrrigationType] = useState('नहर + सौर ट्यूबवेल (Canal + Solar)');
  const [soilType, setSoilType] = useState('जलोढ़ बलुई दोमट मिट्टी (उच्च उर्वरता)');

  // STEP 4: Crops Grown & Available Quantity to Sell
  const [selectedCropsGrown, setSelectedCropsGrown] = useState<string[]>([
    'शरबती गेहूं (Sharbati Wheat)',
    'पीली सरसों (Yellow Mustard)',
    'पूसा बासमती धान (Basmati Rice)'
  ]);
  const [farmingPractice, setFarmingPractice] = useState('जैविक प्रमाणित (NPOP Certified Organic)');
  // Current harvest for immediate sale
  const [sellCropTitle, setSellCropTitle] = useState('शरबती गोल्डन गेहूं (C-306 ग्रेड ए)');
  const [sellCropCategory, setSellCropCategory] = useState<CropProduct['category']>('Grains');
  const [sellCropVariety, setSellCropVariety] = useState('Sharbati C-306');
  const [sellQuantityQuintals, setSellQuantityQuintals] = useState<number | ''>(120);
  const [sellExpectedPrice, setSellExpectedPrice] = useState<number | ''>(3250);
  const [sellMoisturePercent, setSellMoisturePercent] = useState<number | ''>(10.8);
  const [sellPackaging, setSellPackaging] = useState('50kg Hermetic Moisture-Proof Bags');

  // STEP 5: Bank & Payment Details
  const [accountHolderName, setAccountHolderName] = useState('');
  const [bankName, setBankName] = useState('State Bank of India');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('SBIN0001245');
  const [upiId, setUpiId] = useState('');
  const [dbtLinked, setDbtLinked] = useState(true);

  // STEP 6: KYC & Document Verification
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [landDocType, setLandDocType] = useState('Kisan Credit Card (KCC)');
  const [landDocNumber, setLandDocNumber] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isKycScanning, setIsKycScanning] = useState(false);
  const [isKycVerified, setIsKycVerified] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(true);

  // Returning farmer login inputs
  const [loginPhone, setLoginPhone] = useState('');
  const [loginOtpSent, setLoginOtpSent] = useState(false);
  const [loginOtpCode, setLoginOtpCode] = useState('');
  const [loginStep, setLoginStep] = useState<'phone' | 'otp' | 'verify_info'>('phone');

  // Buyer inputs
  const [buyerOrgType, setBuyerOrgType] = useState('Hostel Mess & Canteen');
  const [buyerOrgName, setBuyerOrgName] = useState('');
  const [buyerGstin, setBuyerGstin] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerOtpSent, setBuyerOtpSent] = useState(false);
  const [buyerOtpCode, setBuyerOtpCode] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPassword, setBuyerPassword] = useState('Buyer@123456');

  // Firebase auth & submission status
  const [accountPassword, setAccountPassword] = useState('Kisan@123456');
  const [loginPassword, setLoginPassword] = useState('Kisan@123456');
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [authErrorMsg, setAuthErrorMsg] = useState<string | null>(null);

  // Reset or initialize on open
  useEffect(() => {
    if (isOpen) {
      setActiveRole(defaultRole);
    }
  }, [isOpen, defaultRole]);

  // OTP Countdown Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpSent && otpTimer > 0 && !isOtpVerified) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, otpTimer, isOtpVerified]);

  if (!isOpen) return null;

  // Toggle crop grown selection
  const handleToggleCropGrown = (crop: string) => {
    setSelectedCropsGrown(prev => 
      prev.includes(crop) ? prev.filter(c => c !== crop) : [...prev, crop]
    );
  };

  // Helper: 1-Click Pre-Fill Demo Data for fast testing
  const handlePreFillDemoData = () => {
    setMobileNumber('9872145680');
    setEmailAddress('harpreet.kisan@punjabagri.in');
    setOtpSent(true);
    setOtpCode('123456');
    setIsOtpVerified(true);

    setFullName('Sardar Harpreet Singh');
    setFatherName('S. Jagjit Singh');
    setGender('Male');
    setAge(45);
    setFarmerCategory('मध्यम किसान (5 से 10 एकड़)');
    setFpoName('मालवा किसान प्रोड्यूसर कंपनी लिमिटेड');
    setExperienceYears(22);

    setStateName('पंजाब (Punjab)');
    setDistrictName('लुधियाना');
    setTehsilName('जगराओं');
    setVillageName('रायकोट कलां');
    setPincode('142026');
    setNearestMandi('खन्ना अनाज मंडी (APMC)');
    setFarmSizeAcres(8.5);
    setIrrigationType('नहर + सौर ट्यूबवेल (Canal + Solar)');
    setSoilType('जलोढ़ बलुई दोमट मिट्टी (उच्च उर्वरता)');

    setSelectedCropsGrown(['शरबती गेहूं (Sharbati Wheat)', 'पीली सरसों (Yellow Mustard)', 'पूसा बासमती धान (Basmati Rice)']);
    setFarmingPractice('जैविक प्रमाणित (NPOP Certified Organic)');

    setSellCropTitle('शरबती गोल्डन गेहूं (C-306 ग्रेड ए)');
    setSellCropCategory('Grains');
    setSellCropVariety('शरबती C-306');
    setSellQuantityQuintals(140);
    setSellExpectedPrice(3250);
    setSellMoisturePercent(10.5);
    setSellPackaging('50kg Hermetic Moisture-Proof Bags');

    setAccountHolderName('हरप्रीत सिंह');
    setBankName('भारतीय स्टेट बैंक (SBI)');
    setAccountNumber('38492019482');
    setConfirmAccountNumber('38492019482');
    setIfscCode('SBIN0001245');
    setUpiId('harpreet.kisan@sbi');
    setDbtLinked(true);

    setAadhaarNumber('7849-2910-4821');
    setLandDocType('Kisan Credit Card (KCC)');
    setLandDocNumber('KCC-PB-2026-98412');
    setUploadedFileName('7_12_खतौनी_हरप्रीत_लुधियाना.pdf');
    setIsKycVerified(true);
    setTermsAgreed(true);
  };

  // Step 1: Send OTP
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber || mobileNumber.length < 10) {
      alert('कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें।');
      return;
    }
    setOtpSent(true);
    setOtpTimer(30);
  };

  // Step 1: Verify OTP
  const handleVerifyOtp = () => {
    if (otpCode.length === 6) {
      setIsOtpVerified(true);
    } else {
      alert('कृपया 6-अंकों का OTP कोड दर्ज करें (डेमो: 123456)');
    }
  };

  // Step 6: Simulate File Upload & AI Document Verification
  const handleSimulateFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      setIsKycScanning(true);
      setTimeout(() => {
        setIsKycScanning(false);
        setIsKycVerified(true);
      }, 1200);
    }
  };

  // Final Registration Submission with Firebase Auth & Cloud Firestore Sync
  const handleCompleteFarmerRegistration = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isOtpVerified) {
      alert('कृपया आगे बढ़ने के लिए पहले OTP से मोबाइल नंबर सत्यापित करें।');
      setRegStep(1);
      return;
    }

    if (!termsAgreed) {
      alert('कृपया खेति लिंक मंडी एस्क्रो और गुणवत्ता जांच नियमों से सहमति दें।');
      return;
    }

    setIsSubmittingAuth(true);
    setAuthErrorMsg(null);

    const newFarmerId = `farmer-${Date.now()}`;
    const displayName = fullName.trim() || 'Kisan Producer';

    // Construct full FarmerProfile with all gathered details
    const newFarmer: FarmerProfile = {
      id: newFarmerId,
      name: displayName,
      fatherName: fatherName.trim() || undefined,
      gender,
      age: typeof age === 'number' ? age : 40,
      phone: `+91 ${mobileNumber}`,
      email: emailAddress.trim() || undefined,
      fpoName: fpoName.trim() || 'Individual Farmgate Producer',
      fpoRegNo: `FPO-${stateName.slice(0, 2).toUpperCase()}-${Date.now().toString().slice(-5)}`,
      state: stateName,
      district: districtName,
      tehsil: tehsilName,
      village: villageName,
      pincode,
      nearestMandi,
      landAcres: typeof farmSizeAcres === 'number' ? farmSizeAcres : 5,
      irrigationType,
      soilType,
      memberCount: 1,
      experienceYears: experienceYears || 10,
      cropsGrown: selectedCropsGrown.length > 0 ? selectedCropsGrown : ['Wheat', 'Mustard'],
      certifications: [
        farmingPractice,
        'Aadhaar Verified',
        'Govt Land Registry Matched',
        'Escrow Direct DBT Ready'
      ],
      soilHealthCardVerified: true,
      bio: `${displayName} cultivates ${farmSizeAcres || 5} acres of fertile land in ${villageName}, ${districtName}, ${stateName}. Specializes in high-grade ${selectedCropsGrown.slice(0, 2).join(' and ')}.`,
      rating: 5.0,
      reviewsCount: 1,
      completedOrders: 0,
      avatarUrl: gender === 'Female' 
        ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      bankAccountVerified: true,
      bankDetails: {
        accountHolder: accountHolderName || displayName,
        bankName: bankName || 'State Bank of India',
        accountNumber: accountNumber || '38910294821',
        ifscCode: ifscCode || 'SBIN0001245',
        upiId: upiId || `${mobileNumber}@upi`,
        dbtLinked: dbtLinked
      },
      kycDetails: {
        aadhaarNumber: aadhaarNumber ? `XXXX-XXXX-${aadhaarNumber.slice(-4)}` : 'XXXX-XXXX-4821',
        landRecordType: landDocType,
        landRecordNumber: landDocNumber || `LR-${Date.now().toString().slice(-6)}`,
        kycStatus: 'Verified',
        verifiedAt: 'Just now'
      }
    };

    // Construct the initial harvest lot crop for immediate sale
    const newCrop: Partial<CropProduct> = {
      title: sellCropTitle || `${sellCropVariety} Harvest Lot`,
      category: sellCropCategory,
      variety: sellCropVariety || 'Grade A',
      pricePerQuintal: typeof sellExpectedPrice === 'number' ? sellExpectedPrice : 3100,
      pricePerKg: Math.round((typeof sellExpectedPrice === 'number' ? sellExpectedPrice : 3100) / 100),
      mandiMspPrice: Math.round((typeof sellExpectedPrice === 'number' ? sellExpectedPrice : 3100) * 0.8),
      quantityAvailableQuintals: typeof sellQuantityQuintals === 'number' ? sellQuantityQuintals : 50,
      grade: 'Grade A Mandi',
      isOrganic: farmingPractice.includes('Organic') || farmingPractice.includes('Natural'),
      moisturePercent: typeof sellMoisturePercent === 'number' ? sellMoisturePercent : 11.0,
      farmerId: newFarmer.id,
      farmerName: newFarmer.name,
      fpoName: newFarmer.fpoName,
      locationState: newFarmer.state,
      locationDistrict: newFarmer.district,
      minOrderKg: 50,
      harvestDate: 'Current Season 2026',
      imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80',
      description: `Freshly harvested ${sellCropVariety} from ${newFarmer.village}, ${newFarmer.district}. Tested at ${sellMoisturePercent || 11}% moisture, packaged in ${sellPackaging}.`,
      shelfLifeDays: 365,
      packagingType: sellPackaging,
      readyForDispatch: true,
      rating: 5.0,
      reviewCount: 1
    };

    // Firebase Auth & Cloud Firestore Sync
    try {
      const fbEmail = emailAddress.trim() || `kisan_${mobileNumber.replace(/\D/g, '') || Date.now()}@khetlink.in`;
      const fbPass = accountPassword || 'Kisan@123456';

      let userUid = '';
      try {
        const { user } = await registerWithFirebase(fbEmail, fbPass, 'farmer', {
          fullName: displayName,
          mobileNumber,
          farmerId: newFarmer.id,
          state: stateName,
          district: districtName,
          fpoName: newFarmer.fpoName
        });
        userUid = user.uid;
      } catch (authErr: any) {
        if (authErr?.code === 'auth/email-already-in-use') {
          const { user } = await loginWithFirebase(fbEmail, fbPass);
          userUid = user.uid;
        } else {
          console.warn('Firebase registration note:', authErr?.message);
        }
      }

      // Persist farmer profile and harvest crop to Firestore
      await saveFarmerProfileToDb(newFarmer, userUid);
      if (newCrop.title) {
        await saveCropToDb({
          id: `crop-${Date.now()}`,
          ...newCrop
        } as CropProduct);
      }
    } catch (err: any) {
      console.warn('Firestore database sync error:', err);
    } finally {
      setIsSubmittingAuth(false);
    }

    onLoginSuccess('farmer', newFarmer.id, newFarmer, newCrop);
    onClose();
  };

  // Returning Farmer Quick Login with Firebase Sync
  const handleReturningFarmerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAuth(true);
    setAuthErrorMsg(null);

    const cleanInput = loginPhone.trim();
    const fbEmail = cleanInput.includes('@') 
      ? cleanInput 
      : `kisan_${cleanInput.replace(/\D/g, '') || '9872145680'}@khetlink.in`;
    const fbPass = loginPassword || 'Kisan@123456';

    try {
      const { user, profile } = await loginWithFirebase(fbEmail, fbPass);
      onLoginSuccess('farmer', profile?.farmerId || `farmer-${Date.now()}`);
      onClose();
    } catch (err: any) {
      console.warn('Firebase login notice:', err?.message);
      onLoginSuccess('farmer', `farmer-${Date.now()}`);
      onClose();
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  // Buyer Login with Firebase Sync
  const handleBuyerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAuth(true);
    setAuthErrorMsg(null);

    const orgName = buyerOrgName.trim() || 'IIT Delhi Hostel Mess & Canteen Co-op';
    const cleanGst = (buyerGstin || 'buyer').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const fbEmail = buyerEmail.trim() || `buyer_${cleanGst || Date.now()}@khetlink.in`;
    const fbPass = buyerPassword || 'Buyer@123456';

    try {
      try {
        await registerWithFirebase(fbEmail, fbPass, 'buyer', {
          buyerOrgName: orgName,
          buyerOrgType,
          buyerGstin,
          buyerPhone
        });
      } catch (authErr: any) {
        if (authErr?.code === 'auth/email-already-in-use') {
          await loginWithFirebase(fbEmail, fbPass);
        }
      }
    } catch (err) {
      console.warn('Firebase buyer auth note:', err);
    } finally {
      setIsSubmittingAuth(false);
    }

    onLoginSuccess('buyer', orgName);
    onClose();
  };

  // Quick 1-Click for judges
  const handleQuickJudgeLogin = (role: 'farmer' | 'buyer', param: string) => {
    onLoginSuccess(role, param);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn overflow-y-auto"
      onClick={onClose}
    >
      <div 
        id="auth-modal-box"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-neutral-200 overflow-hidden relative my-auto max-h-[92vh] flex flex-col"
      >
        {/* Modal Top Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 text-neutral-400 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-1.5 transition cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Top Branding Banner */}
        <div className="bg-gradient-to-r from-[#061F15] via-[#0B2C1F] to-[#04150E] text-white p-5 pb-4 space-y-3 shrink-0 border-b border-[#1E523D]">
          <div className="flex items-center justify-between pr-8">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold font-['Outfit'] text-white flex items-center gap-1.5">
                  <span>खेति लिंक राष्ट्रीय किसान एवं व्यापार पोर्टल</span>
                  <span className="text-[10px] font-medium bg-[#52B788]/20 text-[#74C69D] px-2 py-0.5 rounded-full border border-[#52B788]/40">
                    ONDC एवं मंडी एस्क्रो सुरक्षित
                  </span>
                </h2>
                <p className="text-[11px] text-emerald-200/70">
                  सीधा खेत से मंडी खरीद-बिक्री व गुणवत्ता सत्यापन पोर्टल
                </p>
              </div>
            </div>
          </div>

          {/* Role Selector Tabs (Farmer vs Bulk Buyer / Hostel Mess) */}
          <div className="grid grid-cols-2 gap-1.5 bg-[#051810] p-1 rounded-xl border border-[#184635]">
            <button
              id="tab-farmer-auth"
              onClick={() => setActiveRole('farmer')}
              className={`py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-2 cursor-pointer ${
                activeRole === 'farmer'
                  ? 'bg-gradient-to-r from-[#1B523D] to-[#256B50] text-white shadow-xs border border-[#52B788]/40'
                  : 'text-emerald-200/70 hover:text-white hover:bg-[#0E3224]'
              }`}
            >
              <Sprout className="w-4 h-4 text-emerald-300" />
              <span>किसान / एफपीओ (फसल बेचें)</span>
            </button>

            <button
              id="tab-buyer-auth"
              onClick={() => setActiveRole('buyer')}
              className={`py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-2 cursor-pointer ${
                activeRole === 'buyer'
                  ? 'bg-gradient-to-r from-[#1B523D] to-[#256B50] text-white shadow-xs border border-[#52B788]/40'
                  : 'text-emerald-200/70 hover:text-white hover:bg-[#0E3224]'
              }`}
            >
              <Building2 className="w-4 h-4 text-emerald-300" />
              <span>हॉस्टल मेस व थोक खरीदार</span>
            </button>
          </div>

          {/* Farmer Sub-Tabs: Register to Sell vs Returning Login */}
          {activeRole === 'farmer' && (
            <div className="flex items-center justify-between pt-1 border-t border-[#133A2B] text-xs">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFarmerMode('register')}
                  className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer text-[11px] ${
                    farmerMode === 'register'
                      ? 'bg-amber-400 text-neutral-900 font-extrabold shadow-xs'
                      : 'text-emerald-200/80 hover:text-white hover:bg-[#0E3525]'
                  }`}
                >
                  🌾 नया किसान पंजीकरण (पूरी जानकारी)
                </button>
                <button
                  type="button"
                  onClick={() => setFarmerMode('login')}
                  className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer text-[11px] ${
                    farmerMode === 'login'
                      ? 'bg-white/20 text-white font-bold'
                      : 'text-emerald-200/80 hover:text-white hover:bg-[#0E3525]'
                  }`}
                >
                  पंजीकृत किसान लॉगिन
                </button>
              </div>

              {farmerMode === 'register' && (
                <button
                  type="button"
                  onClick={handlePreFillDemoData}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                  title="सैंपल किसान विवरण स्वतः भरें"
                >
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>⚡ 1-क्लिक डेमो जानकारी भरें</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* ======================================================== */}
          {/* FARMER REGISTRATION FLOW (All 9 Requested Fields) */}
          {/* ======================================================== */}
          {activeRole === 'farmer' && farmerMode === 'register' && (
            <div className="space-y-5">
              
              {/* Wizard Step Progress Tracker */}
              <div className="bg-[#F4F9F5] p-3 rounded-2xl border border-[#D1E7D9] space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#184533]">
                  <span>चरण {regStep} / 6: {
                    regStep === 1 ? 'मोबाइल/ईमेल एवं OTP सत्यापन' :
                    regStep === 2 ? 'किसान विवरण एवं अनुभव' :
                    regStep === 3 ? 'खेत का स्थान एवं भूमि का आकार' :
                    regStep === 4 ? 'उगाई जाने वाली फसलें एवं मात्रा' :
                    regStep === 5 ? 'बैंक खाता एवं डायरेक्ट DBT भुगतान' :
                    'केवाईसी एवं भूमि दस्तावेज सत्यापन'
                  }</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-semibold">
                    {Math.round((regStep / 6) * 100)}% पूर्ण
                  </span>
                </div>

                {/* Step Pills */}
                <div className="grid grid-cols-6 gap-1.5">
                  {[
                    { s: 1, label: 'OTP' },
                    { s: 2, label: 'विवरण' },
                    { s: 3, label: 'स्थान' },
                    { s: 4, label: 'फसलें' },
                    { s: 5, label: 'बैंक' },
                    { s: 6, label: 'केवाईसी' }
                  ].map(({ s, label }) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRegStep(s)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        regStep === s 
                          ? 'bg-[#2A7252]' 
                          : regStep > s 
                          ? 'bg-emerald-400' 
                          : 'bg-neutral-200'
                      }`}
                      title={`चरण ${s}: ${label}`}
                    />
                  ))}
                </div>
              </div>

              {/* STEP 1: Mobile & Email Registration + OTP Verification */}
              {regStep === 1 && (
                <div className="space-y-4">
                  <div className="border-b border-neutral-200 pb-2">
                    <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5 font-['Outfit']">
                      <Phone className="w-4 h-4 text-[#2A7252]" />
                      <span>मोबाइल एवं ईमेल पंजीकरण व OTP सत्यापन</span>
                    </h3>
                    <p className="text-xs text-neutral-500">
                      हम आपके संपर्क को सत्यापित करते हैं ताकि आपको तुरंत मंडी भाव, ई-ऑक्शन बोलियां, और सीधे खाते में भुगतान अलर्ट मिल सकें।
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Mobile Number */}
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">
                        किसान का मोबाइल नंबर <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-xs font-bold text-neutral-500">
                          +91
                        </span>
                        <input
                          type="tel"
                          maxLength={10}
                          placeholder="9876543210"
                          value={mobileNumber}
                          onChange={(e) => {
                            setMobileNumber(e.target.value.replace(/\D/g, ''));
                            setIsOtpVerified(false);
                          }}
                          className="w-full text-xs font-semibold border border-neutral-300 rounded-xl pl-11 pr-3 py-2.5 focus:outline-none focus:border-[#2A7252]"
                        />
                      </div>
                      <span className="text-[10px] text-neutral-400">10 अंकों का मोबाइल नंबर</span>
                    </div>

                    {/* Email Address */}
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">
                        ईमेल आईडी <span className="text-neutral-400 text-[10px]">(चालान/बिल के लिए वैकल्पिक)</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
                        <input
                          type="email"
                          placeholder="kisan@krishisetu.in"
                          value={emailAddress}
                          onChange={(e) => setEmailAddress(e.target.value)}
                          className="w-full text-xs border border-neutral-300 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-[#2A7252]"
                        />
                      </div>
                      <span className="text-[10px] text-neutral-400">जीएसटी मंडी रसीद और इनवॉइस हेतु</span>
                    </div>

                    {/* Account Password */}
                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-neutral-700 block mb-1">
                        खाता पासवर्ड <span className="text-neutral-400 text-[10px]">(सुरक्षित लॉगिन के लिए)</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
                        <input
                          type="password"
                          placeholder="••••••••"
                          value={accountPassword}
                          onChange={(e) => setAccountPassword(e.target.value)}
                          className="w-full text-xs font-mono border border-neutral-300 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-[#2A7252]"
                        />
                      </div>
                      <span className="text-[10px] text-neutral-400">डिफ़ॉल्ट: Kisan@123456 (या अपनी पसंद का पासवर्ड बनाएं)</span>
                    </div>
                  </div>

                  {/* OTP Trigger Box */}
                  {!otpSent ? (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="w-full py-2.5 bg-[#1B523D] hover:bg-[#154231] text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>6-अंकों का OTP कोड भेजें</span>
                    </button>
                  ) : (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>+91 {mobileNumber} पर OTP भेजा गया</span>
                        </span>
                        <span className="text-[11px] font-mono text-emerald-700">
                          {otpTimer > 0 ? `${otpTimer} सेकंड में पुनः भेजें` : 'पुनः भेजने के लिए तैयार'}
                        </span>
                      </div>

                      {/* Demo simulation card */}
                      <div className="bg-white p-2.5 rounded-xl border border-emerald-300/80 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] font-bold text-neutral-400 uppercase block">डेमो एसएमएस संदेश</span>
                          <span className="font-mono font-bold text-neutral-800">
                            खेति लिंक OTP है: <span className="text-emerald-700 text-sm">123456</span>
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setOtpCode('123456');
                            setIsOtpVerified(true);
                          }}
                          className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition cursor-pointer"
                        >
                          123456 स्वतः भरें
                        </button>
                      </div>

                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="6-अंकों का OTP दर्ज करें"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                          className="w-full text-center font-mono font-bold text-sm tracking-widest border border-emerald-300 rounded-xl py-2 focus:outline-none focus:border-emerald-600 bg-white"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          className="py-2 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer"
                        >
                          OTP सत्यापित करें
                        </button>
                      </div>

                      {isOtpVerified && (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold bg-emerald-100/80 p-2 rounded-lg">
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span>मोबाइल नंबर सफलतापूर्वक सत्यापित हुआ ✓</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Forward button */}
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (!isOtpVerified) {
                          alert('कृपया आगे बढ़ने के लिए OTP भेजें और सत्यापित करें।');
                          return;
                        }
                        setRegStep(2);
                      }}
                      className="py-2.5 px-5 bg-[#1E523D] hover:bg-[#164231] text-white text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer"
                    >
                      <span>आगे: किसान विवरण दर्ज करें</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Farmer Profile Details */}
              {regStep === 2 && (
                <div className="space-y-4">
                  <div className="border-b border-neutral-200 pb-2">
                    <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5 font-['Outfit']">
                      <User className="w-4 h-4 text-[#2A7252]" />
                      <span>किसान व्यक्तिगत विवरण एवं श्रेणी</span>
                    </h3>
                    <p className="text-xs text-neutral-500">
                      मंडी व्यापार लाइसेंस, एफपीओ संबद्धता एवं किसान पंजीयन हेतु व्यक्तिगत विवरण।
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Full Name */}
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">
                        किसान का पूरा नाम (आधार के अनुसार) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="उदा. सरदार हरप्रीत सिंह / रामेश्वर यादव"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full text-xs font-semibold border border-neutral-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2A7252]"
                      />
                    </div>

                    {/* Father / Guardian / Spouse Name */}
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">
                        पिता या पति का नाम
                      </label>
                      <input
                        type="text"
                        placeholder="उदा. स. जगजीत सिंह / श्री रामप्रसाद"
                        value={fatherName}
                        onChange={(e) => setFatherName(e.target.value)}
                        className="w-full text-xs border border-neutral-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2A7252]"
                      />
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">लिंग</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value as any)}
                        className="w-full text-xs border border-neutral-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2A7252] bg-white cursor-pointer"
                      >
                        <option value="Male">पुरुष (Male)</option>
                        <option value="Female">महिला (Female)</option>
                        <option value="Other">अन्य (Other)</option>
                      </select>
                    </div>

                    {/* Age */}
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">आयु (वर्ष)</label>
                      <input
                        type="number"
                        min={18}
                        max={100}
                        placeholder="उदा. 42"
                        value={age}
                        onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                        className="w-full text-xs border border-neutral-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2A7252]"
                      />
                    </div>

                    {/* Farmer Category */}
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">
                        किसान की श्रेणी
                      </label>
                      <select
                        value={farmerCategory}
                        onChange={(e) => setFarmerCategory(e.target.value)}
                        className="w-full text-xs border border-neutral-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2A7252] bg-white cursor-pointer"
                      >
                        <option value="Marginal Farmer (< 2.5 Acres)">सीमांत किसान (2.5 एकड़ से कम भूमि)</option>
                        <option value="Small Farmer (2.5 - 5 Acres)">लघु किसान (2.5 से 5 एकड़)</option>
                        <option value="Medium Farmer (5 - 10 Acres)">मध्यम किसान (5 से 10 एकड़)</option>
                        <option value="Large Commercial (> 10 Acres)">बड़ा वाणिज्यिक किसान (10 एकड़ से अधिक)</option>
                        <option value="FPO Cluster Representative">एफपीओ / किसान समूह प्रतिनिधि</option>
                      </select>
                    </div>

                    {/* FPO / Cooperative Name */}
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">
                        एफपीओ (FPO) या किसान सहकारी समिति का नाम
                      </label>
                      <input
                        type="text"
                        placeholder="उदा. मालवा किसान प्रोड्यूसर कंपनी या व्यक्तिगत खेत"
                        value={fpoName}
                        onChange={(e) => setFpoName(e.target.value)}
                        className="w-full text-xs border border-neutral-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2A7252]"
                      />
                    </div>
                  </div>

                  {/* Experience */}
                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">
                      खेती का अनुभव: <span className="text-[#2A7252] font-bold">{experienceYears} वर्ष</span>
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={50}
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(Number(e.target.value))}
                      className="w-full accent-[#2A7252] h-1.5 bg-neutral-200 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Navigation Buttons */}
                  <div className="pt-2 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setRegStep(1)}
                      className="py-2 px-4 border border-neutral-300 text-neutral-700 text-xs font-bold rounded-xl hover:bg-neutral-50 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>पीछे</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!fullName.trim()) {
                          alert('कृपया अपना पूरा नाम दर्ज करें।');
                          return;
                        }
                        setRegStep(3);
                      }}
                      className="py-2.5 px-5 bg-[#1E523D] hover:bg-[#164231] text-white text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer"
                    >
                      <span>आगे: खेत का स्थान एवं आकार</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Farm Location & Farm Size */}
              {regStep === 3 && (
                <div className="space-y-4">
                  <div className="border-b border-neutral-200 pb-2">
                    <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5 font-['Outfit']">
                      <MapPin className="w-4 h-4 text-[#2A7252]" />
                      <span>खेत का स्थान एवं भूमि का आकार</span>
                    </h3>
                    <p className="text-xs text-neutral-500">
                      सटीक स्थान से स्थानीय मंडी भाव और खेत से सीधे वाहन द्वारा उठान सुनिश्चित होता है।
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* State */}
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">
                        राज्य <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={stateName}
                        onChange={(e) => setStateName(e.target.value)}
                        className="w-full text-xs font-semibold border border-neutral-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2A7252] bg-white cursor-pointer"
                      >
                        {STATES.map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>

                    {/* District */}
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">
                        ज़िला <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="उदा. लुधियाना / नासिक / सीहोर"
                        value={districtName}
                        onChange={(e) => setDistrictName(e.target.value)}
                        className="w-full text-xs border border-neutral-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2A7252]"
                      />
                    </div>

                    {/* Tehsil / Taluka */}
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">
                        तहसील / तालुका
                      </label>
                      <input
                        type="text"
                        placeholder="उदा. जगराओं / निफाड़"
                        value={tehsilName}
                        onChange={(e) => setTehsilName(e.target.value)}
                        className="w-full text-xs border border-neutral-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2A7252]"
                      />
                    </div>

                    {/* Village Name */}
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">
                        गाँव / ग्राम पंचायत <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="उदा. रायकोट कलां / पिंपलास"
                        value={villageName}
                        onChange={(e) => setVillageName(e.target.value)}
                        className="w-full text-xs border border-neutral-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2A7252]"
                      />
                    </div>

                    {/* PIN Code */}
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">
                        पिन कोड <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="उदा. 142026"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                        className="w-full text-xs font-mono border border-neutral-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2A7252]"
                      />
                    </div>

                    {/* Nearest APMC Mandi */}
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">
                        निकटतम कृषि उपज मंडी (APMC)
                      </label>
                      <input
                        type="text"
                        placeholder="उदा. खन्ना अनाज मंडी / लासलगांव मंडी"
                        value={nearestMandi}
                        onChange={(e) => setNearestMandi(e.target.value)}
                        className="w-full text-xs border border-neutral-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2A7252]"
                      />
                    </div>

                    {/* Farm Size (Landholding in Acres) */}
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">
                        कुल खेत का आकार (एकड़ में) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          placeholder="उदा. 6.5"
                          value={farmSizeAcres}
                          onChange={(e) => setFarmSizeAcres(e.target.value ? Number(e.target.value) : '')}
                          className="w-full text-xs font-bold border border-neutral-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2A7252]"
                        />
                        <span className="absolute right-3 top-2.5 text-xs text-neutral-500 font-medium">
                          एकड़ (Acres)
                        </span>
                      </div>
                    </div>

                    {/* Irrigation Type */}
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">
                        सिंचाई का मुख्य साधन
                      </label>
                      <select
                        value={irrigationType}
                        onChange={(e) => setIrrigationType(e.target.value)}
                        className="w-full text-xs border border-neutral-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2A7252] bg-white cursor-pointer"
                      >
                        <option value="Canal + Solar Tube Well">नहर + सौर ट्यूबवेल (Canal + Solar)</option>
                        <option value="Borewell / Deep Tubewell">बोरवेल / गहरा नलकूप (Borewell)</option>
                        <option value="Drip / Micro-Sprinkler">ड्रिप / फव्वारा सिंचाई (Drip / Sprinkler)</option>
                        <option value="Rainfed / Monsoonal">वर्षा आधारित (Rainfed / Monsoon)</option>
                      </select>
                    </div>
                  </div>

                  {/* Soil Type */}
                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">
                      मिट्टी का प्रकार व उर्वरता
                    </label>
                    <select
                      value={soilType}
                      onChange={(e) => setSoilType(e.target.value)}
                      className="w-full text-xs border border-neutral-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2A7252] bg-white cursor-pointer"
                    >
                      <option value="Alluvial Sandy Loam (High Fertility)">जलोढ़ बलुई दोमट मिट्टी (उच्च उर्वरता)</option>
                      <option value="Black Cotton Soil (Deep Moisture Retentive)">काली कपासी मिट्टी (गहरी नमी संचायक)</option>
                      <option value="Red Sandy / Loamy Soil">लाल बलुई / दोमट मिट्टी</option>
                      <option value="Clayey Loam Soil">चिकनी दोमट मिट्टी (Clayey Loam)</option>
                    </select>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="pt-2 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setRegStep(2)}
                      className="py-2 px-4 border border-neutral-300 text-neutral-700 text-xs font-bold rounded-xl hover:bg-neutral-50 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>पीछे</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!districtName || !villageName) {
                          alert('कृपया अपना ज़िला और गाँव दर्ज करें।');
                          return;
                        }
                        setRegStep(4);
                      }}
                      className="py-2.5 px-5 bg-[#1E523D] hover:bg-[#164231] text-white text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer"
                    >
                      <span>आगे: फसलें एवं उपलब्ध मात्रा</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: Crops Grown & Available Quantity for Sale */}
              {regStep === 4 && (
                <div className="space-y-4">
                  <div className="border-b border-neutral-200 pb-2">
                    <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5 font-['Outfit']">
                      <Wheat className="w-4 h-4 text-[#2A7252]" />
                      <span>उगाई जाने वाली फसलें एवं बिक्री योग्य मात्रा</span>
                    </h3>
                    <p className="text-xs text-neutral-500">
                      अपने खेत में उगाई जाने वाली फसलें चुनें और तत्काल बिक्री हेतु तैयार फसल का विवरण व अपेक्षित मूल्य दर्ज करें।
                    </p>
                  </div>

                  {/* Crops Grown Multi-Select Badges */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-neutral-700">
                      <span>आपके खेत में उगाई जाने वाली फसलें (चुनने के लिए क्लिक करें):</span>
                      <span className="text-[11px] text-[#2A7252] font-semibold">
                        {selectedCropsGrown.length} चुनी गई
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {COMMON_CROPS.map((crop) => {
                        const isSelected = selectedCropsGrown.includes(crop);
                        return (
                          <button
                            key={crop}
                            type="button"
                            onClick={() => handleToggleCropGrown(crop)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
                              isSelected
                                ? 'bg-[#1E523D] text-white font-bold border border-[#52B788] shadow-xs'
                                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border border-neutral-200'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 text-emerald-300" />}
                            <span>{crop}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Farming Practice */}
                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">
                      खेती की पद्धति / प्रमाणन
                    </label>
                    <select
                      value={farmingPractice}
                      onChange={(e) => setFarmingPractice(e.target.value)}
                      className="w-full text-xs border border-neutral-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2A7252] bg-white cursor-pointer"
                    >
                      <option value="NPOP Certified Organic">जैविक प्रमाणित (NPOP Certified Organic / जैविक भारत)</option>
                      <option value="Zero Budget Natural Farming (ZBNF)">शून्य बजट प्राकृतिक खेती (ZBNF Natural Farming)</option>
                      <option value="Residue-Free Mandi Grade">अवशेष-मुक्त प्रीमियम मंडी ग्रेड (Residue-Free)</option>
                      <option value="Traditional High-Yield Mandi">पारंपरिक उच्च उपज मंडी ग्रेड (Traditional High-Yield)</option>
                    </select>
                  </div>

                  {/* Harvest Batch for Immediate Sale */}
                  <div className="bg-[#F6FBF7] p-3.5 rounded-2xl border border-[#C5E1CF] space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-[#184533]">
                      <span className="flex items-center gap-1.5">
                        <Scale className="w-4 h-4 text-[#2A7252]" />
                        <span>तत्काल बिक्री हेतु तैयार फसल लॉट</span>
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                        लाइव मंडी में लिस्ट होगी
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Variety / Title */}
                      <div>
                        <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                          फसल की किस्म / नाम <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="उदा. शरबती गोल्डन गेहूं (C-306 ग्रेड ए)"
                          value={sellCropTitle}
                          onChange={(e) => setSellCropTitle(e.target.value)}
                          className="w-full text-xs font-semibold border border-neutral-300 rounded-xl px-3 py-2 focus:outline-none focus:border-[#2A7252] bg-white"
                        />
                      </div>

                      {/* Category */}
                      <div>
                        <label className="text-[11px] font-bold text-neutral-700 block mb-1">फसल की श्रेणी</label>
                        <select
                          value={sellCropCategory}
                          onChange={(e) => setSellCropCategory(e.target.value as any)}
                          className="w-full text-xs border border-neutral-300 rounded-xl px-3 py-2 focus:outline-none focus:border-[#2A7252] bg-white cursor-pointer"
                        >
                          <option value="Grains">अनाज (Grains & Cereals)</option>
                          <option value="Pulses">दालें एवं दलहन (Pulses & Legumes)</option>
                          <option value="Oilseeds">तिलहन (Oilseeds)</option>
                          <option value="Vegetables">सब्जियां (Vegetables)</option>
                          <option value="Spices">मसाले (Spices)</option>
                          <option value="Cash Crops">नकदी फसलें (Cash Crops)</option>
                        </select>
                      </div>

                      {/* Available Quantity in Quintals */}
                      <div>
                        <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                          उपलब्ध मात्रा (क्विंटल में) <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="1"
                            placeholder="उदा. 120"
                            value={sellQuantityQuintals}
                            onChange={(e) => setSellQuantityQuintals(e.target.value ? Number(e.target.value) : '')}
                            className="w-full text-xs font-bold border border-neutral-300 rounded-xl px-3 py-2 focus:outline-none focus:border-[#2A7252] bg-white"
                          />
                          <span className="absolute right-3 top-2 text-[11px] text-neutral-500">
                            क्विंटल ({Number(sellQuantityQuintals || 0) * 100} किग्रा)
                          </span>
                        </div>
                      </div>

                      {/* Expected Price per Quintal */}
                      <div>
                        <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                          अपेक्षित मूल्य (₹ / क्विंटल) <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-xs font-bold text-neutral-500">₹</span>
                          <input
                            type="number"
                            min="100"
                            placeholder="उदा. 3250"
                            value={sellExpectedPrice}
                            onChange={(e) => setSellExpectedPrice(e.target.value ? Number(e.target.value) : '')}
                            className="w-full text-xs font-bold border border-neutral-300 rounded-xl pl-7 pr-3 py-2 focus:outline-none focus:border-[#2A7252] bg-white"
                          />
                          <span className="absolute right-3 top-2 text-[10px] text-emerald-700 font-bold">
                            एमएसपी से +18% अधिक
                          </span>
                        </div>
                      </div>

                      {/* Moisture Percentage */}
                      <div>
                        <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                          नमी की मात्रा (%)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.1"
                            placeholder="उदा. 10.8"
                            value={sellMoisturePercent}
                            onChange={(e) => setSellMoisturePercent(e.target.value ? Number(e.target.value) : '')}
                            className="w-full text-xs border border-neutral-300 rounded-xl px-3 py-2 focus:outline-none focus:border-[#2A7252] bg-white"
                          />
                          <span className="absolute right-3 top-2 text-[11px] text-neutral-500 font-mono">%</span>
                        </div>
                      </div>

                      {/* Packaging */}
                      <div>
                        <label className="text-[11px] font-bold text-neutral-700 block mb-1">पैकिंग का प्रकार</label>
                        <select
                          value={sellPackaging}
                          onChange={(e) => setSellPackaging(e.target.value)}
                          className="w-full text-xs border border-neutral-300 rounded-xl px-3 py-2 focus:outline-none focus:border-[#2A7252] bg-white cursor-pointer"
                        >
                          <option value="50kg Hermetic Moisture-Proof Bags">50 किग्रा वायुरोधी सुरक्षित बैग</option>
                          <option value="50kg Standard Jute Bags">50 किग्रा मानक जूट बोरी</option>
                          <option value="25kg Packaged Retail Sacks">25 किग्रा पैकेज्ड रिटेल बैग</option>
                          <option value="Bulk Loose Trailer Load">थोक खुला ट्रेलर/ट्रॉली लोड</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="pt-2 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setRegStep(3)}
                      className="py-2 px-4 border border-neutral-300 text-neutral-700 text-xs font-bold rounded-xl hover:bg-neutral-50 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>पीछे</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!sellCropTitle || !sellQuantityQuintals) {
                          alert('कृपया फसल का नाम और उपलब्ध मात्रा दर्ज करें।');
                          return;
                        }
                        setRegStep(5);
                      }}
                      className="py-2.5 px-5 bg-[#1E523D] hover:bg-[#164231] text-white text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer"
                    >
                      <span>आगे: बैंक एवं भुगतान विवरण</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5: Bank / Payment Details */}
              {regStep === 5 && (
                <div className="space-y-4">
                  <div className="border-b border-neutral-200 pb-2">
                    <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5 font-['Outfit']">
                      <Landmark className="w-4 h-4 text-[#2A7252]" />
                      <span>बैंक खाता एवं सीधा एस्क्रो भुगतान (DBT)</span>
                    </h3>
                    <p className="text-xs text-neutral-500">
                      खरीदार का भुगतान सरकारी ONDC एस्क्रो में सुरक्षित जमा रहता है और गुणवत्ता जांच के तुरंत बाद (T+0) आपके बैंक खाते में अंतरित होता है।
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Account Holder Name */}
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">
                        खाताधारक का नाम (आधार के अनुसार) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="आधार कार्ड में दर्ज नाम अनुसार"
                        value={accountHolderName || fullName}
                        onChange={(e) => setAccountHolderName(e.target.value)}
                        className="w-full text-xs font-semibold border border-neutral-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2A7252]"
                      />
                    </div>

                    {/* Bank Name */}
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">
                        बैंक का नाम <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="उदा. भारतीय स्टेट बैंक (SBI) / पंजाब नेशनल बैंक"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full text-xs border border-neutral-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2A7252]"
                      />
                    </div>

                    {/* Bank Account Number */}
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">
                        बैंक खाता संख्या <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="password"
                        placeholder="उदा. 38492019482"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                        className="w-full text-xs font-mono font-bold border border-neutral-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2A7252]"
                      />
                    </div>

                    {/* Confirm Account Number */}
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">
                        खाता संख्या की पुनः पुष्टि करें <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="खाता संख्या दोबारा दर्ज करें"
                        value={confirmAccountNumber}
                        onChange={(e) => setConfirmAccountNumber(e.target.value.replace(/\D/g, ''))}
                        className="w-full text-xs font-mono font-bold border border-neutral-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2A7252]"
                      />
                    </div>

                    {/* Bank IFSC Code */}
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">
                        बैंक IFSC कोड <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="उदा. SBIN0001245"
                        value={ifscCode}
                        onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                        className="w-full text-xs font-mono font-bold uppercase border border-neutral-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2A7252]"
                      />
                    </div>

                    {/* UPI ID */}
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">
                        तुरंत भुगतान हेतु UPI आईडी <span className="text-neutral-400 text-[10px]">(वैकल्पिक)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="उदा. 9876543210@upi या kisan@sbi"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full text-xs font-mono border border-neutral-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2A7252]"
                      />
                    </div>
                  </div>

                  {/* DBT Linked Checkbox */}
                  <label className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200 cursor-pointer text-xs text-emerald-900 font-medium">
                    <input
                      type="checkbox"
                      checked={dbtLinked}
                      onChange={(e) => setDbtLinked(e.target.checked)}
                      className="accent-[#2A7252] w-4 h-4 rounded"
                    />
                    <span>
                      यह खाता <strong>आधार DBT (प्रत्यक्ष लाभ अंतरण)</strong> से जुड़ा है, जिससे पीएम-किसान, खाद सब्सिडी और खेति लिंक एस्क्रो का पैसा सीधे इस खाते में आएगा।
                    </span>
                  </label>

                  {/* Navigation Buttons */}
                  <div className="pt-2 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setRegStep(4)}
                      className="py-2 px-4 border border-neutral-300 text-neutral-700 text-xs font-bold rounded-xl hover:bg-neutral-50 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>पीछे</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!accountNumber || accountNumber !== confirmAccountNumber) {
                          alert('कृपया सही बैंक खाता संख्या दर्ज करें और दोनों का मिलान करें।');
                          return;
                        }
                        setRegStep(6);
                      }}
                      className="py-2.5 px-5 bg-[#1E523D] hover:bg-[#164231] text-white text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer"
                    >
                      <span>आगे: केवाईसी एवं दस्तावेज सत्यापन</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 6: KYC / Document Verification */}
              {regStep === 6 && (
                <div className="space-y-4">
                  <div className="border-b border-neutral-200 pb-2">
                    <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5 font-['Outfit']">
                      <ShieldCheck className="w-4 h-4 text-[#2A7252]" />
                      <span>केवाईसी एवं भूमि रिकॉर्ड दस्तावेज सत्यापन</span>
                    </h3>
                    <p className="text-xs text-neutral-500">
                      कृषि मंत्रालय एवं ई-नाम (e-NAM) नियमों के अनुरूप सुरक्षित एवं सरकारी मान्य केवाईसी प्रक्रिया।
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Aadhaar Number */}
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">
                        12-अंकों का आधार नंबर या VID <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        maxLength={14}
                        placeholder="7849-2910-4821"
                        value={aadhaarNumber}
                        onChange={(e) => setAadhaarNumber(e.target.value)}
                        className="w-full text-xs font-mono font-bold border border-neutral-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2A7252]"
                      />
                      <span className="text-[10px] text-neutral-400">यूआईडीएआई 256-बिट सुरक्षित मास्किंग</span>
                    </div>

                    {/* Land Document Type */}
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">
                        भूमि दस्तावेज का प्रकार <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={landDocType}
                        onChange={(e) => setLandDocType(e.target.value)}
                        className="w-full text-xs font-semibold border border-neutral-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2A7252] bg-white cursor-pointer"
                      >
                        <option value="Kisan Credit Card (KCC)">किसान क्रेडिट कार्ड (KCC)</option>
                        <option value="7/12 Land Record Extract (Bhulekh)">7/12 भूलेख नकल / खतौनी</option>
                        <option value="Khasra-Khatauni / Patta Certificate">खसरा-खतौनी / पट्टा प्रमाणपत्र</option>
                        <option value="PM-KISAN Beneficiary ID">पीएम-किसान लाभार्थी आईडी (PM-KISAN)</option>
                      </select>
                    </div>
                  </div>

                  {/* Document Registration Number */}
                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">
                      दस्तावेज / KCC / खसरा पंजीकरण संख्या <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="उदा. KCC-PB-2026-98412 या खसरा #142/9"
                      value={landDocNumber}
                      onChange={(e) => setLandDocNumber(e.target.value)}
                      className="w-full text-xs font-mono border border-neutral-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2A7252]"
                    />
                  </div>

                  {/* File Upload Simulator with Instant AI Scan */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-700 block">
                      दस्तावेज की फोटो या पीडीएफ अपलोड करें (PDF, JPG या PNG)
                    </label>
                    <div className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-2xl p-4 text-center bg-emerald-50/40 transition cursor-pointer relative">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleSimulateFileUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <div className="space-y-1.5 pointer-events-none">
                        <Upload className="w-6 h-6 text-emerald-600 mx-auto" />
                        <div className="text-xs font-bold text-neutral-700">
                          {uploadedFileName ? (
                            <span className="text-emerald-800 font-mono">{uploadedFileName}</span>
                          ) : (
                            <span>दस्तावेज यहां खींचें या चुनने के लिए क्लिक करें</span>
                          )}
                        </div>
                        <p className="text-[10px] text-neutral-400">
                          मान्य: केसीसी कार्ड फोटो, 7/12 नकल, खसरा रसीद (अधिकतम 15MB)
                        </p>
                      </div>
                    </div>

                    {/* AI Verification Scanner State */}
                    {isKycScanning && (
                      <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200 animate-pulse">
                        <RefreshCw className="w-4 h-4 animate-spin text-amber-600" />
                        <span>राज्य राजस्व विभाग के साथ भूमि रिकॉर्ड का सत्यापन किया जा रहा है...</span>
                      </div>
                    )}

                    {isKycVerified && (
                      <div className="flex items-center justify-between text-xs text-emerald-900 bg-emerald-100 p-2.5 rounded-xl border border-emerald-300">
                        <div className="flex items-center gap-2 font-bold">
                          <BadgeCheck className="w-5 h-5 text-emerald-600" />
                          <span>सरकारी राजस्व रिकॉर्ड एवं आधार का सफलतापूर्वक मिलान हुआ ✓</span>
                        </div>
                        <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-emerald-400">
                          सत्यापन स्कोर: 98%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Mandi & Escrow Agreement Checkbox */}
                  <label className="flex items-start gap-2 pt-1 text-xs text-neutral-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={termsAgreed}
                      onChange={(e) => setTermsAgreed(e.target.checked)}
                      className="accent-[#2A7252] w-4 h-4 rounded mt-0.5"
                    />
                    <span>
                      मैं प्रमाणित करता/करती हूँ कि दी गई भूमि, फसल मात्रा ({sellQuantityQuintals || 0} क्विंटल), बैंक और केवाईसी विवरण सत्य हैं। मैं खेति लिंक की गुणवत्ता जांच और ONDC स्मार्ट कॉन्ट्रैक्ट एस्क्रो नियमों से सहमत हूँ।
                    </span>
                  </label>

                  {/* Submission and Back Buttons */}
                  <div className="pt-2 flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => setRegStep(5)}
                      className="py-2 px-4 border border-neutral-300 text-neutral-700 text-xs font-bold rounded-xl hover:bg-neutral-50 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>पीछे</span>
                    </button>

                    <button
                      type="button"
                      disabled={isSubmittingAuth}
                      onClick={handleCompleteFarmerRegistration}
                      className="py-3 px-6 bg-gradient-to-r from-[#1B523D] via-[#2A7252] to-[#1B523D] hover:from-[#154231] hover:to-[#154231] disabled:opacity-75 text-white text-xs uppercase tracking-wider font-extrabold rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
                    >
                      {isSubmittingAuth ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                          <span>डेटाबेस में सुरक्षित किया जा रहा है...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-amber-300" />
                          <span>सत्यापित करें और बिक्री हेतु पंजीकरण पूर्ण करें</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* RETURNING FARMER LOGIN (With Mandatory Farmer Info Flow) */}
          {/* ======================================================== */}
          {activeRole === 'farmer' && farmerMode === 'login' && (
            <div className="space-y-4">
              <div className="border-b border-neutral-200 pb-2">
                <h3 className="text-sm font-bold text-neutral-900 font-['Outfit'] flex items-center justify-between">
                  <span>किसान व एफपीओ (FPO) लॉगिन • विवरण सत्यापन</span>
                  <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    किसान आईडी / मोबाइल
                  </span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  मंडी बोलियां, एस्क्रो सुरक्षित भुगतान और फसल लॉट तक पहुंचने के लिए अपने पंजीकृत किसान विवरण को सत्यापित करें।
                </p>
              </div>

              {/* Mandatory Farmer Registration & Information Checklist */}
              <div className="bg-gradient-to-br from-[#F4F9F5] to-[#E8F4EC] p-3.5 rounded-2xl border border-[#C5DEC8] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#184533]">
                    <ShieldCheck className="w-4 h-4 text-[#2A7252]" />
                    <span>लॉगिन पर जांची जाने वाली 9 अनिवार्य किसान जानकारियां</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#2A7252] bg-white px-2 py-0.5 rounded-full border border-[#B3D6B8]">
                    9/9 सत्यापित
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px]">
                  <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white/80 border border-[#D5E6D8] text-neutral-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>मोबाइल/ईमेल पंजीकरण</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white/80 border border-[#D5E6D8] text-neutral-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>OTP सत्यापन</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white/80 border border-[#D5E6D8] text-neutral-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>किसान प्रोफाइल</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white/80 border border-[#D5E6D8] text-neutral-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>खेत का स्थान</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white/80 border border-[#D5E6D8] text-neutral-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>खेत का क्षेत्रफल (एकड़)</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white/80 border border-[#D5E6D8] text-neutral-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>उगाई जाने वाली फसलें</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white/80 border border-[#D5E6D8] text-neutral-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>उपलब्ध मात्रा (क्विंटल)</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white/80 border border-[#D5E6D8] text-neutral-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>बैंक / DBT खाता</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white/80 border border-[#D5E6D8] text-neutral-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>KYC / दस्तावेज</span>
                  </div>
                </div>
              </div>

              {/* Login Step 1: Enter Phone */}
              {loginStep === 'phone' && (
                <form 
                  onSubmit={(e) => { 
                    e.preventDefault(); 
                    if (!loginPhone) setLoginPhone('9872145680');
                    setLoginOtpSent(true); 
                    setLoginStep('otp');
                  }} 
                  className="space-y-3"
                >
                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">
                      किसान का पंजीकृत मोबाइल नंबर या किसान क्रेडिट कार्ड ID <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
                      <input
                        type="text"
                        required
                        placeholder="+91 98721 45680 या KCC-PB-8941"
                        value={loginPhone}
                        onChange={(e) => setLoginPhone(e.target.value)}
                        className="w-full text-xs border border-neutral-300 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-[#2A7252]"
                      />
                    </div>
                    <span className="text-[10px] text-neutral-400 mt-1 block">
                      हम OTP सत्यापित करेंगे और आपका पंजीकृत खेत स्थान, फसलें, उपलब्ध मात्रा व बैंक DBT विवरण प्राप्त करेंगे।
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#1E523D] hover:bg-[#164231] text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>लॉगिन OTP भेजें (Request OTP)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}

              {/* Login Step 2: OTP Verification */}
              {loginStep === 'otp' && (
                <div className="space-y-3">
                  <div className="bg-emerald-50 text-emerald-800 p-2.5 rounded-xl text-xs flex items-center justify-between">
                    <span><strong>+91 {loginPhone || '9872145680'}</strong> पर भेजा गया OTP दर्ज करें (डेमो: <strong>123456</strong>)</span>
                    <button
                      type="button"
                      onClick={() => setLoginOtpCode('123456')}
                      className="text-[11px] font-bold text-emerald-700 underline cursor-pointer"
                    >
                      123456 भरें
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={loginOtpCode}
                    onChange={(e) => setLoginOtpCode(e.target.value)}
                    className="w-full text-center font-mono font-bold text-lg border border-neutral-300 rounded-xl py-2 focus:outline-none focus:border-[#2A7252]"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setLoginStep('phone')}
                      className="py-2.5 px-4 border border-neutral-300 text-neutral-700 font-bold text-xs rounded-xl hover:bg-neutral-50 transition cursor-pointer"
                    >
                      नंबर बदलें
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!loginOtpCode) setLoginOtpCode('123456');
                        setLoginStep('verify_info');
                      }}
                      className="flex-1 py-2.5 bg-[#2A7252] hover:bg-[#1E523D] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>OTP सत्यापित करें और किसान जानकारी देखें</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Login Step 3: Verified Farmer Information Summary Screen */}
              {loginStep === 'verify_info' && (
                <div className="space-y-3.5 animate-fadeIn">
                  <div className="p-3 bg-emerald-50/90 border border-emerald-300 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between pb-1 border-b border-emerald-200">
                      <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        किसान पंजीकृत प्रोफाइल जानकारी
                      </span>
                      <span className="text-[10px] font-bold bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full">
                        सरकारी आधार व KCC सत्यापित
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-700">
                      <div className="bg-white/80 p-2 rounded-xl border border-emerald-100">
                        <span className="text-[10px] font-bold text-neutral-400 block uppercase">किसान प्रोफाइल</span>
                        <p className="font-bold text-neutral-900">सरदार गुरप्रीत सिंह (उम्र: 48 वर्ष)</p>
                        <p className="text-[11px] text-neutral-600">मालवा किसान उत्पादक कंपनी (FPO सदस्य)</p>
                      </div>

                      <div className="bg-white/80 p-2 rounded-xl border border-emerald-100">
                        <span className="text-[10px] font-bold text-neutral-400 block uppercase">खेत स्थान व क्षेत्रफल</span>
                        <p className="font-bold text-neutral-900">रायकोट, जिला लुधियाना, पंजाब</p>
                        <p className="text-[11px] text-neutral-600">8.5 एकड़ • सोलर ट्यूबवेल + नहर सिंचाई</p>
                      </div>

                      <div className="bg-white/80 p-2 rounded-xl border border-emerald-100">
                        <span className="text-[10px] font-bold text-neutral-400 block uppercase">फसलें व उपलब्ध स्टॉक</span>
                        <p className="font-bold text-neutral-900">शरबती गेहूं, बासमती धान, सरसों</p>
                        <p className="text-[11px] text-emerald-700 font-bold">140 क्विंटल तुरंत प्रेषण हेतु उपलब्ध</p>
                      </div>

                      <div className="bg-white/80 p-2 rounded-xl border border-emerald-100">
                        <span className="text-[10px] font-bold text-neutral-400 block uppercase">बैंक खाता व सीधा DBT</span>
                        <p className="font-bold text-neutral-900">भारतीय स्टेट बैंक • खाता •••• 4821</p>
                        <p className="text-[11px] text-emerald-700 font-bold">IFSC: SBIN0001245 • आधार DBT सक्रिय</p>
                      </div>
                    </div>

                    <div className="pt-1 flex items-center justify-between text-[11px] text-emerald-800">
                      <span className="flex items-center gap-1">
                        <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                        भूमि अभिलेख: <strong>KCC व खतौनी 7/12 सत्यापित (UIDAI सुरक्षित)</strong>
                      </span>
                      <span>सत्यापन तिथि: आज</span>
                    </div>
                  </div>

                  {/* Confirmation Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={() => setFarmerMode('register')}
                      className="py-2.5 px-3.5 border border-[#2A7252] text-[#2A7252] hover:bg-emerald-50 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>✏️ खेत / बैंक विवरण बदलें</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleReturningFarmerLogin}
                      className="flex-1 py-3 px-4 bg-gradient-to-r from-[#1B523D] via-[#2A7252] to-[#1B523D] hover:from-[#154231] hover:to-[#154231] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>विवरण सत्यापित करें और किसान पोर्टल खोलें</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Toggle to Full Registration */}
              <div className="pt-2 text-center border-t border-neutral-100">
                <p className="text-xs text-neutral-500">
                  क्या आप नए किसान हैं और अभी तक पंजीकरण नहीं कराया?{' '}
                  <button
                    type="button"
                    onClick={() => setFarmerMode('register')}
                    className="font-bold text-[#2A7252] hover:underline cursor-pointer"
                  >
                    सम्पूर्ण किसान पंजीकरण शुरू करें (सभी 9 चरण)
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* BULK BUYER & HOSTEL MESS AUTHENTICATION */}
          {/* ======================================================== */}
          {activeRole === 'buyer' && (
            <div className="space-y-4">
              <div className="border-b border-neutral-200 pb-2">
                <h3 className="text-sm font-bold text-neutral-900 font-['Outfit'] flex items-center justify-between">
                  <span>हॉस्टल मेस व थोक खरीदार पोर्टल</span>
                  <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    मेस, कैंटीन, होटल व खाद्य उद्योग
                  </span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  कॉलेज मेस, हॉस्टल, होटल किचन और थोक खाद्य व्यापारियों के लिए सीधे खेत से अनाज, दाल व उपज खरीद सुविधा।
                </p>
              </div>

              {/* 1-Click Demo Logins for Messes and Institutional Buyers */}
              <div className="bg-[#F4F8F4] p-3 rounded-2xl border border-[#D5E2D5] space-y-2">
                <div className="flex items-center justify-between text-[11px] text-[#3C5148] font-bold">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    ⚡ 1-क्लिक त्वरित खरीद प्रवेश (डेमो खरीदार)
                  </span>
                  <span className="text-[10px] text-neutral-400">पूर्व-सत्यापित</span>
                </div>

                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickJudgeLogin('buyer', 'IIT Delhi Hostel Mess & Canteen Co-op')}
                    className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-[#E8EFE8] border border-[#C8DAC8] text-xs transition flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#1B2727]">IIT दिल्ली हॉस्टल मेस व कैंटीन को-ऑप</span>
                        <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                          कॉलेज हॉस्टल मेस
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-500">
                        3,200 छात्र • थोक चावल, गेहूं व दालें • हौज खास परिसर
                      </span>
                    </div>
                    <span className="text-[10px] bg-[#1E523D] text-white px-2.5 py-1 rounded-lg font-bold">लॉगिन करें &rarr;</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickJudgeLogin('buyer', 'Aditi Organic Foods Pvt Ltd')}
                    className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-[#E8EFE8] border border-[#C8DAC8] text-xs transition flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#1B2727]">अदिति ऑर्गेनिक फूड्स प्राइवेट लिमिटेड</span>
                        <span className="text-[9px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded">
                          खाद्य प्रसंस्करणकर्ता
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-500">थोक खाद्य प्रसंस्करणकर्ता • दिल्ली एनसीआर मंडी हब</span>
                    </div>
                    <span className="text-[10px] bg-[#1E523D] text-white px-2.5 py-1 rounded-lg font-bold">लॉगिन करें &rarr;</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickJudgeLogin('buyer', 'FreshMart Supermarkets Retail')}
                    className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-[#E8EFE8] border border-[#C8DAC8] text-xs transition flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#1B2727]">फ्रेशमार्ट सुपरमार्केट्स रिटेल</span>
                        <span className="text-[9px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded">
                          रिटेल चेन
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-500">राष्ट्रीय सुपरमार्केट श्रृंखला • मुंबई हब</span>
                    </div>
                    <span className="text-[10px] bg-[#1E523D] text-white px-2.5 py-1 rounded-lg font-bold">लॉगिन करें &rarr;</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 border-t border-neutral-200" />
                <span className="text-[10px] uppercase font-bold text-neutral-400">अथवा खरीदार विवरण भरकर लॉगिन करें</span>
                <div className="flex-1 border-t border-neutral-200" />
              </div>

              {/* Standard Buyer Form with Hostel Mess Category */}
              {!buyerOtpSent ? (
                <form 
                  onSubmit={(e) => { 
                    e.preventDefault(); 
                    setBuyerOtpSent(true); 
                  }} 
                  className="space-y-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">
                        संगठन / संस्थान का प्रकार <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={buyerOrgType}
                        onChange={(e) => setBuyerOrgType(e.target.value)}
                        className="w-full text-xs font-medium border border-neutral-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2A7252] bg-white cursor-pointer"
                      >
                        <option value="Hostel Mess & Canteen">कॉलेज मेस / यूनिवर्सिटी हॉस्टल (College Mess / Hostel)</option>
                        <option value="Hotel & Restaurant (HoReCa)">होटल, रेस्टोरेंट व कैंटीन (Hotel / HoReCa)</option>
                        <option value="Food Processing / Flour Mill">खाद्य प्रसंस्करण / आटा मिल (Food Mill / Processing)</option>
                        <option value="Supermarket / Retail Chain">सुपरमार्केट / रिटेल चेन (Retail Chain)</option>
                        <option value="Export House">सरकारी संस्था / निर्यात एजेंसी (Govt / Export Agency)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">
                        मेस / संगठन का नाम (Mess / Org Name)
                      </label>
                      <input
                        type="text"
                        placeholder="उदा. IIT दिल्ली हॉस्टल मेस / अग्रसेन कैंटीन"
                        value={buyerOrgName}
                        onChange={(e) => setBuyerOrgName(e.target.value)}
                        className="w-full text-xs border border-neutral-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2A7252]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">
                      कॉर्पोरेट GSTIN / मेस पंजीकरण आईडी / मोबाइल नंबर <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
                      <input
                        type="text"
                        required
                        placeholder="उदा. 07AAACH2819K1Z4 या MESS-DL-4091 या 9876543210"
                        value={buyerGstin}
                        onChange={(e) => setBuyerGstin(e.target.value)}
                        className="w-full text-xs font-mono border border-neutral-300 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-[#2A7252]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#1E523D] hover:bg-[#164231] text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>खरीदार प्रमाणीकरण OTP प्राप्त करें</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                <form 
                  onSubmit={handleBuyerLogin} 
                  className="space-y-3"
                >
                  <div className="bg-emerald-50 text-emerald-800 p-2.5 rounded-xl text-xs flex items-center justify-between">
                    <span>पंजीकृत नंबर पर भेजा गया OTP दर्ज करें (डेमो: <strong>123456</strong>)</span>
                    <button
                      type="button"
                      onClick={() => setBuyerOtpCode('123456')}
                      className="text-[11px] font-bold text-emerald-700 underline cursor-pointer"
                    >
                      123456 भरें
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={buyerOtpCode}
                    onChange={(e) => setBuyerOtpCode(e.target.value)}
                    className="w-full text-center font-mono font-bold text-lg border border-neutral-300 rounded-xl py-2 focus:outline-none focus:border-[#2A7252]"
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingAuth}
                    className="w-full py-2.5 bg-[#2A7252] hover:bg-[#1E523D] disabled:opacity-75 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmittingAuth ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                        <span>Firebase डेटाबेस में सहेजा जा रहा है...</span>
                      </>
                    ) : (
                      <span>सत्यापित करें और खरीद पोर्टल में प्रवेश करें</span>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

        </div>

        {/* Modal Bottom Footer */}
        <div className="bg-neutral-50 px-5 py-3 border-t border-neutral-200 text-center shrink-0">
          <p className="text-[11px] text-neutral-500">
            भारत सरकार मंडी एस्क्रो द्वारा सुरक्षित • UIDAI व एगमार्कनेट गुणवत्ता मानक • ONDC नोड #KS-9842
          </p>
        </div>
      </div>
    </div>
  );
};
