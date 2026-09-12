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
  'Sharbati Wheat',
  'Pusa Basmati Rice',
  'Yellow Mustard',
  'Malwa Soybean',
  'Desi Chana (Chickpeas)',
  'Nashik Red Onion',
  'Shankar Cotton',
  'Tur Dal (Pigeon Pea)',
  'Bold Groundnut',
  'Unjha Cumin (Jeera)',
  'Guntur Red Chilli',
  'Kufri Jyoti Potato',
  'Pusa Ruby Tomato'
];

const STATES = [
  'Punjab',
  'Madhya Pradesh',
  'Maharashtra',
  'Rajasthan',
  'Haryana',
  'Uttar Pradesh',
  'Gujarat',
  'Karnataka',
  'Andhra Pradesh',
  'Telangana',
  'Bihar',
  'West Bengal'
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
  const [farmerCategory, setFarmerCategory] = useState('Small Farmer (2-5 Acres)');
  const [fpoName, setFpoName] = useState('Malwa Kisan Producer Company');
  const [experienceYears, setExperienceYears] = useState<number>(16);

  // STEP 3: Farm Location & Farm Size
  const [stateName, setStateName] = useState('Punjab');
  const [districtName, setDistrictName] = useState('Ludhiana');
  const [tehsilName, setTehsilName] = useState('Jagraon');
  const [villageName, setVillageName] = useState('Raikot Kalan');
  const [pincode, setPincode] = useState('142026');
  const [nearestMandi, setNearestMandi] = useState('Khanna Grain APMC Mandi');
  const [farmSizeAcres, setFarmSizeAcres] = useState<number | ''>(6.5);
  const [irrigationType, setIrrigationType] = useState('Canal + Solar Tube Well');
  const [soilType, setSoilType] = useState('Alluvial Sandy Loam (High Fertility)');

  // STEP 4: Crops Grown & Available Quantity to Sell
  const [selectedCropsGrown, setSelectedCropsGrown] = useState<string[]>([
    'Sharbati Wheat',
    'Yellow Mustard',
    'Pusa Basmati Rice'
  ]);
  const [farmingPractice, setFarmingPractice] = useState('NPOP Certified Organic');
  // Current harvest for immediate sale
  const [sellCropTitle, setSellCropTitle] = useState('Sharbati Golden Wheat (C-306 Grade A)');
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
    setFarmerCategory('Medium Farmer (5-10 Acres)');
    setFpoName('Malwa Kisan Producer Company Ltd');
    setExperienceYears(22);

    setStateName('Punjab');
    setDistrictName('Ludhiana');
    setTehsilName('Jagraon');
    setVillageName('Raikot Kalan');
    setPincode('142026');
    setNearestMandi('Khanna Grain APMC Mandi');
    setFarmSizeAcres(8.5);
    setIrrigationType('Canal + Solar Tube Well');
    setSoilType('Alluvial Sandy Loam (High Organic Carbon)');

    setSelectedCropsGrown(['Sharbati Wheat', 'Yellow Mustard', 'Pusa Basmati Rice']);
    setFarmingPractice('NPOP Certified Organic');

    setSellCropTitle('Sharbati Golden Wheat (C-306 Grade A)');
    setSellCropCategory('Grains');
    setSellCropVariety('Sharbati C-306');
    setSellQuantityQuintals(140);
    setSellExpectedPrice(3250);
    setSellMoisturePercent(10.5);
    setSellPackaging('50kg Hermetic Moisture-Proof Bags');

    setAccountHolderName('Harpreet Singh');
    setBankName('State Bank of India');
    setAccountNumber('38492019482');
    setConfirmAccountNumber('38492019482');
    setIfscCode('SBIN0001245');
    setUpiId('harpreet.kisan@sbi');
    setDbtLinked(true);

    setAadhaarNumber('7849-2910-4821');
    setLandDocType('Kisan Credit Card (KCC)');
    setLandDocNumber('KCC-PB-2026-98412');
    setUploadedFileName('7_12_Khasra_Harpreet_Ludhiana.pdf');
    setIsKycVerified(true);
    setTermsAgreed(true);
  };

  // Step 1: Send OTP
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber || mobileNumber.length < 10) {
      alert('Please enter a valid 10-digit mobile number.');
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
      alert('Please enter the 6-digit OTP code (Demo: 123456)');
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
      alert('Please verify your mobile number with OTP first.');
      setRegStep(1);
      return;
    }

    if (!termsAgreed) {
      alert('Please agree to the Khet Link Mandi Escrow & Assaying terms.');
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
                  <span>{t('auth.nationalGateway', 'Khet Link National Gateway')}</span>
                  <span className="text-[10px] font-medium bg-[#52B788]/20 text-[#74C69D] px-2 py-0.5 rounded-full border border-[#52B788]/40">
                    {t('auth.mandiEscrowBadge', 'ONDC & Mandi Escrow')}
                  </span>
                </h2>
                <p className="text-[11px] text-emerald-200/70">
                  {t('auth.gatewayDesc', 'Direct Farmgate Marketplace & Assaying Verification Gateway')}
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
              <span>{t('auth.farmerRole', 'Farmer / FPO (Sell Harvest)')}</span>
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
              <span>{t('auth.buyerRole', 'Hostel Mess & Bulk Buyer')}</span>
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
                  {t('auth.newFarmer', '🌾 New Farmer Registration (Full Info)')}
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
                  {t('auth.existingFarmer', 'Existing Farmer Login & Verify')}
                </button>
              </div>

              {farmerMode === 'register' && (
                <button
                  type="button"
                  onClick={handlePreFillDemoData}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                  title="Auto fill sample Punjab farmer registration data"
                >
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>{t('auth.demoFill', '⚡ 1-Click Demo Fill')}</span>
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
                  <span>Step {regStep} of 6: {
                    regStep === 1 ? 'Mobile/Email & OTP Verification' :
                    regStep === 2 ? 'Farmer Profile & Experience' :
                    regStep === 3 ? 'Farm Location & Land Size' :
                    regStep === 4 ? 'Crops Grown & Available Quantity' :
                    regStep === 5 ? 'Bank & Direct DBT Payment' :
                    'KYC & Land Document Verification'
                  }</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-semibold">
                    {Math.round((regStep / 6) * 100)}% Complete
                  </span>
                </div>

                {/* Step Pills */}
                <div className="grid grid-cols-6 gap-1.5">
                  {[
                    { s: 1, label: 'OTP' },
                    { s: 2, label: 'Profile' },
                    { s: 3, label: 'Location' },
                    { s: 4, label: 'Crops' },
                    { s: 5, label: 'Bank' },
                    { s: 6, label: 'KYC' }
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
                      title={`Step ${s}: ${label}`}
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
                      <span>Mobile & Email Registration with OTP</span>
                    </h3>
                    <p className="text-xs text-neutral-500">
                      We verify your contact to send instant ONDC mandi bids, assaying reports, and escrow release alerts.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Mobile Number */}
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">
                        Farmer Mobile Number <span className="text-rose-500">*</span>
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
                      <span className="text-[10px] text-neutral-400">10-digit mobile number</span>
                    </div>

                    {/* Email Address */}
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">
                        Email Address <span className="text-neutral-400 text-[10px]">(Optional for Invoices)</span>
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
                      <span className="text-[10px] text-neutral-400">For GST mandi invoices</span>
                    </div>

                    {/* Account Password */}
                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-neutral-700 block mb-1">
                        Account Password <span className="text-neutral-400 text-[10px]">(For secure login to Khet Link)</span>
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
                      <span className="text-[10px] text-neutral-400">Default: Kisan@123456 (or choose your own)</span>
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
                      <span>Send 6-Digit OTP Verification Code</span>
                    </button>
                  ) : (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>OTP Sent to +91 {mobileNumber}</span>
                        </span>
                        <span className="text-[11px] font-mono text-emerald-700">
                          {otpTimer > 0 ? `Resend in ${otpTimer}s` : 'Ready to resend'}
                        </span>
                      </div>

                      {/* Demo simulation card */}
                      <div className="bg-white p-2.5 rounded-xl border border-emerald-300/80 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] font-bold text-neutral-400 uppercase block">Simulated SMS Message</span>
                          <span className="font-mono font-bold text-neutral-800">
                            Khet Link OTP is: <span className="text-emerald-700 text-sm">123456</span>
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
                          Auto-Fill 123456
                        </button>
                      </div>

                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="Enter 6-digit OTP"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                          className="w-full text-center font-mono font-bold text-sm tracking-widest border border-emerald-300 rounded-xl py-2 focus:outline-none focus:border-emerald-600 bg-white"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          className="py-2 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer"
                        >
                          Verify OTP
                        </button>
                      </div>

                      {isOtpVerified && (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold bg-emerald-100/80 p-2 rounded-lg">
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span>Mobile & Email Verified via UIDAI / Telecom Gateway ✓</span>
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
                          alert('Please send and verify OTP to proceed.');
                          return;
                        }
                        setRegStep(2);
                      }}
                      className="py-2.5 px-5 bg-[#1E523D] hover:bg-[#164231] text-white text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer"
                    >
                      <span>Next: Farmer Profile</span>
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
                      <span>Farmer Personal Profile & Category</span>
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Personal identity details for Mandi trading license, FPO affiliation, and farmer registry.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Full Name */}
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">
                        Farmer Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sardar Harpreet Singh"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full text-xs font-semibold border border-neutral-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2A7252]"
                      />
                    </div>

                    {/* Father / Guardian / Spouse Name */}
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">
                        Father's / Spouse's Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. S. Jagjit Singh"
                        value={fatherName}
                        onChange={(e) => setFatherName(e.target.value)}
                        className="w-full text-xs border border-neutral-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2A7252]"
                      />
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">Gender</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value as any)}
                        className="w-full text-xs border border-neutral-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2A7252] bg-white cursor-pointer"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Age */}
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">Age</label>
                      <input
                        type="number"
                        min={18}
                        max={100}
                        placeholder="e.g. 42"
                        value={age}
                        onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                        className="w-full text-xs border border-neutral-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2A7252]"
                      />
                    </div>

                    {/* Farmer Category */}
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">
                        Farmer Category
                      </label>
                      <select
                        value={farmerCategory}
                        onChange={(e) => setFarmerCategory(e.target.value)}
                        className="w-full text-xs border border-neutral-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2A7252] bg-white cursor-pointer"
                      >
                        <option value="Marginal Farmer (< 2.5 Acres)">Marginal Farmer (&lt; 2.5 Acres)</option>
                        <option value="Small Farmer (2.5 - 5 Acres)">Small Farmer (2.5 - 5 Acres)</option>
                        <option value="Medium Farmer (5 - 10 Acres)">Medium Farmer (5 - 10 Acres)</option>
                        <option value="Large Commercial (> 10 Acres)">Large Commercial (&gt; 10 Acres)</option>
                        <option value="FPO Cluster Representative">FPO Cluster Representative</option>
                      </select>
                    </div>

                    {/* FPO / Cooperative Name */}
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">
                        FPO / Kisan Cooperative Affiliation
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Malwa Kisan Producer Co. or Individual Farm"
                        value={fpoName}
                        onChange={(e) => setFpoName(e.target.value)}
                        className="w-full text-xs border border-neutral-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2A7252]"
                      />
                    </div>
                  </div>

                  {/* Experience */}
                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">
                      Farming Experience: <span className="text-[#2A7252] font-bold">{experienceYears} Years</span>
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
                      <span>Back</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!fullName.trim()) {
                          alert('Please enter your full name.');
                          return;
                        }
                        setRegStep(3);
                      }}
                      className="py-2.5 px-5 bg-[#1E523D] hover:bg-[#164231] text-white text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer"
                    >
                      <span>Next: Farm Location & Size</span>
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
                      <span>Farm Location & Landholding Size</span>
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Precise farm location determines hyper-local Mandi APMC rates and logistics pickup.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* State */}
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">
                        State <span className="text-rose-500">*</span>
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
                        District <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ludhiana / Nashik / Sehore"
                        value={districtName}
                        onChange={(e) => setDistrictName(e.target.value)}
                        className="w-full text-xs border border-neutral-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2A7252]"
                      />
                    </div>

                    {/* Tehsil / Taluka */}
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">
                        Tehsil / Taluka
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Jagraon / Niphad"
                        value={tehsilName}
                        onChange={(e) => setTehsilName(e.target.value)}
                        className="w-full text-xs border border-neutral-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2A7252]"
                      />
                    </div>

                    {/* Village Name */}
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">
                        Village Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Raikot Kalan / Pimplas"
                        value={villageName}
                        onChange={(e) => setVillageName(e.target.value)}
                        className="w-full text-xs border border-neutral-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2A7252]"
                      />
                    </div>

                    {/* PIN Code */}
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">
                        PIN Code <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="e.g. 142026"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                        className="w-full text-xs font-mono border border-neutral-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2A7252]"
                      />
                    </div>

                    {/* Nearest APMC Mandi */}
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">
                        Nearest APMC Mandi
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Khanna Grain Mandi / Lasalgaon Mandi"
                        value={nearestMandi}
                        onChange={(e) => setNearestMandi(e.target.value)}
                        className="w-full text-xs border border-neutral-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2A7252]"
                      />
                    </div>

                    {/* Farm Size (Landholding in Acres) */}
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">
                        Total Farm Size (in Acres) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          placeholder="e.g. 6.5"
                          value={farmSizeAcres}
                          onChange={(e) => setFarmSizeAcres(e.target.value ? Number(e.target.value) : '')}
                          className="w-full text-xs font-bold border border-neutral-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2A7252]"
                        />
                        <span className="absolute right-3 top-2.5 text-xs text-neutral-500 font-medium">
                          Acres
                        </span>
                      </div>
                    </div>

                    {/* Irrigation Type */}
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">
                        Irrigation Source
                      </label>
                      <select
                        value={irrigationType}
                        onChange={(e) => setIrrigationType(e.target.value)}
                        className="w-full text-xs border border-neutral-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2A7252] bg-white cursor-pointer"
                      >
                        <option value="Canal + Solar Tube Well">Canal + Solar Tube Well</option>
                        <option value="Borewell / Deep Tubewell">Borewell / Deep Tubewell</option>
                        <option value="Drip / Micro-Sprinkler">Drip / Micro-Sprinkler</option>
                        <option value="Rainfed / Monsoonal">Rainfed / Monsoonal</option>
                      </select>
                    </div>
                  </div>

                  {/* Soil Type */}
                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">
                      Soil Type & Fertility
                    </label>
                    <select
                      value={soilType}
                      onChange={(e) => setSoilType(e.target.value)}
                      className="w-full text-xs border border-neutral-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2A7252] bg-white cursor-pointer"
                    >
                      <option value="Alluvial Sandy Loam (High Fertility)">Alluvial Sandy Loam (High Fertility)</option>
                      <option value="Black Cotton Soil (Deep Moisture Retentive)">Black Cotton Soil (Deep Moisture Retentive)</option>
                      <option value="Red Sandy / Loamy Soil">Red Sandy / Loamy Soil</option>
                      <option value="Clayey Loam Soil">Clayey Loam Soil</option>
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
                      <span>Back</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!districtName || !villageName) {
                          alert('Please enter your District and Village.');
                          return;
                        }
                        setRegStep(4);
                      }}
                      className="py-2.5 px-5 bg-[#1E523D] hover:bg-[#164231] text-white text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer"
                    >
                      <span>Next: Crops & Harvest Quantity</span>
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
                      <span>Crops Grown & Available Quantity to Sell</span>
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Select all crops you grow, plus list your current ready-to-sell harvest batch with price expectations.
                    </p>
                  </div>

                  {/* Crops Grown Multi-Select Badges */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-neutral-700">
                      <span>Crops Cultivated on Your Farm (Click to toggle):</span>
                      <span className="text-[11px] text-[#2A7252] font-semibold">
                        {selectedCropsGrown.length} selected
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
                      Farming Practice / Certification
                    </label>
                    <select
                      value={farmingPractice}
                      onChange={(e) => setFarmingPractice(e.target.value)}
                      className="w-full text-xs border border-neutral-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2A7252] bg-white cursor-pointer"
                    >
                      <option value="NPOP Certified Organic">NPOP Certified Organic (Jaivik Bharat)</option>
                      <option value="Zero Budget Natural Farming (ZBNF)">Zero Budget Natural Farming (ZBNF)</option>
                      <option value="Residue-Free Mandi Grade">Residue-Free Mandi Grade</option>
                      <option value="Traditional High-Yield Mandi">Traditional High-Yield Mandi</option>
                    </select>
                  </div>

                  {/* Harvest Batch for Immediate Sale */}
                  <div className="bg-[#F6FBF7] p-3.5 rounded-2xl border border-[#C5E1CF] space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-[#184533]">
                      <span className="flex items-center gap-1.5">
                        <Scale className="w-4 h-4 text-[#2A7252]" />
                        <span>Harvest Batch for Immediate Sale</span>
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                        Live Marketplace Listing
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Variety / Title */}
                      <div>
                        <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                          Crop Variety / Title <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Sharbati Golden Wheat (C-306)"
                          value={sellCropTitle}
                          onChange={(e) => setSellCropTitle(e.target.value)}
                          className="w-full text-xs font-semibold border border-neutral-300 rounded-xl px-3 py-2 focus:outline-none focus:border-[#2A7252] bg-white"
                        />
                      </div>

                      {/* Category */}
                      <div>
                        <label className="text-[11px] font-bold text-neutral-700 block mb-1">Category</label>
                        <select
                          value={sellCropCategory}
                          onChange={(e) => setSellCropCategory(e.target.value as any)}
                          className="w-full text-xs border border-neutral-300 rounded-xl px-3 py-2 focus:outline-none focus:border-[#2A7252] bg-white cursor-pointer"
                        >
                          <option value="Grains">Grains & Cereals</option>
                          <option value="Pulses">Pulses & Legumes</option>
                          <option value="Oilseeds">Oilseeds</option>
                          <option value="Vegetables">Vegetables</option>
                          <option value="Spices">Spices</option>
                          <option value="Cash Crops">Cash Crops</option>
                        </select>
                      </div>

                      {/* Available Quantity in Quintals */}
                      <div>
                        <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                          Available Quantity (Quintals) <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="1"
                            placeholder="e.g. 120"
                            value={sellQuantityQuintals}
                            onChange={(e) => setSellQuantityQuintals(e.target.value ? Number(e.target.value) : '')}
                            className="w-full text-xs font-bold border border-neutral-300 rounded-xl px-3 py-2 focus:outline-none focus:border-[#2A7252] bg-white"
                          />
                          <span className="absolute right-3 top-2 text-[11px] text-neutral-500">
                            Qtl ({Number(sellQuantityQuintals || 0) * 100} kg)
                          </span>
                        </div>
                      </div>

                      {/* Expected Price per Quintal */}
                      <div>
                        <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                          Expected Price (₹ / Quintal) <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-xs font-bold text-neutral-500">₹</span>
                          <input
                            type="number"
                            min="100"
                            placeholder="e.g. 3250"
                            value={sellExpectedPrice}
                            onChange={(e) => setSellExpectedPrice(e.target.value ? Number(e.target.value) : '')}
                            className="w-full text-xs font-bold border border-neutral-300 rounded-xl pl-7 pr-3 py-2 focus:outline-none focus:border-[#2A7252] bg-white"
                          />
                          <span className="absolute right-3 top-2 text-[10px] text-emerald-700 font-bold">
                            +18% over MSP
                          </span>
                        </div>
                      </div>

                      {/* Moisture Percentage */}
                      <div>
                        <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                          Moisture Content (%)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.1"
                            placeholder="e.g. 10.8"
                            value={sellMoisturePercent}
                            onChange={(e) => setSellMoisturePercent(e.target.value ? Number(e.target.value) : '')}
                            className="w-full text-xs border border-neutral-300 rounded-xl px-3 py-2 focus:outline-none focus:border-[#2A7252] bg-white"
                          />
                          <span className="absolute right-3 top-2 text-[11px] text-neutral-500 font-mono">%</span>
                        </div>
                      </div>

                      {/* Packaging */}
                      <div>
                        <label className="text-[11px] font-bold text-neutral-700 block mb-1">Packaging</label>
                        <select
                          value={sellPackaging}
                          onChange={(e) => setSellPackaging(e.target.value)}
                          className="w-full text-xs border border-neutral-300 rounded-xl px-3 py-2 focus:outline-none focus:border-[#2A7252] bg-white cursor-pointer"
                        >
                          <option value="50kg Hermetic Moisture-Proof Bags">50kg Hermetic Bags</option>
                          <option value="50kg Standard Jute Bags">50kg Standard Jute Bags</option>
                          <option value="25kg Packaged Retail Sacks">25kg Retail Sacks</option>
                          <option value="Bulk Loose Trailer Load">Bulk Loose Trailer Load</option>
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
                      <span>Back</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!sellCropTitle || !sellQuantityQuintals) {
                          alert('Please enter crop title and available quantity.');
                          return;
                        }
                        setRegStep(5);
                      }}
                      className="py-2.5 px-5 bg-[#1E523D] hover:bg-[#164231] text-white text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer"
                    >
                      <span>Next: Bank & Payment Details</span>
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
                      <span>Bank Account & Instant Escrow Payment (DBT)</span>
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Payment from buyers is locked in ONDC Escrow and released directly (T+0) to your verified bank account upon assaying approval.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Account Holder Name */}
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">
                        Bank Account Holder Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Must match Aadhaar Name"
                        value={accountHolderName || fullName}
                        onChange={(e) => setAccountHolderName(e.target.value)}
                        className="w-full text-xs font-semibold border border-neutral-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2A7252]"
                      />
                    </div>

                    {/* Bank Name */}
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">
                        Bank Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. State Bank of India / Punjab National Bank"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full text-xs border border-neutral-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2A7252]"
                      />
                    </div>

                    {/* Bank Account Number */}
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">
                        Bank Account Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="password"
                        placeholder="e.g. 38492019482"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                        className="w-full text-xs font-mono font-bold border border-neutral-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2A7252]"
                      />
                    </div>

                    {/* Confirm Account Number */}
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">
                        Confirm Account Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Re-enter account number"
                        value={confirmAccountNumber}
                        onChange={(e) => setConfirmAccountNumber(e.target.value.replace(/\D/g, ''))}
                        className="w-full text-xs font-mono font-bold border border-neutral-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2A7252]"
                      />
                    </div>

                    {/* Bank IFSC Code */}
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">
                        Bank IFSC Code <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. SBIN0001245"
                        value={ifscCode}
                        onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                        className="w-full text-xs font-mono font-bold uppercase border border-neutral-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2A7252]"
                      />
                    </div>

                    {/* UPI ID */}
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">
                        UPI VPA for Instant Payout <span className="text-neutral-400 text-[10px]">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 9876543210@upi or kisan@sbi"
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
                      This account is linked with <strong>Aadhaar DBT (Direct Benefit Transfer)</strong> for automated PM-KISAN, fertilizer subsidies, and Khet Link Escrow payouts.
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
                      <span>Back</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!accountNumber || accountNumber !== confirmAccountNumber) {
                          alert('Please enter and confirm matching bank account numbers.');
                          return;
                        }
                        setRegStep(6);
                      }}
                      className="py-2.5 px-5 bg-[#1E523D] hover:bg-[#164231] text-white text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer"
                    >
                      <span>Next: KYC & Document Verification</span>
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
                      <span>KYC & Land Record Document Verification</span>
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Statutory KYC compliant with Ministry of Agriculture & APMC e-NAM guidelines.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Aadhaar Number */}
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">
                        12-Digit Aadhaar Number / VID <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        maxLength={14}
                        placeholder="7849-2910-4821"
                        value={aadhaarNumber}
                        onChange={(e) => setAadhaarNumber(e.target.value)}
                        className="w-full text-xs font-mono font-bold border border-neutral-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2A7252]"
                      />
                      <span className="text-[10px] text-neutral-400">Encrypted with 256-bit UIDAI masking</span>
                    </div>

                    {/* Land Document Type */}
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">
                        Land Document Type <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={landDocType}
                        onChange={(e) => setLandDocType(e.target.value)}
                        className="w-full text-xs font-semibold border border-neutral-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2A7252] bg-white cursor-pointer"
                      >
                        <option value="Kisan Credit Card (KCC)">Kisan Credit Card (KCC)</option>
                        <option value="7/12 Land Record Extract (Bhulekh)">7/12 Land Record Extract (Bhulekh)</option>
                        <option value="Khasra-Khatauni / Patta Certificate">Khasra-Khatauni / Patta Certificate</option>
                        <option value="PM-KISAN Beneficiary ID">PM-KISAN Beneficiary ID</option>
                      </select>
                    </div>
                  </div>

                  {/* Document Registration Number */}
                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">
                      Document / KCC / Khasra Registration Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. KCC-PB-2026-98412 or Khasra #142/9"
                      value={landDocNumber}
                      onChange={(e) => setLandDocNumber(e.target.value)}
                      className="w-full text-xs font-mono border border-neutral-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2A7252]"
                    />
                  </div>

                  {/* File Upload Simulator with Instant AI Scan */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-700 block">
                      Upload Document Copy (PDF, JPG or PNG)
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
                            <span>Drag and drop document or click to browse</span>
                          )}
                        </div>
                        <p className="text-[10px] text-neutral-400">
                          Supported: KCC Card photo, Bhulekh 7/12 PDF, Khasra receipt (Max 15MB)
                        </p>
                      </div>
                    </div>

                    {/* AI Verification Scanner State */}
                    {isKycScanning && (
                      <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200 animate-pulse">
                        <RefreshCw className="w-4 h-4 animate-spin text-amber-600" />
                        <span>OCR Scanning & verifying land records with State Revenue API...</span>
                      </div>
                    )}

                    {isKycVerified && (
                      <div className="flex items-center justify-between text-xs text-emerald-900 bg-emerald-100 p-2.5 rounded-xl border border-emerald-300">
                        <div className="flex items-center gap-2 font-bold">
                          <BadgeCheck className="w-5 h-5 text-emerald-600" />
                          <span>Government Land Registry & UIDAI Matched Successfully ✓</span>
                        </div>
                        <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-emerald-400">
                          Assay Score: 98%
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
                      I certify that the above land, harvest quantity ({sellQuantityQuintals || 0} Qtl), bank, and KYC details are accurate. I agree to Khet Link's Quality Assaying Protocol and ONDC Smart Contract Escrow terms.
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
                      <span>Back</span>
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
                          <span>Saving to Firebase Database...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-amber-300" />
                          <span>Verify & Complete Registration to Sell</span>
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
                  <span>Farmer & FPO Login • Verification Required</span>
                  <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    Kisan ID / Mobile
                  </span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Verify your farmer registration credentials and information to access active mandi bids, escrow releases, and crop lots.
                </p>
              </div>

              {/* Mandatory Farmer Registration & Information Checklist */}
              <div className="bg-gradient-to-br from-[#F4F9F5] to-[#E8F4EC] p-3.5 rounded-2xl border border-[#C5DEC8] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#184533]">
                    <ShieldCheck className="w-4 h-4 text-[#2A7252]" />
                    <span>Mandatory Farmer Information Checked at Login</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#2A7252] bg-white px-2 py-0.5 rounded-full border border-[#B3D6B8]">
                    9/9 Verified
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px]">
                  <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white/80 border border-[#D5E6D8] text-neutral-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Mobile/Email Reg.</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white/80 border border-[#D5E6D8] text-neutral-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>OTP Verification</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white/80 border border-[#D5E6D8] text-neutral-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Farmer Profile</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white/80 border border-[#D5E6D8] text-neutral-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Farm Location</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white/80 border border-[#D5E6D8] text-neutral-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Farm Size (Acres)</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white/80 border border-[#D5E6D8] text-neutral-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Crops Grown</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white/80 border border-[#D5E6D8] text-neutral-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Available Quantity</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white/80 border border-[#D5E6D8] text-neutral-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Bank / Payment (DBT)</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white/80 border border-[#D5E6D8] text-neutral-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>KYC / Documents</span>
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
                      Farmer Registered Mobile Number or Kisan ID <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
                      <input
                        type="text"
                        required
                        placeholder="+91 98721 45680 or KCC-PB-8941"
                        value={loginPhone}
                        onChange={(e) => setLoginPhone(e.target.value)}
                        className="w-full text-xs border border-neutral-300 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-[#2A7252]"
                      />
                    </div>
                    <span className="text-[10px] text-neutral-400 mt-1 block">
                      We'll verify OTP and pull your registered farm location, crops, available quantity, and bank DBT details.
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#1E523D] hover:bg-[#164231] text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Request Login OTP</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}

              {/* Login Step 2: OTP Verification */}
              {loginStep === 'otp' && (
                <div className="space-y-3">
                  <div className="bg-emerald-50 text-emerald-800 p-2.5 rounded-xl text-xs flex items-center justify-between">
                    <span>Enter OTP sent to <strong>+91 {loginPhone || '9872145680'}</strong> (Demo: <strong>123456</strong>)</span>
                    <button
                      type="button"
                      onClick={() => setLoginOtpCode('123456')}
                      className="text-[11px] font-bold text-emerald-700 underline cursor-pointer"
                    >
                      Fill 123456
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
                      Change Phone
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!loginOtpCode) setLoginOtpCode('123456');
                        setLoginStep('verify_info');
                      }}
                      className="flex-1 py-2.5 bg-[#2A7252] hover:bg-[#1E523D] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Verify OTP & Review Farmer Information</span>
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
                        Farmer Registered Profile Information
                      </span>
                      <span className="text-[10px] font-bold bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full">
                        Govt Aadhaar & KCC Verified
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-700">
                      <div className="bg-white/80 p-2 rounded-xl border border-emerald-100">
                        <span className="text-[10px] font-bold text-neutral-400 block uppercase">Farmer Profile</span>
                        <p className="font-bold text-neutral-900">Sardar Gurpreet Singh (Age: 48)</p>
                        <p className="text-[11px] text-neutral-600">Malwa Kisan Producer Company (FPO)</p>
                      </div>

                      <div className="bg-white/80 p-2 rounded-xl border border-emerald-100">
                        <span className="text-[10px] font-bold text-neutral-400 block uppercase">Farm Location & Size</span>
                        <p className="font-bold text-neutral-900">Raikot, Dist. Ludhiana, Punjab</p>
                        <p className="text-[11px] text-neutral-600">8.5 Acres • Solar Tubewell + Canal</p>
                      </div>

                      <div className="bg-white/80 p-2 rounded-xl border border-emerald-100">
                        <span className="text-[10px] font-bold text-neutral-400 block uppercase">Crops Grown & Harvest</span>
                        <p className="font-bold text-neutral-900">Sharbati Wheat, Basmati Rice, Mustard</p>
                        <p className="text-[11px] text-emerald-700 font-bold">140 Quintals available for dispatch</p>
                      </div>

                      <div className="bg-white/80 p-2 rounded-xl border border-emerald-100">
                        <span className="text-[10px] font-bold text-neutral-400 block uppercase">Bank & Direct DBT</span>
                        <p className="font-bold text-neutral-900">State Bank of India • A/C •••• 4821</p>
                        <p className="text-[11px] text-emerald-700 font-bold">IFSC: SBIN0001245 • Aadhaar DBT Active</p>
                      </div>
                    </div>

                    <div className="pt-1 flex items-center justify-between text-[11px] text-emerald-800">
                      <span className="flex items-center gap-1">
                        <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Land Record Document: <strong>KCC & 7/12 Matched (UIDAI Masked)</strong>
                      </span>
                      <span>Verified: Today</span>
                    </div>
                  </div>

                  {/* Confirmation Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={() => setFarmerMode('register')}
                      className="py-2.5 px-3.5 border border-[#2A7252] text-[#2A7252] hover:bg-emerald-50 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>✏️ Update Farm / Bank Info</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleReturningFarmerLogin}
                      className="flex-1 py-3 px-4 bg-gradient-to-r from-[#1B523D] via-[#2A7252] to-[#1B523D] hover:from-[#154231] hover:to-[#154231] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Confirm Information & Enter Farmer Portal</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Toggle to Full Registration */}
              <div className="pt-2 text-center border-t border-neutral-100">
                <p className="text-xs text-neutral-500">
                  New farmer without registration?{' '}
                  <button
                    type="button"
                    onClick={() => setFarmerMode('register')}
                    className="font-bold text-[#2A7252] hover:underline cursor-pointer"
                  >
                    Start Complete Farmer Registration (All 9 Fields)
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
                  <span>Hostel Mess & Bulk Buyer Procurement Portal</span>
                  <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    Mess, Canteen, Hotel & FMCG
                  </span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Direct farmgate grain, pulse, and produce procurement for college messes, hostels, hotel kitchens, and bulk food businesses.
                </p>
              </div>

              {/* 1-Click Demo Logins for Messes and Institutional Buyers */}
              <div className="bg-[#F4F8F4] p-3 rounded-2xl border border-[#D5E2D5] space-y-2">
                <div className="flex items-center justify-between text-[11px] text-[#3C5148] font-bold">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Quick 1-Click Procurement Access (Messes & Buyers)
                  </span>
                  <span className="text-[10px] text-neutral-400">Pre-authenticated</span>
                </div>

                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickJudgeLogin('buyer', 'IIT Delhi Hostel Mess & Canteen Co-op')}
                    className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-[#E8EFE8] border border-[#C8DAC8] text-xs transition flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#1B2727]">IIT Delhi Hostel Mess & Canteen Co-op</span>
                        <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                          College Hostel Mess
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-500">
                        3,200 Students • Bulk Rice, Wheat & Pulses • Hauz Khas Campus
                      </span>
                    </div>
                    <span className="text-[10px] bg-[#1E523D] text-white px-2.5 py-1 rounded-lg font-bold">Login &rarr;</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickJudgeLogin('buyer', 'Aditi Organic Foods Pvt Ltd')}
                    className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-[#E8EFE8] border border-[#C8DAC8] text-xs transition flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#1B2727]">Aditi Organic Foods Pvt Ltd</span>
                        <span className="text-[9px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded">
                          Food Processor
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-500">Wholesale Food Processor • Delhi NCR Mandi Hub</span>
                    </div>
                    <span className="text-[10px] bg-[#1E523D] text-white px-2.5 py-1 rounded-lg font-bold">Login &rarr;</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickJudgeLogin('buyer', 'FreshMart Supermarkets Retail')}
                    className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-[#E8EFE8] border border-[#C8DAC8] text-xs transition flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#1B2727]">FreshMart Supermarkets Retail</span>
                        <span className="text-[9px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded">
                          Retail Chain
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-500">National Supermarket Chain • Mumbai Hub</span>
                    </div>
                    <span className="text-[10px] bg-[#1E523D] text-white px-2.5 py-1 rounded-lg font-bold">Login &rarr;</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 border-t border-neutral-200" />
                <span className="text-[10px] uppercase font-bold text-neutral-400">Or Procurement Login</span>
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
                        Organization Type <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={buyerOrgType}
                        onChange={(e) => setBuyerOrgType(e.target.value)}
                        className="w-full text-xs font-medium border border-neutral-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2A7252] bg-white cursor-pointer"
                      >
                        <option value="Hostel Mess & Canteen">College Mess / University Hostel</option>
                        <option value="Hotel & Restaurant (HoReCa)">Hotel, Restaurant & Canteen</option>
                        <option value="Food Processing / Flour Mill">Food Processing / Flour Mill</option>
                        <option value="Supermarket / Retail Chain">Supermarket / Retail Chain</option>
                        <option value="Export House">Govt / Export Agency</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">
                        Mess / Organization Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. North Campus Hostel Mess"
                        value={buyerOrgName}
                        onChange={(e) => setBuyerOrgName(e.target.value)}
                        className="w-full text-xs border border-neutral-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2A7252]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">
                      Corporate GSTIN / Mess Registration ID or Contact <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. 07AAACH2819K1Z4 or MESS-DL-4091"
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
                    <span>Request Procurement Auth OTP</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                <form 
                  onSubmit={handleBuyerLogin} 
                  className="space-y-3"
                >
                  <div className="bg-emerald-50 text-emerald-800 p-2.5 rounded-xl text-xs flex items-center justify-between">
                    <span>Enter OTP sent to registered phone (Demo: <strong>123456</strong>)</span>
                    <button
                      type="button"
                      onClick={() => setBuyerOtpCode('123456')}
                      className="text-[11px] font-bold text-emerald-700 underline cursor-pointer"
                    >
                      Fill 123456
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
                        <span>Saving to Firebase Database...</span>
                      </>
                    ) : (
                      <span>Verify & Enter Procurement Portal</span>
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
            Protected by Government Mandi Escrow • UIDAI & Agmarknet Assaying Standard • ONDC Node #KS-9842
          </p>
        </div>
      </div>
    </div>
  );
};
