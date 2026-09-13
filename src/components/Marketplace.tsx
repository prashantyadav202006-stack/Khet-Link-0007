import React, { useState, useMemo } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  Sparkles, 
  ChevronDown, 
  LayoutGrid, 
  List, 
  Filter, 
  RotateCcw,
  Sprout,
  ShieldCheck,
  Check
} from 'lucide-react';
import { CropProduct } from '../types';
import { CropCard } from './CropCard';
import { useLanguage } from '../context/LanguageContext';

interface MarketplaceProps {
  crops: CropProduct[];
  onSelectCrop: (crop: CropProduct) => void;
  onAddToCart: (crop: CropProduct, quantity: number, unit: 'kg' | 'quintal') => void;
  onViewFarmer: (farmerId: string) => void;
}

export const Marketplace: React.FC<MarketplaceProps> = ({
  crops,
  onSelectCrop,
  onAddToCart,
  onViewFarmer
}) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedState, setSelectedState] = useState<string>('All');
  const [onlyOrganic, setOnlyOrganic] = useState<boolean>(false);
  const [selectedGrade, setSelectedGrade] = useState<string>('All');
  const [maxPrice, setMaxPrice] = useState<number>(300);
  const [readyOnly, setReadyOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categories = ['All', 'Grains', 'Pulses', 'Vegetables', 'Spices', 'Oilseeds'];
  const states = ['All', 'Punjab', 'Maharashtra', 'Madhya Pradesh', 'Andhra Pradesh', 'Rajasthan'];
  const grades = ['All', 'Grade A+ Export', 'Grade A Mandi', 'Grade B Commercial'];

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'All': return t('market.allCategories', 'All Crops');
      case 'Grains': return t('market.grains', 'Cereals & Grains');
      case 'Pulses': return t('market.pulses', 'Pulses (Dal)');
      case 'Vegetables': return t('market.vegetables', 'Vegetables');
      case 'Spices': return t('market.spices', 'Spices');
      case 'Oilseeds': return t('market.oilseeds', 'Oilseeds');
      default: return cat;
    }
  };

  const getStateLabel = (st: string) => {
    switch (st) {
      case 'All': return t('state.all', 'All States (Pan-India)');
      case 'Punjab': return t('state.punjab', 'Punjab');
      case 'Maharashtra': return t('state.maharashtra', 'Maharashtra');
      case 'Madhya Pradesh': return t('state.madhyaPradesh', 'Madhya Pradesh');
      case 'Andhra Pradesh': return t('state.andhraPradesh', 'Andhra Pradesh');
      case 'Rajasthan': return t('state.rajasthan', 'Rajasthan');
      default: return st;
    }
  };

  const getGradeLabel = (g: string) => {
    switch (g) {
      case 'All': return t('market.allGrades', 'All Quality Grades');
      case 'Grade A+ Export': return t('grade.aPlusExport', 'Grade A+ Export');
      case 'Grade A Mandi': return t('grade.aMandi', 'Grade A Mandi');
      case 'Grade B Commercial': return t('grade.bCommercial', 'Grade B Commercial');
      default: return g;
    }
  };

  // Filter logic
  const filteredCrops = useMemo(() => {
    return crops
      .filter((crop) => {
        // Search query
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase();
          const matchTitle = crop.title.toLowerCase().includes(q);
          const matchVariety = crop.variety.toLowerCase().includes(q);
          const matchFarmer = crop.farmerName.toLowerCase().includes(q);
          const matchFpo = crop.fpoName.toLowerCase().includes(q);
          const matchLocation = `${crop.locationDistrict} ${crop.locationState}`.toLowerCase().includes(q);
          if (!matchTitle && !matchVariety && !matchFarmer && !matchFpo && !matchLocation) {
            return false;
          }
        }

        // Category
        if (selectedCategory !== 'All' && crop.category !== selectedCategory) {
          return false;
        }

        // State
        if (selectedState !== 'All' && crop.locationState !== selectedState) {
          return false;
        }

        // Organic filter
        if (onlyOrganic && !crop.isOrganic) {
          return false;
        }

        // Grade
        if (selectedGrade !== 'All' && crop.grade !== selectedGrade) {
          return false;
        }

        // Price
        if (crop.pricePerKg > maxPrice) {
          return false;
        }

        // Ready only
        if (readyOnly && !crop.readyForDispatch) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.pricePerKg - b.pricePerKg;
        if (sortBy === 'price-desc') return b.pricePerKg - a.pricePerKg;
        if (sortBy === 'rating') return b.rating - a.rating;
        return 0; // featured
      });
  }, [crops, searchQuery, selectedCategory, selectedState, onlyOrganic, selectedGrade, maxPrice, readyOnly, sortBy]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedState('All');
    setOnlyOrganic(false);
    setSelectedGrade('All');
    setMaxPrice(300);
    setReadyOnly(false);
    setSortBy('featured');
  };

  const hasActiveFilters = 
    searchQuery !== '' || 
    selectedCategory !== 'All' || 
    selectedState !== 'All' || 
    onlyOrganic || 
    selectedGrade !== 'All' || 
    maxPrice < 300 || 
    readyOnly;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#6B8E4E] mb-1">
            <Sprout className="w-4 h-4" />
            {t('market.headerBadge', 'Verified Farmgate Produce')}
          </div>
          <h1 className="text-3xl font-bold text-[#1B2727] font-['Outfit']">
            {t('market.headerTitle', 'Crop & Harvest Marketplace')}
          </h1>
          <p className="text-sm text-neutral-600 mt-1">
            {t('market.headerSub', 'Directly procure from 1,200+ FPOs with lab-tested moisture assays, transparent weighing, and escrow guarantee.')}
          </p>
        </div>

        {/* View Switcher & Result Count */}
        {/* View Switcher & Result Count */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-medium">
            {t('marketplace.showing', 'Showing')} <strong className="text-slate-900 font-mono font-bold">{filteredCrops.length}</strong> {t('market.showingBatches', 'batches available')}
          </span>
          <div className="flex items-center bg-white border border-slate-200 rounded-sm p-0.5 shadow-2xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-xs cursor-pointer ${viewMode === 'grid' ? 'bg-[#0B2E21] text-white shadow-xs' : 'text-slate-500 hover:text-black'}`}
              aria-label="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-xs cursor-pointer ${viewMode === 'list' ? 'bg-[#0B2E21] text-white shadow-xs' : 'text-slate-500 hover:text-black'}`}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Top Search Bar & Category Pills */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          
          {/* Main Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              id="marketplace-search-input"
              type="text"
              placeholder={t('market.searchPlaceholder', 'Search by crop (Wheat, Onion, Chana), variety, farmer name, or district...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-sm pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-400 shadow-2xs placeholder:text-slate-400 font-normal"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative min-w-[200px]">
            <select
              id="marketplace-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full appearance-none bg-white border border-slate-300 rounded-sm px-3.5 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-slate-500 shadow-2xs pr-9 cursor-pointer"
            >
              <option value="featured">{t('marketplace.sortFeatured', 'Sort: Featured & Fresh')}</option>
              <option value="price-asc">{t('market.priceAsc', 'Price: Low to High')}</option>
              <option value="price-desc">{t('market.priceDesc', 'Price: High to Low')}</option>
              <option value="rating">{t('market.rating', 'Highest Rated Farmers')}</option>
            </select>
            <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Mobile Filter Button */}
          <button
            id="mobile-filter-open-btn"
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden px-4 py-2.5 rounded-sm bg-[#0B2E21] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>{t('common.filterProduce', 'Filters')}</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            )}
          </button>
        </div>

        {/* Category Horizontal Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              id={`cat-filter-${cat}`}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-sm text-xs font-semibold tracking-tight transition shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#0B2E21] text-white shadow-xs font-bold border border-[#1E523D]'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 hover:text-black'
              }`}
            >
              {cat === 'All' ? `🌾 ${getCategoryLabel('All')}` : getCategoryLabel(cat)}
            </button>
          ))}
        </div>
      </div>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap text-xs bg-[#EBF2EB] p-2.5 rounded-xl border border-[#D5E5D5]">
          <span className="text-neutral-500 font-medium">{t('marketplace.appliedFilters', 'Applied Filters')}:</span>
          {searchQuery && (
            <span className="bg-white px-2.5 py-1 rounded-md text-[#1B2727] font-semibold flex items-center gap-1 border border-neutral-200">
              {t('marketplace.filterQuery', 'Query')}: "{searchQuery}"
              <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery('')} />
            </span>
          )}
          {selectedCategory !== 'All' && (
            <span className="bg-white px-2.5 py-1 rounded-md text-[#1B2727] font-semibold flex items-center gap-1 border border-neutral-200">
              {t('marketplace.filterCategory', 'Category')}: {getCategoryLabel(selectedCategory)}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCategory('All')} />
            </span>
          )}
          {selectedState !== 'All' && (
            <span className="bg-white px-2.5 py-1 rounded-md text-[#1B2727] font-semibold flex items-center gap-1 border border-neutral-200">
              {t('marketplace.filterState', 'State')}: {getStateLabel(selectedState)}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedState('All')} />
            </span>
          )}
          {onlyOrganic && (
            <span className="bg-white px-2.5 py-1 rounded-md text-emerald-800 font-semibold flex items-center gap-1 border border-emerald-300">
              🌿 {t('common.certifiedOrganic', 'Certified Organic')}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setOnlyOrganic(false)} />
            </span>
          )}
          {selectedGrade !== 'All' && (
            <span className="bg-white px-2.5 py-1 rounded-md text-[#1B2727] font-semibold flex items-center gap-1 border border-neutral-200">
              {getGradeLabel(selectedGrade)}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedGrade('All')} />
            </span>
          )}
          {maxPrice < 300 && (
            <span className="bg-white px-2.5 py-1 rounded-md text-[#1B2727] font-semibold flex items-center gap-1 border border-neutral-200">
              &le; ₹{maxPrice}/kg
              <X className="w-3 h-3 cursor-pointer" onClick={() => setMaxPrice(300)} />
            </span>
          )}
          {readyOnly && (
            <span className="bg-white px-2.5 py-1 rounded-md text-emerald-800 font-semibold flex items-center gap-1 border border-emerald-300">
              {t('common.readyDispatch', 'Ready for Dispatch')}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setReadyOnly(false)} />
            </span>
          )}
          <button
            onClick={resetFilters}
            className="text-rose-700 hover:text-rose-900 font-bold ml-auto flex items-center gap-1 hover:underline cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            {t('common.reset', 'Reset All')}
          </button>
        </div>
      )}

      {/* Main Grid & Filters Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Desktop Filters Sidebar */}
        <aside className="hidden lg:block lg:col-span-3 bg-white rounded-2xl border border-neutral-200 p-6 space-y-6 shadow-xs sticky top-24">
          
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <h3 className="font-bold text-sm text-[#1B2727] flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#6B8E4E]" />
              {t('common.filterProduce', 'Filter Catalog')}
            </h3>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-[11px] text-rose-600 hover:underline font-semibold cursor-pointer"
              >
                {t('marketplace.clear', 'Clear')}
              </button>
            )}
          </div>

          {/* State / Origin Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">
              {t('common.state', 'Origin State')}
            </label>
            <div className="space-y-1">
              {states.map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedState(st)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition flex items-center justify-between cursor-pointer ${
                    selectedState === st 
                      ? 'bg-[#3C5148] text-white font-bold' 
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <span>{getStateLabel(st)}</span>
                  {selectedState === st && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Farming Method */}
          <div className="space-y-2 pt-2 border-t border-neutral-100">
            <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">
              {t('marketplace.farmingMethod', 'Farming Method')}
            </label>
            <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-neutral-50 transition">
              <input
                type="checkbox"
                checked={onlyOrganic}
                onChange={(e) => setOnlyOrganic(e.target.checked)}
                className="w-4 h-4 rounded text-[#6B8E4E] focus:ring-[#6B8E4E]"
              />
              <span className="text-xs font-medium text-neutral-700">
                🌿 {t('common.organicOnly', 'Certified Organic (NPOP / Jaivik)')}
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-neutral-50 transition">
              <input
                type="checkbox"
                checked={readyOnly}
                onChange={(e) => setReadyOnly(e.target.checked)}
                className="w-4 h-4 rounded text-[#6B8E4E] focus:ring-[#6B8E4E]"
              />
              <span className="text-xs font-medium text-neutral-700">
                ⚡ {t('common.readyDispatch', 'Ready for Immediate Dispatch')}
              </span>
            </label>
          </div>

          {/* Quality Grade */}
          <div className="space-y-2 pt-2 border-t border-neutral-100">
            <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">
              {t('common.qualityGrade', 'Quality Grade')}
            </label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full text-xs border border-neutral-300 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-[#6B8E4E] cursor-pointer"
            >
              {grades.map((g) => (
                <option key={g} value={g}>{getGradeLabel(g)}</option>
              ))}
            </select>
          </div>

          {/* Max Price Range Slider */}
          <div className="space-y-2 pt-2 border-t border-neutral-100">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-neutral-700 uppercase tracking-wider">
                {t('common.maxPrice', 'Max Price per Kg')}
              </label>
              <span className="font-bold font-mono text-[#6B8E4E]">₹{maxPrice}/kg</span>
            </div>
            <input
              type="range"
              min="15"
              max="300"
              step="5"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              className="w-full accent-[#6B8E4E] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
              <span>₹15/kg</span>
              <span>₹300/kg</span>
            </div>
          </div>

        </aside>

        {/* Crop Listing Content */}
        <main className="lg:col-span-9 space-y-6">
          {crops.length === 0 ? (
            <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#2A7252] mx-auto flex items-center justify-center">
                <Sprout className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-[#1B2727]">{t('marketplace.noCropsInMarket', 'No Crop Batches Currently Listed')}</h3>
              <p className="text-neutral-500 text-sm max-w-md mx-auto">
                {t('marketplace.noCropsInMarketSub', 'Verified farmers and FPOs can register and publish their fresh harvest batches directly to appear live here.')}
              </p>
            </div>
          ) : filteredCrops.length === 0 ? (
            <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-neutral-100 mx-auto flex items-center justify-center text-neutral-400">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-[#1B2727]">{t('marketplace.noResults', 'No crop batches match your filters')}</h3>
              <p className="text-neutral-500 text-sm max-w-md mx-auto">
                {t('marketplace.noResultsDesc', 'Try loosening your filters or clear the search query to explore produce from other regions.')}
              </p>
              <button
                onClick={resetFilters}
                className="px-5 py-2.5 rounded-xl bg-[#3C5148] text-white text-xs font-bold shadow-xs hover:bg-[#253630] transition cursor-pointer"
              >
                {t('market.resetFilters', 'Reset All Filters')}
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCrops.map((crop) => (
                <CropCard
                  key={crop.id}
                  crop={crop}
                  onSelect={onSelectCrop}
                  onAddToCart={onAddToCart}
                  onViewFarmer={onViewFarmer}
                />
              ))}
            </div>
          ) : (
            /* List View */
            <div className="space-y-4">
              {filteredCrops.map((crop) => (
                <div
                  key={crop.id}
                  className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-5 shadow-xs hover:shadow-md transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
                >
                  <div className="flex items-center gap-4 cursor-pointer" onClick={() => onSelectCrop(crop)}>
                    <img
                      src={crop.imageUrl}
                      alt={crop.title}
                      className="w-20 h-20 rounded-xl object-cover shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase text-[#6B8E4E]">
                          {crop.category} • {crop.grade}
                        </span>
                        {crop.isOrganic && (
                          <span className="text-[10px] font-bold bg-[#3C5148] text-[#B2C5B2] px-2 py-0.2 rounded-full">
                            {t('common.organic', 'Organic')}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-base text-[#1B2727] hover:text-[#6B8E4E]">
                        {crop.title}
                      </h3>
                      <p className="text-xs text-neutral-500">
                        {crop.farmerName} • {crop.locationDistrict}, {crop.locationState}
                      </p>
                      <div className="text-[11px] text-neutral-400 mt-1">
                        {t('market.moisture', 'Moisture')}: {crop.moisturePercent}% • {crop.quantityAvailableQuintals} {t('market.qtlAvail', 'Qtl Avail.')}
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
                    <div className="text-left sm:text-right">
                      <div className="text-xl font-extrabold text-[#1B2727] font-mono">
                        ₹{crop.pricePerKg} <span className="text-xs font-normal text-neutral-500">/ kg</span>
                      </div>
                      <div className="text-xs text-[#6B8E4E] font-bold font-mono">
                        ₹{crop.pricePerQuintal}/Qtl
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => onSelectCrop(crop)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 cursor-pointer"
                      >
                        {t('marketplace.details', 'Details')}
                      </button>
                      <button
                        onClick={() => onAddToCart(crop, 1, 'quintal')}
                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-[#6B8E4E] hover:bg-[#5a7942] text-white cursor-pointer"
                      >
                        {t('common.addOneQtl', '+ 1 Qtl')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

      </div>

      {/* Mobile Filters Slide-in Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-xs h-full p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-[#1B2727]">{t('common.filterProduce', 'Filter Catalog')}</h3>
              <button onClick={() => setMobileFilterOpen(false)} className="cursor-pointer">
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-700 uppercase">{t('common.state', 'State')}</label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full text-xs border rounded-lg p-2 cursor-pointer"
              >
                {states.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyOrganic}
                  onChange={(e) => setOnlyOrganic(e.target.checked)}
                />
                {t('common.organicOnly', 'Certified Organic')}
              </label>
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={readyOnly}
                  onChange={(e) => setReadyOnly(e.target.checked)}
                />
                {t('common.readyDispatch', 'Ready for Dispatch')}
              </label>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>{t('common.maxPrice', 'Max Price/kg')}</span>
                <span className="font-bold font-mono">₹{maxPrice}</span>
              </div>
              <input
                type="range"
                min="15"
                max="300"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                className="w-full accent-[#6B8E4E] cursor-pointer"
              />
            </div>

            <button
              onClick={() => setMobileFilterOpen(false)}
              className="w-full py-3 bg-[#6B8E4E] text-white font-bold text-xs rounded-xl cursor-pointer"
            >
               {t('marketplace.applyFilters', 'Apply Filters')} ({filteredCrops.length} {t('marketplace.results', 'Results')})
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
