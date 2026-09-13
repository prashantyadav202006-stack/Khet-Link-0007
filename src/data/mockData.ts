import { 
  CropProduct, 
  FarmerProfile, 
  Order, 
  BulkRFQ, 
  PricePredictionData, 
  DemandPredictionData, 
  AppNotification 
} from '../types';

export const MANDI_TICKER = [
  { crop: 'Sharbati Wheat', mandi: 'Indore APMC', rate: '₹2,850/Qtl', change: '+₹110', up: true },
  { crop: 'Basmati 1121', mandi: 'Karnal APMC', rate: '₹3,920/Qtl', change: '+₹185', up: true },
  { crop: 'Yellow Mustard', mandi: 'Alwar APMC', rate: '₹5,750/Qtl', change: '+₹240', up: true },
  { crop: 'Malwa Soybean', mandi: 'Ujjain APMC', rate: '₹4,890/Qtl', change: '-₹40', up: false },
  { crop: 'Desi Chana', mandi: 'Bikaner APMC', rate: '₹5,680/Qtl', change: '+₹130', up: true },
  { crop: 'Nashik Red Onion', mandi: 'Lasalgaon APMC', rate: '₹1,950/Qtl', change: '+₹90', up: true },
  { crop: 'Tur Dal (Arhar)', mandi: 'Gulbarga APMC', rate: '₹9,800/Qtl', change: '+₹310', up: true },
  { crop: 'Shankar Cotton', mandi: 'Rajkot APMC', rate: '₹7,150/Qtl', change: '-₹75', up: false },
  { crop: 'Unjha Cumin (Jeera)', mandi: 'Unjha APMC', rate: '₹28,400/Qtl', change: '+₹650', up: true },
];

export const MOCK_FARMERS: FarmerProfile[] = [];

export const MOCK_CROPS: CropProduct[] = [];

export const MOCK_ORDERS: Order[] = [
  // Order 1: FULLY DELIVERED & SETTLED — escrow released to farmer
  {
    id: 'ord-demo-001',
    orderNumber: 'KS-2026-4821',
    createdAt: '2026-09-01T06:30:00.000Z',
    buyerName: 'Aditi Organic Foods Pvt Ltd',
    buyerType: 'FMCG Wholesaler',
    farmerName: 'Sardar Gurpreet Singh',
    fpoName: 'Malwa Organic Farmers Producer Co.',
    items: [
      {
        crop: {
          id: 'crop-demo-w1',
          title: 'Sharbati MP Golden Wheat',
          category: 'Grains',
          variety: 'Sehore Sharbati (MP Origin)',
          pricePerQuintal: 2850,
          pricePerKg: 29,
          mandiMspPrice: 2275,
          quantityAvailableQuintals: 120,
          grade: 'Grade A+ Export',
          isOrganic: true,
          moisturePercent: 10.2,
          farmerId: 'f-demo-1',
          farmerName: 'Sardar Gurpreet Singh',
          fpoName: 'Malwa Organic Farmers Producer Co.',
          locationState: 'Punjab',
          locationDistrict: 'Bathinda',
          minOrderKg: 50,
          harvestDate: 'Rabi 2026',
          imageUrl: '/crops/wheat.jpg',
          description: 'Premium export-grade Sharbati wheat from Malwa belt.',
          shelfLifeDays: 365,
          packagingType: '50kg Jute Bags',
          readyForDispatch: true,
          rating: 4.9,
          reviewCount: 12
        },
        quantity: 80,
        unit: 'quintal'
      }
    ],
    subtotal: 228000,
    logisticsFee: 4500,
    platformEscrowFee: 0,
    totalAmount: 232500,
    escrowStatus: 'Escrow Released / Farmer Paid',
    deliveryStatus: 'Escrow Released',
    deliveryAddress: 'Warehouse 7, Sector 18, Gurugram, Haryana 122015',
    estimatedDelivery: 'Delivered on 05 Sep 2026',
    vehicleNumber: 'PB-03-AK-4477',
    transporterName: 'Bharat Cold Chain Logistics',
    trackingSteps: [
      { step: '1', label: 'Order Placed & Escrow Funded', date: '01 Sep 2026, 12:00 PM', completed: true, current: false, description: 'Rs.2,32,500 securely locked in KhetLink Escrow.' },
      { step: '2', label: 'FPO Order Accepted', date: '01 Sep 2026, 03:15 PM', completed: true, current: false, description: 'Malwa Organic Farmers Producer Co. confirmed availability and fulfillment.' },
      { step: '3', label: 'Quality Sample Collected', date: '02 Sep 2026, 08:00 AM', completed: true, current: false, description: 'Representative sample collected at FPO collection point for quality testing.' },
      { step: '4', label: 'Quality Verified', date: '02 Sep 2026, 09:15 AM', completed: true, current: false, description: 'Moisture: 10.2% • Grade: A+ Export • Organic certified.' },
      { step: '5', label: 'Dispatched from FPO/Farmgate', date: '02 Sep 2026, 02:30 PM', completed: true, current: false, description: 'Quality-approved consignment handed over to Bharat Cold Chain Logistics. Vehicle: PB-03-AK-4477.' },
      { step: '6', label: 'In Transit', date: '03 Sep 2026, 06:00 AM', completed: true, current: false, description: 'Real-time logistics tracking active. Crossed Rajpura toll, ETA Gurugram 12 hrs.' },
      { step: '7', label: 'Delivered & Delivery Verified', date: '05 Sep 2026, 10:30 AM', completed: true, current: false, description: '80 Qtl received. Weight verified. Buyer confirmation recorded.' },
      { step: '8', label: 'Escrow Released / Farmer Paid', date: '05 Sep 2026, 10:45 AM', completed: true, current: true, description: 'Delivery verified. Rs.2,32,500 released to farmer/FPO via DBT.' }
    ]
  },

  // Order 2: IN TRANSIT — escrow still held
  {
    id: 'ord-demo-002',
    orderNumber: 'KS-2026-5193',
    createdAt: '2026-09-10T08:00:00.000Z',
    buyerName: 'ITC Aashirvaad Grains Division',
    buyerType: 'FMCG Corporate',
    farmerName: 'Ramesh Choudhary',
    fpoName: 'Shekhawati Kisan Producer Co.',
    items: [
      {
        crop: {
          id: 'crop-demo-m1',
          title: 'Rajasthan Yellow Bold Mustard',
          category: 'Oilseeds',
          variety: 'RH-749 Bold Yellow',
          pricePerQuintal: 5750,
          pricePerKg: 58,
          mandiMspPrice: 5650,
          quantityAvailableQuintals: 60,
          grade: 'Grade A Mandi',
          isOrganic: false,
          moisturePercent: 7.8,
          farmerId: 'f-demo-2',
          farmerName: 'Ramesh Choudhary',
          fpoName: 'Shekhawati Kisan Producer Co.',
          locationState: 'Rajasthan',
          locationDistrict: 'Alwar',
          minOrderKg: 100,
          harvestDate: 'Rabi 2026',
          imageUrl: '/crops/mustard.jpg',
          description: 'High oil-content bold mustard from Shekhawati region.',
          shelfLifeDays: 270,
          packagingType: '50kg PP Bags',
          readyForDispatch: true,
          rating: 4.7,
          reviewCount: 8
        },
        quantity: 40,
        unit: 'quintal'
      }
    ],
    subtotal: 230000,
    logisticsFee: 5200,
    platformEscrowFee: 0,
    totalAmount: 235200,
    escrowStatus: 'Held in Escrow',
    deliveryStatus: 'In Transit',
    deliveryAddress: 'ITC Procurement Hub, Sahibabad Industrial Area, Ghaziabad, UP 201010',
    estimatedDelivery: 'Expected 13 Sep 2026',
    vehicleNumber: 'RJ-02-GA-8891',
    transporterName: 'Kisan Rail Freight Services',
    trackingSteps: [
      { step: '1', label: 'Order Placed & Escrow Funded', date: '10 Sep 2026, 01:30 PM', completed: true, current: false, description: 'Rs.2,35,200 securely locked in KhetLink Escrow.' },
      { step: '2', label: 'FPO Order Accepted', date: '10 Sep 2026, 02:45 PM', completed: true, current: false, description: 'Shekhawati Kisan Producer Co. confirmed availability and fulfillment.' },
      { step: '3', label: 'Quality Sample Collected', date: '10 Sep 2026, 03:30 PM', completed: true, current: false, description: 'Representative sample collected at FPO collection point for quality testing.' },
      { step: '4', label: 'Quality Verified', date: '10 Sep 2026, 04:00 PM', completed: true, current: false, description: 'Moisture: 7.8% • Oil content: 43.1% • Grade: A Mandi.' },
      { step: '5', label: 'Dispatched from FPO/Farmgate', date: '11 Sep 2026, 06:00 AM', completed: true, current: false, description: 'Quality-approved consignment handed over to Kisan Rail Freight Services. Vehicle: RJ-02-GA-8891.' },
      { step: '6', label: 'In Transit', date: '11 Sep 2026, 02:00 PM', completed: false, current: true, description: 'Real-time logistics tracking active. En route via NH-48, ETA Ghaziabad 13 Sep.' },
      { step: '7', label: 'Delivered & Delivery Verified', date: 'Pending', completed: false, current: false, description: 'Digital delivery verification pending.' },
      { step: '8', label: 'Escrow Released / Farmer Paid', date: 'Pending', completed: false, current: false, description: 'T+0 settlement after verified delivery.' }
    ]
  },

  // Order 3: QUALITY SAMPLE COLLECTED — early stage
  {
    id: 'ord-demo-003',
    orderNumber: 'KS-2026-5287',
    createdAt: '2026-09-12T10:15:00.000Z',
    buyerName: 'Haldiram Snacks Pvt Ltd',
    buyerType: 'Food Processor',
    farmerName: 'Sunita Devi Patel',
    fpoName: 'Bundelkhand Mahila Kisan FPO',
    items: [
      {
        crop: {
          id: 'crop-demo-c1',
          title: 'Desi Whole Chana',
          category: 'Pulses',
          variety: 'JG-16 Desi Kabuli',
          pricePerQuintal: 5680,
          pricePerKg: 57,
          mandiMspPrice: 5440,
          quantityAvailableQuintals: 45,
          grade: 'Grade A Mandi',
          isOrganic: false,
          moisturePercent: 9.5,
          farmerId: 'f-demo-3',
          farmerName: 'Sunita Devi Patel',
          fpoName: 'Bundelkhand Mahila Kisan FPO',
          locationState: 'Madhya Pradesh',
          locationDistrict: 'Sagar',
          minOrderKg: 50,
          harvestDate: 'Rabi 2026',
          imageUrl: '/crops/chana.jpg',
          description: 'Clean machine-sorted Desi chana from Bundelkhand.',
          shelfLifeDays: 365,
          packagingType: '50kg Jute Bags',
          readyForDispatch: true,
          rating: 4.8,
          reviewCount: 6
        },
        quantity: 30,
        unit: 'quintal'
      }
    ],
    subtotal: 170400,
    logisticsFee: 3800,
    platformEscrowFee: 0,
    totalAmount: 174200,
    escrowStatus: 'Held in Escrow',
    deliveryStatus: 'Sample Collected',
    deliveryAddress: 'Haldiram Processing Unit, Nagpur MIDC, Maharashtra 440001',
    estimatedDelivery: 'Expected 16 Sep 2026',
    trackingSteps: [
      { step: '1', label: 'Order Placed & Escrow Funded', date: '12 Sep 2026, 03:45 PM', completed: true, current: false, description: 'Rs.1,74,200 securely locked in KhetLink Escrow.' },
      { step: '2', label: 'FPO Order Accepted', date: '12 Sep 2026, 05:00 PM', completed: true, current: false, description: 'Bundelkhand Mahila Kisan FPO confirmed availability and fulfillment.' },
      { step: '3', label: 'Quality Sample Collected', date: '13 Sep 2026, 09:00 AM', completed: false, current: true, description: 'Representative sample collected at FPO collection point for quality testing.' },
      { step: '4', label: 'Quality Verified', date: 'Pending', completed: false, current: false, description: 'Sample undergoing quality verification.' },
      { step: '5', label: 'Dispatched from FPO/Farmgate', date: 'Pending', completed: false, current: false, description: 'Awaiting quality approval before dispatch.' },
      { step: '6', label: 'In Transit', date: 'Pending', completed: false, current: false, description: 'Logistics tracking will activate after dispatch.' },
      { step: '7', label: 'Delivered & Delivery Verified', date: 'Pending', completed: false, current: false, description: 'Digital delivery verification pending.' },
      { step: '8', label: 'Escrow Released / Farmer Paid', date: 'Pending', completed: false, current: false, description: 'T+0 settlement after verified delivery.' }
    ]
  },

  // Order 4: FULLY COMPLETED — second completed order
  {
    id: 'ord-demo-004',
    orderNumber: 'KS-2026-4650',
    createdAt: '2026-08-25T05:00:00.000Z',
    buyerName: 'Mother Dairy Fruits & Vegetables Ltd',
    buyerType: 'Cooperative Dairy / Retail',
    farmerName: 'Harpal Singh Gill',
    fpoName: 'Doaba Sabzi Utpadak Samiti',
    items: [
      {
        crop: {
          id: 'crop-demo-o1',
          title: 'Nashik Red Onion',
          category: 'Vegetables',
          variety: 'N-53 Dark Red',
          pricePerQuintal: 1950,
          pricePerKg: 20,
          mandiMspPrice: 1400,
          quantityAvailableQuintals: 200,
          grade: 'Grade A Mandi',
          isOrganic: false,
          moisturePercent: 82,
          farmerId: 'f-demo-4',
          farmerName: 'Harpal Singh Gill',
          fpoName: 'Doaba Sabzi Utpadak Samiti',
          locationState: 'Maharashtra',
          locationDistrict: 'Nashik',
          minOrderKg: 100,
          harvestDate: 'Kharif 2026',
          imageUrl: '/crops/onion.jpg',
          description: 'Premium export-quality dark red onions from Nashik.',
          shelfLifeDays: 45,
          packagingType: '25kg Mesh Bags',
          readyForDispatch: true,
          rating: 4.6,
          reviewCount: 15
        },
        quantity: 150,
        unit: 'quintal'
      }
    ],
    subtotal: 292500,
    logisticsFee: 8500,
    platformEscrowFee: 0,
    totalAmount: 301000,
    escrowStatus: 'Escrow Released / Farmer Paid',
    deliveryStatus: 'Escrow Released',
    deliveryAddress: 'Mother Dairy Cold Storage, Patparganj, New Delhi 110091',
    estimatedDelivery: 'Delivered on 28 Aug 2026',
    vehicleNumber: 'MH-15-CQ-2203',
    transporterName: 'Reefer Express Agri Logistics',
    trackingSteps: [
      { step: '1', label: 'Order Placed & Escrow Funded', date: '25 Aug 2026, 10:30 AM', completed: true, current: false, description: 'Rs.3,01,000 securely locked in KhetLink Escrow.' },
      { step: '2', label: 'FPO Order Accepted', date: '25 Aug 2026, 11:45 AM', completed: true, current: false, description: 'Doaba Sabzi Utpadak Samiti confirmed availability and fulfillment.' },
      { step: '3', label: 'Quality Sample Collected', date: '25 Aug 2026, 02:00 PM', completed: true, current: false, description: 'Representative sample collected at FPO collection point for quality testing.' },
      { step: '4', label: 'Quality Verified', date: '25 Aug 2026, 03:00 PM', completed: true, current: false, description: 'Grade: A Mandi • No sprouting • Firmness test passed.' },
      { step: '5', label: 'Dispatched from FPO/Farmgate', date: '26 Aug 2026, 05:00 AM', completed: true, current: false, description: 'Quality-approved consignment handed over to Reefer Express Agri Logistics. Vehicle: MH-15-CQ-2203.' },
      { step: '6', label: 'In Transit', date: '26 Aug 2026, 12:00 PM', completed: true, current: false, description: 'Real-time logistics tracking active. Crossed Jaipur bypass, temperature maintained at 4°C.' },
      { step: '7', label: 'Delivered & Delivery Verified', date: '28 Aug 2026, 08:00 AM', completed: true, current: false, description: '150 Qtl received. Weight verified. Buyer confirmation recorded.' },
      { step: '8', label: 'Escrow Released / Farmer Paid', date: '28 Aug 2026, 08:15 AM', completed: true, current: true, description: 'Delivery verified. Rs.3,01,000 released to farmer/FPO via DBT.' }
    ]
  }
];

export const MOCK_RFQS: BulkRFQ[] = [
  {
    id: 'rfq-1',
    buyerName: 'Patanjali Organic Foods Division',
    cropName: 'Sharbati MP Golden Wheat',
    category: 'Grains',
    requiredQuantityQuintals: 500,
    targetPricePerQuintal: 2900,
    targetDate: '2026-10-15',
    deliveryState: 'Haridwar, Uttarakhand',
    qualitySpecs: 'Moisture < 10.5%, clean destoned, minimum 13% protein, hermetic packed',
    responsesCount: 6,
    status: 'Open'
  },
  {
    id: 'rfq-2',
    buyerName: 'Marico Edible Oils Procurement',
    cropName: 'Rajasthan Yellow Bold Mustard',
    category: 'Oilseeds',
    requiredQuantityQuintals: 350,
    targetPricePerQuintal: 5800,
    targetDate: '2026-09-30',
    deliveryState: 'Jaipur, Rajasthan',
    qualitySpecs: 'Guaranteed 42%+ oil content, moisture < 8%, zero argemone seeds',
    responsesCount: 9,
    status: 'Open'
  },
  {
    id: 'rfq-3',
    buyerName: 'ITC Aashirvaad Grains Division',
    cropName: 'Desi Whole Chana Chickpeas',
    category: 'Pulses',
    requiredQuantityQuintals: 250,
    targetPricePerQuintal: 5750,
    targetDate: '2026-10-05',
    deliveryState: 'Nagpur, Maharashtra',
    qualitySpecs: 'Machine cleaned, zero weevil damage, 50kg bags',
    responsesCount: 4,
    status: 'Open'
  }
];

export const MOCK_PRICE_PREDICTIONS: PricePredictionData[] = [
  {
    cropName: 'Sharbati Wheat (Grade A)',
    category: 'Grains',
    currentMandiPrice: 2850,
    projectedPrice30d: 3120,
    projectedPrice60d: 3340,
    changePercentage: 9.5,
    confidenceScore: 94,
    mspPrice: 2275,
    mspDifference: '+₹575 above MSP',
    recommendation: 'HOLD in warehouse. Anticipated Diwali festival surge and export parity quota in October will lift spot rates by 8-11%.',
    bestSellWindow: '15 Oct - 05 Nov 2026',
    drivingFactors: [
      'Central wheat buffer stock at 8-year seasonal low',
      'Flour mills operating at 92% capacity in Delhi NCR & Gujarat',
      'Festive pre-booking inquiries up 26% on e-NAM portals',
      'Stable diesel logistics prices supporting farmgate margins'
    ],
    trendPoints: [
      { period: 'Apr 26', historical: 2450 },
      { period: 'May 26', historical: 2520 },
      { period: 'Jun 26', historical: 2600 },
      { period: 'Jul 26', historical: 2710 },
      { period: 'Aug 26', historical: 2790 },
      { period: 'Sep 26', historical: 2850, predicted: 2850 },
      { period: 'Oct 26', predicted: 3120 },
      { period: 'Nov 26', predicted: 3340 },
    ],
    channelComparison: [
      {
        channel: 'Village Middleman (Arhatia)',
        grossPrice: 2450,
        deductions: 270,
        netReceived: 2180,
        settlementSpeed: '30-45 Days (Credit)',
        trustScore: 42
      },
      {
        channel: 'Physical APMC Mandi Yard',
        grossPrice: 2650,
        deductions: 220,
        netReceived: 2430,
        settlementSpeed: '7-14 Days',
        trustScore: 68
      },
      {
        channel: 'Khet Link Direct (Hostel Mess & Mills)',
        grossPrice: 2850,
        deductions: 0,
        netReceived: 2850,
        settlementSpeed: 'T+0 Instant DBT',
        trustScore: 99
      }
    ],
    monthlyHostelMessDemand: [
      { month: 'Jan', messDemandQuintals: 380, mandiArrivals: 120, seasonalNote: 'Semester Reopening Peak' },
      { month: 'Feb', messDemandQuintals: 420, mandiArrivals: 90, seasonalNote: 'High Consumption' },
      { month: 'Mar', messDemandQuintals: 390, mandiArrivals: 280, seasonalNote: 'Pre-Exam Term' },
      { month: 'Apr', messDemandQuintals: 210, mandiArrivals: 820, seasonalNote: 'Rabi Harvest Glut (Low Price)' },
      { month: 'May', messDemandQuintals: 110, mandiArrivals: 650, seasonalNote: 'Summer Vacation Dip' },
      { month: 'Jun', messDemandQuintals: 90, mandiArrivals: 340, seasonalNote: 'Lowest Mess Inflow' },
      { month: 'Jul', messDemandQuintals: 490, mandiArrivals: 210, seasonalNote: 'Mega Monsoon Admission Surge' },
      { month: 'Aug', messDemandQuintals: 520, mandiArrivals: 180, seasonalNote: 'Peak Student Mess Procurement' },
      { month: 'Sep', messDemandQuintals: 480, mandiArrivals: 150, seasonalNote: 'Steady Academic Run' },
      { month: 'Oct', messDemandQuintals: 510, mandiArrivals: 130, seasonalNote: 'Diwali Feast Demand' },
      { month: 'Nov', messDemandQuintals: 460, mandiArrivals: 160, seasonalNote: 'Winter Procurement' },
      { month: 'Dec', messDemandQuintals: 290, mandiArrivals: 190, seasonalNote: 'Winter Break Slowdown' }
    ]
  },
  {
    cropName: 'Basmati 1121 Paddy',
    category: 'Grains',
    currentMandiPrice: 3920,
    projectedPrice30d: 4250,
    projectedPrice60d: 4480,
    changePercentage: 8.4,
    confidenceScore: 91,
    mspPrice: 3200,
    mspDifference: '+₹720 above MSP',
    recommendation: 'SELL 40% NOW to cover harvesting costs; store 60% aged stock for Middle East winter shipping contracts.',
    bestSellWindow: '01 Nov - 20 Nov 2026',
    drivingFactors: [
      'Saudi Arabia and UAE forward contracts opened at $1,150/MT',
      'Lower acreage in Western UP due to early erratic monsoon',
      'Domestic wedding season demand peaks in November'
    ],
    trendPoints: [
      { period: 'Apr 26', historical: 3400 },
      { period: 'May 26', historical: 3550 },
      { period: 'Jun 26', historical: 3680 },
      { period: 'Jul 26', historical: 3800 },
      { period: 'Aug 26', historical: 3880 },
      { period: 'Sep 26', historical: 3920, predicted: 3920 },
      { period: 'Oct 26', predicted: 4250 },
      { period: 'Nov 26', predicted: 4480 },
    ],
    channelComparison: [
      {
        channel: 'Village Middleman (Arhatia)',
        grossPrice: 3350,
        deductions: 360,
        netReceived: 2990,
        settlementSpeed: '45-60 Days',
        trustScore: 40
      },
      {
        channel: 'Physical APMC Mandi Yard',
        grossPrice: 3680,
        deductions: 280,
        netReceived: 3400,
        settlementSpeed: '10-20 Days',
        trustScore: 70
      },
      {
        channel: 'Khet Link Direct (Hostel Mess & Mills)',
        grossPrice: 3920,
        deductions: 0,
        netReceived: 3920,
        settlementSpeed: 'T+0 Instant DBT',
        trustScore: 99
      }
    ],
    monthlyHostelMessDemand: [
      { month: 'Jan', messDemandQuintals: 280, mandiArrivals: 180, seasonalNote: 'Hostel Special Meals' },
      { month: 'Feb', messDemandQuintals: 310, mandiArrivals: 140, seasonalNote: 'Annual Fest & Canteens' },
      { month: 'Mar', messDemandQuintals: 290, mandiArrivals: 110, seasonalNote: 'Standard Mess Run' },
      { month: 'Apr', messDemandQuintals: 220, mandiArrivals: 90, seasonalNote: 'Pre-Exam Term' },
      { month: 'May', messDemandQuintals: 90, mandiArrivals: 60, seasonalNote: 'Summer Recess' },
      { month: 'Jun', messDemandQuintals: 80, mandiArrivals: 50, seasonalNote: 'Off-Peak' },
      { month: 'Jul', messDemandQuintals: 350, mandiArrivals: 80, seasonalNote: 'New Academic Batches' },
      { month: 'Aug', messDemandQuintals: 390, mandiArrivals: 90, seasonalNote: 'College Hostels Active' },
      { month: 'Sep', messDemandQuintals: 360, mandiArrivals: 120, seasonalNote: 'Steady Demand' },
      { month: 'Oct', messDemandQuintals: 440, mandiArrivals: 410, seasonalNote: 'Kharif Arrivals & Feasts' },
      { month: 'Nov', messDemandQuintals: 480, mandiArrivals: 520, seasonalNote: 'Wedding Season & Hostels' },
      { month: 'Dec', messDemandQuintals: 260, mandiArrivals: 320, seasonalNote: 'Winter Vacation' }
    ]
  },
  {
    cropName: 'Yellow Bold Mustard',
    category: 'Oilseeds',
    currentMandiPrice: 5750,
    projectedPrice30d: 6180,
    projectedPrice60d: 6350,
    changePercentage: 7.5,
    confidenceScore: 93,
    mspPrice: 5450,
    mspDifference: '+₹300 above MSP',
    recommendation: 'SELL NOW if you lack hermetic cold storage. Moisture risk in coastal states might cause mold.',
    bestSellWindow: 'Current window - 25 Sep 2026',
    drivingFactors: [
      'Import duty on crude palm oil increased by 7.5%',
      'Domestic oil mill crushing parity at historic high of ₹480/Qtl',
      'Low pipeline inventories with major FMCG edible oil brands'
    ],
    trendPoints: [
      { period: 'Apr 26', historical: 5100 },
      { period: 'May 26', historical: 5320 },
      { period: 'Jun 26', historical: 5450 },
      { period: 'Jul 26', historical: 5600 },
      { period: 'Aug 26', historical: 5690 },
      { period: 'Sep 26', historical: 5750, predicted: 5750 },
      { period: 'Oct 26', predicted: 6180 },
      { period: 'Nov 26', predicted: 6350 },
    ],
    channelComparison: [
      {
        channel: 'Village Middleman (Arhatia)',
        grossPrice: 5100,
        deductions: 450,
        netReceived: 4650,
        settlementSpeed: '20-30 Days',
        trustScore: 45
      },
      {
        channel: 'Physical APMC Mandi Yard',
        grossPrice: 5450,
        deductions: 320,
        netReceived: 5130,
        settlementSpeed: '7-14 Days',
        trustScore: 72
      },
      {
        channel: 'Khet Link Direct (Hostel Mess & Mills)',
        grossPrice: 5750,
        deductions: 0,
        netReceived: 5750,
        settlementSpeed: 'T+0 Instant DBT',
        trustScore: 99
      }
    ],
    monthlyHostelMessDemand: [
      { month: 'Jan', messDemandQuintals: 120, mandiArrivals: 80, seasonalNote: 'Mess Cooking Oil' },
      { month: 'Feb', messDemandQuintals: 140, mandiArrivals: 240, seasonalNote: 'Harvest Starts' },
      { month: 'Mar', messDemandQuintals: 130, mandiArrivals: 580, seasonalNote: 'Peak Arrivals' },
      { month: 'Apr', messDemandQuintals: 110, mandiArrivals: 420, seasonalNote: 'Oil Mills Crushing' },
      { month: 'May', messDemandQuintals: 60, mandiArrivals: 220, seasonalNote: 'Summer Dip' },
      { month: 'Jun', messDemandQuintals: 50, mandiArrivals: 140, seasonalNote: 'Off Season' },
      { month: 'Jul', messDemandQuintals: 150, mandiArrivals: 90, seasonalNote: 'Hostels Reopen' },
      { month: 'Aug', messDemandQuintals: 170, mandiArrivals: 70, seasonalNote: 'Canteens & Mess Active' },
      { month: 'Sep', messDemandQuintals: 180, mandiArrivals: 60, seasonalNote: 'Pre-Festive Stocking' },
      { month: 'Oct', messDemandQuintals: 210, mandiArrivals: 50, seasonalNote: 'Diwali Sweet Fry Peak' },
      { month: 'Nov', messDemandQuintals: 190, mandiArrivals: 60, seasonalNote: 'Winter Snacking Demand' },
      { month: 'Dec', messDemandQuintals: 130, mandiArrivals: 70, seasonalNote: 'End of Term' }
    ]
  },
  {
    cropName: 'Nashik Red Onion',
    category: 'Vegetables',
    currentMandiPrice: 1950,
    projectedPrice30d: 2450,
    projectedPrice60d: 2100,
    changePercentage: 25.6,
    confidenceScore: 88,
    mspPrice: 1650,
    mspDifference: '+₹300 over average',
    recommendation: 'CRITICAL WINDOW: Sell between 20 Sep and 10 Oct before late Kharif arrivals flood southern mandis.',
    bestSellWindow: '20 Sep - 10 Oct 2026',
    drivingFactors: [
      'Storage losses in Lasalgaon chawls due to August humidity',
      'Consumer retail rates touching ₹45/kg in metro areas',
      'Buffer procurement by NAFED completed 2.5 lakh tonnes'
    ],
    trendPoints: [
      { period: 'Apr 26', historical: 1200 },
      { period: 'May 26', historical: 1400 },
      { period: 'Jun 26', historical: 1650 },
      { period: 'Jul 26', historical: 1800 },
      { period: 'Aug 26', historical: 1890 },
      { period: 'Sep 26', historical: 1950, predicted: 1950 },
      { period: 'Oct 26', predicted: 2450 },
      { period: 'Nov 26', predicted: 2100 },
    ],
    channelComparison: [
      {
        channel: 'Village Middleman (Arhatia)',
        grossPrice: 1550,
        deductions: 290,
        netReceived: 1260,
        settlementSpeed: '15-30 Days',
        trustScore: 40
      },
      {
        channel: 'Physical APMC Mandi Yard',
        grossPrice: 1800,
        deductions: 210,
        netReceived: 1590,
        settlementSpeed: '5-10 Days',
        trustScore: 68
      },
      {
        channel: 'Khet Link Direct (Hostel Mess & Mills)',
        grossPrice: 1950,
        deductions: 0,
        netReceived: 1950,
        settlementSpeed: 'T+0 Instant DBT',
        trustScore: 99
      }
    ],
    monthlyHostelMessDemand: [
      { month: 'Jan', messDemandQuintals: 220, mandiArrivals: 340, seasonalNote: 'Hostel Sabzi Base' },
      { month: 'Feb', messDemandQuintals: 240, mandiArrivals: 380, seasonalNote: 'High Daily Consumption' },
      { month: 'Mar', messDemandQuintals: 210, mandiArrivals: 410, seasonalNote: 'Rabi Harvest Glut' },
      { month: 'Apr', messDemandQuintals: 160, mandiArrivals: 490, seasonalNote: 'Surplus Arrivals' },
      { month: 'May', messDemandQuintals: 80, mandiArrivals: 310, seasonalNote: 'Summer Recess' },
      { month: 'Jun', messDemandQuintals: 70, mandiArrivals: 180, seasonalNote: 'Chawl Storage Begins' },
      { month: 'Jul', messDemandQuintals: 260, mandiArrivals: 140, seasonalNote: 'College Reopening' },
      { month: 'Aug', messDemandQuintals: 280, mandiArrivals: 110, seasonalNote: 'Moisture Spoilage Season' },
      { month: 'Sep', messDemandQuintals: 290, mandiArrivals: 90, seasonalNote: 'Low Supply Window' },
      { month: 'Oct', messDemandQuintals: 320, mandiArrivals: 80, seasonalNote: 'Peak Price Surge' },
      { month: 'Nov', messDemandQuintals: 310, mandiArrivals: 240, seasonalNote: 'Kharif Harvest Arrives' },
      { month: 'Dec', messDemandQuintals: 180, mandiArrivals: 310, seasonalNote: 'Price Normalization' }
    ]
  },
  {
    cropName: 'Desi Whole Chana',
    category: 'Pulses',
    currentMandiPrice: 5680,
    projectedPrice30d: 6050,
    projectedPrice60d: 6200,
    changePercentage: 6.5,
    confidenceScore: 92,
    mspPrice: 5335,
    mspDifference: '+₹345 above MSP',
    recommendation: 'HOLD for 30 days. Besan millers actively bidding upfront deposits.',
    bestSellWindow: '10 Oct - 30 Oct 2026',
    drivingFactors: [
      'Yellow pea import window closing 31 Oct',
      'Diwali sweet confectioners procurement volume up 32%',
      'Stock monitoring mandates easing for cooperative societies'
    ],
    trendPoints: [
      { period: 'Apr 26', historical: 5150 },
      { period: 'May 26', historical: 5300 },
      { period: 'Jun 26', historical: 5420 },
      { period: 'Jul 26', historical: 5550 },
      { period: 'Aug 26', historical: 5610 },
      { period: 'Sep 26', historical: 5680, predicted: 5680 },
      { period: 'Oct 26', predicted: 6050 },
      { period: 'Nov 26', predicted: 6200 },
    ],
    channelComparison: [
      {
        channel: 'Village Middleman (Arhatia)',
        grossPrice: 4950,
        deductions: 420,
        netReceived: 4530,
        settlementSpeed: '30-45 Days',
        trustScore: 42
      },
      {
        channel: 'Physical APMC Mandi Yard',
        grossPrice: 5350,
        deductions: 310,
        netReceived: 5040,
        settlementSpeed: '7-14 Days',
        trustScore: 71
      },
      {
        channel: 'Khet Link Direct (Hostel Mess & Mills)',
        grossPrice: 5680,
        deductions: 0,
        netReceived: 5680,
        settlementSpeed: 'T+0 Instant DBT',
        trustScore: 99
      }
    ],
    monthlyHostelMessDemand: [
      { month: 'Jan', messDemandQuintals: 190, mandiArrivals: 90, seasonalNote: 'Dal & Chana Mess Diet' },
      { month: 'Feb', messDemandQuintals: 210, mandiArrivals: 180, seasonalNote: 'Harvest Inflow' },
      { month: 'Mar', messDemandQuintals: 190, mandiArrivals: 390, seasonalNote: 'Peak Arrivals' },
      { month: 'Apr', messDemandQuintals: 140, mandiArrivals: 310, seasonalNote: 'Post-Harvest Supply' },
      { month: 'May', messDemandQuintals: 70, mandiArrivals: 160, seasonalNote: 'Summer Recess' },
      { month: 'Jun', messDemandQuintals: 60, mandiArrivals: 110, seasonalNote: 'Off-Peak' },
      { month: 'Jul', messDemandQuintals: 220, mandiArrivals: 80, seasonalNote: 'Hostel Diet Protein Surge' },
      { month: 'Aug', messDemandQuintals: 250, mandiArrivals: 70, seasonalNote: 'Canteen Snacks' },
      { month: 'Sep', messDemandQuintals: 240, mandiArrivals: 60, seasonalNote: 'Pre-Festive Besan Mills' },
      { month: 'Oct', messDemandQuintals: 280, mandiArrivals: 50, seasonalNote: 'Diwali Mithai Demand' },
      { month: 'Nov', messDemandQuintals: 260, mandiArrivals: 60, seasonalNote: 'Winter Season' },
      { month: 'Dec', messDemandQuintals: 160, mandiArrivals: 70, seasonalNote: 'Winter Break' }
    ]
  }
];

export const MOCK_DEMAND_PREDICTIONS: DemandPredictionData[] = [
  {
    region: 'Northern Industrial Belt (NCR / Punjab / Haryana)',
    cropName: 'Sharbati Wheat & Basmati 1121',
    demandScore: 'Surging',
    projectedGrowth: '+28% YoY',
    festivalMultiplier: '1.45x normal consumption',
    weatherFactor: 'Favorable sunny harvesting window predicted by IMD',
    storageRecommendation: 'WDRA accredited silo storage recommended for 45-60 days',
    targetIndustries: ['Flour Mills', 'Bakery Chains', 'Export Aggregators', 'Supermarkets'],
    riskLevel: 'Low Risk'
  },
  {
    region: 'Western Manufacturing Hub (Maharashtra / Gujarat)',
    cropName: 'Yellow Mustard & Soybean',
    demandScore: 'High',
    projectedGrowth: '+18% YoY',
    festivalMultiplier: '1.30x normal consumption',
    weatherFactor: 'Late September showers may increase drying downtime by 3 days',
    storageRecommendation: 'Hermetic bags with dry aeration pads',
    targetIndustries: ['Solvent Extraction Plants', 'Cattle Feed Mills', 'FMCG Oil Brands'],
    riskLevel: 'Moderate Moisture Risk'
  },
  {
    region: 'Southern Metro Corridors (Bengaluru / Hyderabad / Chennai)',
    cropName: 'Guntur Chilli & Tur Dal',
    demandScore: 'Surging',
    projectedGrowth: '+34% YoY',
    festivalMultiplier: '1.55x normal consumption',
    weatherFactor: 'Dry coastal breeze ideal for dispatch',
    storageRecommendation: 'Temperature controlled 18°C warehouse',
    targetIndustries: ['Spice Processors', 'Ready-to-Eat Brands', 'QSR Restaurant Chains'],
    riskLevel: 'Low Risk'
  }
];

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Mandi Price Surge: Sharbati Wheat +9.5%',
    message: 'Indore Mandi benchmark crossed ₹2,850/Qtl. AI predicts peak window between 15 Oct and 05 Nov.',
    time: '10m ago',
    read: false,
    type: 'mandi',
    badge: 'Price Alert'
  },
  {
    id: 'notif-2',
    title: 'Escrow Secured: Order #KS-2026-9941',
    message: '₹17,325 deposited in escrow by Aditi Organic Foods. Reefer truck PB 10 CQ 8812 in transit.',
    time: '2h ago',
    read: false,
    type: 'escrow',
    badge: 'Escrow Active'
  },
  {
    id: 'notif-3',
    title: 'New Bulk RFQ: Patanjali Organic Foods',
    message: 'Seeking 500 Quintals Sharbati Wheat at ₹2,900/Qtl. Submit collective FPO bid before 30 Sep.',
    time: '5h ago',
    read: false,
    type: 'rfq',
    badge: 'RFQ Open'
  },
  {
    id: 'notif-4',
    title: 'Weather Advisory: Late Monsoon Moisture',
    message: 'IMD predicts light rainfall in East Punjab & MP border. Ensure godown moisture stays below 11%.',
    time: '1d ago',
    read: true,
    type: 'weather'
  }
];
