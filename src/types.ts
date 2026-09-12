export type AppView = 
  | 'home'
  | 'landing' 
  | 'marketplace' 
  | 'farmer-dashboard' 
  | 'buyer-dashboard' 
  | 'ai-predictions' 
  | 'orders' 
  | 'order-tracking'
  | 'fpo-collective'
  | 'contact';

export type UserRole = 'guest' | 'farmer' | 'buyer';

export interface CropProduct {
  id: string;
  title: string;
  category: 'Grains' | 'Pulses' | 'Vegetables' | 'Spices' | 'Oilseeds' | 'Cash Crops' | string;
  variety: string;
  pricePerQuintal: number;
  pricePerKg: number;
  mandiMspPrice: number;
  quantityAvailableQuintals: number;
  grade: 'Grade A+ Export' | 'Grade A Mandi' | 'Grade B Commercial' | string;
  isOrganic: boolean;
  moisturePercent: number;
  farmerId: string;
  farmerName: string;
  fpoName: string;
  locationState: string;
  locationDistrict: string;
  minOrderKg: number;
  harvestDate: string;
  imageUrl: string;
  description: string;
  shelfLifeDays: number;
  packagingType: string;
  readyForDispatch: boolean;
  rating: number;
  reviewCount: number;
  organicCertNumber?: string;
}

export interface CartItem {
  crop: CropProduct;
  quantity: number;
  unit: 'kg' | 'quintal';
}

export interface TrackingStep {
  step: string;
  label: string;
  date: string;
  completed: boolean;
  current: boolean;
  description: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  buyerName: string;
  buyerType: string;
  farmerName: string;
  fpoName: string;
  items: CartItem[];
  subtotal: number;
  logisticsFee: number;
  platformEscrowFee: number;
  totalAmount: number;
  escrowStatus: 'Held in Escrow' | 'Released to Farmer' | 'Disputed' | string;
  deliveryStatus: 'Order Placed' | 'Assaying Quality' | 'Dispatched' | 'In Transit' | 'Delivered' | string;
  deliveryAddress: string;
  estimatedDelivery: string;
  trackingSteps: TrackingStep[];
  vehicleNumber?: string;
  transporterName?: string;
}

export interface BulkRFQ {
  id: string;
  buyerName: string;
  cropName: string;
  category: string;
  requiredQuantityQuintals: number;
  targetPricePerQuintal: number;
  targetDate: string;
  deliveryState: string;
  qualitySpecs: string;
  responsesCount: number;
  status: 'Open' | 'Under Review' | 'Fulfilled' | 'Closed' | string;
}

export interface BankDetails {
  accountHolder: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  upiId?: string;
  dbtLinked?: boolean;
}

export interface KycDetails {
  aadhaarNumber: string;
  landRecordType: string;
  landRecordNumber: string;
  kycStatus: string;
  verifiedAt: string;
}

export interface FarmerProfile {
  id: string;
  name: string;
  fatherName?: string;
  gender?: 'Male' | 'Female' | 'Other';
  age?: number;
  phone: string;
  email?: string;
  kisanCreditCardNo?: string;
  village: string;
  district: string;
  state: string;
  tehsil?: string;
  pincode?: string;
  nearestMandi?: string;
  fpoName: string;
  fpoRegNo?: string;
  landAcres?: number;
  landAcreage?: number;
  irrigationType?: string;
  soilType?: string;
  primaryCrops?: string[];
  bankAccountVerified?: boolean;
  soilHealthCardVerified?: boolean;
  organicCertified?: boolean;
  rating: number;
  totalBatchesSold?: number;
  avatarUrl?: string;
  memberCount?: number;
  reviewsCount?: number;
  completedOrders?: number;
  bio?: string;
  experienceYears?: number;
  cropsGrown?: string[];
  certifications: string[];
  bankDetails?: BankDetails;
  kycDetails?: KycDetails;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'mandi' | 'escrow' | 'weather' | 'rfq' | 'system';
  badge?: string;
}

export interface TrendPoint {
  period: string;
  historical?: number;
  predicted?: number;
}

export interface PricePredictionData {
  cropName: string;
  category: string;
  currentMandiPrice: number;
  projectedPrice30d: number;
  projectedPrice60d: number;
  changePercentage: number;
  confidenceScore: number;
  mspPrice?: number;
  mspDifference: string;
  recommendation: string;
  bestSellWindow: string;
  drivingFactors: string[];
  trendPoints: TrendPoint[];
  channelComparison?: {
    channel: string;
    grossPrice: number;
    deductions: number;
    netReceived: number;
    settlementSpeed: string;
    trustScore: number;
  }[];
  monthlyHostelMessDemand?: {
    month: string;
    messDemandQuintals: number;
    mandiArrivals: number;
    seasonalNote: string;
  }[];
}

export interface DemandPredictionData {
  region: string;
  cropName: string;
  demandScore: 'Surging' | 'High' | 'Moderate';
  projectedGrowth: string;
  festivalMultiplier: string;
  weatherFactor: string;
  storageRecommendation: string;
  targetIndustries: string[];
  riskLevel: string;
}
