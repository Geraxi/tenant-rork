import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Switch,
  Platform,
  PanResponder,
  Dimensions,
} from 'react-native';
import { Colors, Typography, Spacing } from '@/constants/theme';
import { 
  X, 
  MapPin, 
  DollarSign, 
  Home, 
  Users, 
  Sliders as SlidersIcon,
  Map,
  Star,
  Filter,
  ChevronDown,
  Briefcase,
  Heart,
  Calendar,
  UserCheck
} from 'lucide-react-native';
import { useUser } from '@/store/user-store';
import { UserMode } from '@/types';

interface FilterScreenProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  currentFilters?: FilterOptions;
}

export interface FilterOptions {
  priceRange: {
    min: number;
    max: number;
  };
  propertyType: string[];
  bedrooms: string;
  location: string;
  distance: number; // in km
  amenities: string[];
  verified: boolean;
  featured: boolean;
  // Tenant-specific filters
  tenantAge?: {
    min: number;
    max: number;
  };
  tenantProfession?: string[];
  tenantLifestyle?: string[];
  tenantInterests?: string[];
  workContract?: boolean;
  petsAllowed?: boolean;
  smokingAllowed?: boolean;
}

const getDefaultFilters = (userMode: UserMode): FilterOptions => {
  const base = {
    priceRange: { min: 300, max: 2500 },
    propertyType: [],
    bedrooms: 'any',
    location: 'any',
    distance: 25,
    amenities: [],
    verified: false,
    featured: false,
  };
  
  if (userMode === 'landlord') {
    return {
      ...base,
      tenantAge: { min: 18, max: 65 },
      tenantProfession: [],
      tenantLifestyle: [],
      tenantInterests: [],
      workContract: false,
      petsAllowed: false,
      smokingAllowed: false,
    };
  }
  
  return base;
};

const propertyTypes = [
  'Appartamento',
  'Casa',
  'Monolocale',
  'Condominio',
  'Villa',
  'Loft',
];

const amenitiesList = [
  'WiFi',
  'Parcheggio',
  'Balcone',
  'Terrazza',
  'Giardino',
  'Ascensore',
  'Aria Condizionata',
  'Riscaldamento',
  'Lavatrice',
  'Lavastoviglie',
  'Animali Ammessi',
];

const tenantProfessions = [
  'Studente',
  'Impiegato',
  'Manager',
  'Freelancer',
  'Medico',
  'Ingegnere',
  'Insegnante',
  'Artista',
  'Imprenditore',
  'Ricercatore',
];

const tenantLifestyles = [
  'Non fumatore',
  'Socievole',
  'Tranquillo',
  'Sportivo',
  'Vegetariano/Vegano',
  'Amante degli animali',
  'Nottambulo',
  'Mattiniero',
  'Pulito e ordinato',
  'Flessibile',
];

const tenantInterests = [
  'Cucina',
  'Sport',
  'Musica',
  'Cinema',
  'Lettura',
  'Viaggi',
  'Arte',
  'Tecnologia',
  'Natura',
  'Fotografia',
];

const bedroomOptions = [
  { value: 'any', label: 'Qualsiasi' },
  { value: '1', label: '1 Camera' },
  { value: '2', label: '2 Camere' },
  { value: '3', label: '3 Camere' },
  { value: '4', label: '4 Camere' },
  { value: '5+', label: '5+ Camere' },
];

const distanceOptions = [5, 10, 25, 50, 100];

const locationOptions = [
  { value: 'any', label: 'Qualsiasi Posizione' },
  { value: 'centro', label: 'Centro Città' },
  { value: 'zona-centrale', label: 'Zona Centrale' },
  { value: 'zona-nord', label: 'Zona Nord' },
  { value: 'zona-sud', label: 'Zona Sud' },
  { value: 'zona-est', label: 'Zona Est' },
  { value: 'zona-ovest', label: 'Zona Ovest' },
  { value: 'periferia', label: 'Periferia' },
];

export default function FilterScreen({ 
  visible, 
  onClose, 
  onApply, 
  currentFilters 
}: FilterScreenProps) {
  const { user } = useUser();
  const userMode = user?.current_mode || 'tenant';
  const defaultFilters = getDefaultFilters(userMode);
  const initialFilters = currentFilters || defaultFilters;
  
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);
  const [minPrice, setMinPrice] = useState<number>(initialFilters.priceRange.min);
  const [maxPrice, setMaxPrice] = useState<number>(initialFilters.priceRange.max);
  const [minAge, setMinAge] = useState<number>(initialFilters.tenantAge?.min || 18);
  const [maxAge, setMaxAge] = useState<number>(initialFilters.tenantAge?.max || 65);
  const [showBedroomDropdown, setShowBedroomDropdown] = useState<boolean>(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState<boolean>(false);
  const [showPropertyTypeDropdown, setShowPropertyTypeDropdown] = useState<boolean>(false);
  
  const sliderContainerRef = useRef<View>(null);
  
  const screenWidth = Dimensions.get('window').width;
  const sliderWidth = screenWidth - (Spacing.lg * 4); // Account for padding and margins
  const minPriceLimit = 0;
  const maxPriceLimit = 5000;
  
  // Slider state for dragging
  const [isDraggingMin, setIsDraggingMin] = useState<boolean>(false);
  const [isDraggingMax, setIsDraggingMax] = useState<boolean>(false);
  const [isDraggingMinAge, setIsDraggingMinAge] = useState<boolean>(false);
  const [isDraggingMaxAge, setIsDraggingMaxAge] = useState<boolean>(false);
  
  // Helper function to calculate position from value
  const getPositionFromValue = (value: number, min: number, max: number) => {
    return ((value - min) / (max - min)) * 100;
  };
  
  // Helper function to calculate value from position
  const getValueFromPosition = (position: number, min: number, max: number) => {
    const percentage = Math.max(0, Math.min(100, position)) / 100;
    return Math.round(min + percentage * (max - min));
  };

  const handleApply = () => {
    const finalFilters = {
      ...filters,
      priceRange: {
        min: minPrice,
        max: maxPrice
      },
      ...(userMode === 'landlord' && {
        tenantAge: {
          min: minAge,
          max: maxAge
        }
      })
    };
    onApply(finalFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = getDefaultFilters(userMode);
    setFilters(resetFilters);
    setMinPrice(resetFilters.priceRange.min);
    setMaxPrice(resetFilters.priceRange.max);
    if (userMode === 'landlord') {
      setMinAge(resetFilters.tenantAge?.min || 18);
      setMaxAge(resetFilters.tenantAge?.max || 65);
    }
  };

  const togglePropertyType = (type: string) => {
    if (!type.trim() || type.length > 50) return;
    const sanitizedType = type.trim();
    
    setFilters(prev => ({
      ...prev,
      propertyType: prev.propertyType.includes(sanitizedType)
        ? prev.propertyType.filter(t => t !== sanitizedType)
        : [...prev.propertyType, sanitizedType]
    }));
  };

  const toggleAmenity = (amenity: string) => {
    if (!amenity.trim() || amenity.length > 50) return;
    const sanitizedAmenity = amenity.trim();
    
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(sanitizedAmenity)
        ? prev.amenities.filter(a => a !== sanitizedAmenity)
        : [...prev.amenities, sanitizedAmenity]
    }));
  };
  
  const toggleTenantProfession = (profession: string) => {
    if (!profession.trim()) return;
    const sanitizedProfession = profession.trim();
    
    setFilters(prev => ({
      ...prev,
      tenantProfession: prev.tenantProfession?.includes(sanitizedProfession)
        ? prev.tenantProfession.filter(p => p !== sanitizedProfession)
        : [...(prev.tenantProfession || []), sanitizedProfession]
    }));
  };
  
  const toggleTenantLifestyle = (lifestyle: string) => {
    if (!lifestyle.trim()) return;
    const sanitizedLifestyle = lifestyle.trim();
    
    setFilters(prev => ({
      ...prev,
      tenantLifestyle: prev.tenantLifestyle?.includes(sanitizedLifestyle)
        ? prev.tenantLifestyle.filter(l => l !== sanitizedLifestyle)
        : [...(prev.tenantLifestyle || []), sanitizedLifestyle]
    }));
  };
  
  const toggleTenantInterest = (interest: string) => {
    if (!interest.trim()) return;
    const sanitizedInterest = interest.trim();
    
    setFilters(prev => ({
      ...prev,
      tenantInterests: prev.tenantInterests?.includes(sanitizedInterest)
        ? prev.tenantInterests.filter(i => i !== sanitizedInterest)
        : [...(prev.tenantInterests || []), sanitizedInterest]
    }));
  };

  const FilterSection = ({ title, children, icon: Icon }: any) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Icon size={20} color={Colors.primary} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );

  const OptionButton = ({ 
    title, 
    selected, 
    onPress, 
    style 
  }: { 
    title: string; 
    selected: boolean; 
    onPress: () => void; 
    style?: any;
  }) => (
    <TouchableOpacity
      style={[
        styles.optionButton,
        selected && styles.optionButtonSelected,
        style
      ]}
      onPress={onPress}
    >
      <Text style={[
        styles.optionButtonText,
        selected && styles.optionButtonTextSelected
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const DropdownButton = ({ 
    title, 
    value, 
    onPress, 
    icon: Icon 
  }: { 
    title: string; 
    value: string; 
    onPress: () => void; 
    icon: any;
  }) => (
    <TouchableOpacity style={styles.dropdownButton} onPress={onPress}>
      <View style={styles.dropdownContent}>
        <Icon size={20} color={Colors.primary} />
        <View style={styles.dropdownText}>
          <Text style={styles.dropdownTitle}>{title}</Text>
          <Text style={styles.dropdownValue}>{value}</Text>
        </View>
        <ChevronDown size={20} color={Colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  const DropdownModal = ({ 
    visible, 
    onClose, 
    title, 
    options, 
    selectedValue, 
    onSelect 
  }: {
    visible: boolean;
    onClose: () => void;
    title: string;
    options: { value: string; label: string }[];
    selectedValue: string;
    onSelect: (value: string) => void;
  }) => (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity style={styles.dropdownOverlay} onPress={onClose}>
        <View style={styles.dropdownModal}>
          <Text style={styles.dropdownModalTitle}>{title}</Text>
          <ScrollView style={styles.dropdownOptions}>
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.dropdownOption,
                  selectedValue === option.value && styles.dropdownOptionSelected
                ]}
                onPress={() => {
                  onSelect(option.value);
                  onClose();
                }}
              >
                <Text style={[
                  styles.dropdownOptionText,
                  selectedValue === option.value && styles.dropdownOptionTextSelected
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Filtri e Preferenze</Text>
          <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Price Range Slider */}
          <FilterSection title="Fascia di Prezzo" icon={DollarSign}>
            <View style={styles.priceContainer}>
              <View style={styles.priceLabels}>
                <Text style={styles.priceLabel}>€{minPrice}</Text>
                <Text style={styles.priceLabel}>€{maxPrice}</Text>
              </View>
              
              {/* Dual Range Slider */}
              <View style={styles.dualSliderContainer} ref={sliderContainerRef}>
                <View style={styles.sliderTrack}>
                  {/* Active range fill */}
                  <View 
                    style={[
                      styles.sliderActiveFill, 
                      {
                        left: `${getPositionFromValue(minPrice, minPriceLimit, maxPriceLimit)}%`,
                        width: `${getPositionFromValue(maxPrice, minPriceLimit, maxPriceLimit) - getPositionFromValue(minPrice, minPriceLimit, maxPriceLimit)}%`
                      }
                    ]} 
                  />
                  
                  {/* Min price thumb */}
                  <View
                    style={[
                      styles.sliderThumb,
                      isDraggingMin && styles.sliderThumbActive,
                      {
                        left: `${getPositionFromValue(minPrice, minPriceLimit, maxPriceLimit)}%`,
                        marginLeft: -16 // Half of thumb width
                      }
                    ]}
                    {...PanResponder.create({
                      onStartShouldSetPanResponder: () => true,
                      onMoveShouldSetPanResponder: () => true,
                      onPanResponderGrant: () => {
                        setIsDraggingMin(true);
                      },
                      onPanResponderMove: (evt, gestureState) => {
                        const { moveX } = gestureState;
                        const containerX = evt.nativeEvent.pageX - gestureState.moveX + gestureState.dx;
                        const relativeX = Math.max(0, Math.min(sliderWidth, moveX - containerX));
                        const percentage = (relativeX / sliderWidth) * 100;
                        const newMinPrice = getValueFromPosition(percentage, minPriceLimit, maxPriceLimit);
                        
                        if (newMinPrice < maxPrice - 50 && newMinPrice >= minPriceLimit) {
                          setMinPrice(newMinPrice);
                        }
                      },
                      onPanResponderRelease: () => {
                        setIsDraggingMin(false);
                        setFilters(prev => ({
                          ...prev,
                          priceRange: { ...prev.priceRange, min: minPrice }
                        }));
                      },
                    }).panHandlers}
                  >
                    <View style={styles.sliderThumbInner} />
                  </View>
                  
                  {/* Max price thumb */}
                  <View
                    style={[
                      styles.sliderThumb,
                      isDraggingMax && styles.sliderThumbActive,
                      {
                        left: `${getPositionFromValue(maxPrice, minPriceLimit, maxPriceLimit)}%`,
                        marginLeft: -16 // Half of thumb width
                      }
                    ]}
                    {...PanResponder.create({
                      onStartShouldSetPanResponder: () => true,
                      onMoveShouldSetPanResponder: () => true,
                      onPanResponderGrant: () => {
                        setIsDraggingMax(true);
                      },
                      onPanResponderMove: (evt, gestureState) => {
                        const { moveX } = gestureState;
                        const containerX = evt.nativeEvent.pageX - gestureState.moveX + gestureState.dx;
                        const relativeX = Math.max(0, Math.min(sliderWidth, moveX - containerX));
                        const percentage = (relativeX / sliderWidth) * 100;
                        const newMaxPrice = getValueFromPosition(percentage, minPriceLimit, maxPriceLimit);
                        
                        if (newMaxPrice > minPrice + 50 && newMaxPrice <= maxPriceLimit) {
                          setMaxPrice(newMaxPrice);
                        }
                      },
                      onPanResponderRelease: () => {
                        setIsDraggingMax(false);
                        setFilters(prev => ({
                          ...prev,
                          priceRange: { ...prev.priceRange, max: maxPrice }
                        }));
                      },
                    }).panHandlers}
                  >
                    <View style={styles.sliderThumbInner} />
                  </View>
                </View>
              </View>
              
              {/* Quick price buttons */}
              <View style={styles.quickPriceButtons}>
                <TouchableOpacity 
                  style={styles.quickPriceButton}
                  onPress={() => {
                    const newMin = Math.max(minPriceLimit, minPrice - 100);
                    if (newMin < maxPrice - 50) {
                      setMinPrice(newMin);
                      setFilters(prev => ({
                        ...prev,
                        priceRange: { ...prev.priceRange, min: newMin }
                      }));
                    }
                  }}
                >
                  <Text style={styles.quickPriceButtonText}>Min -€100</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.quickPriceButton}
                  onPress={() => {
                    const newMin = Math.min(maxPrice - 50, minPrice + 100);
                    setMinPrice(newMin);
                    setFilters(prev => ({
                      ...prev,
                      priceRange: { ...prev.priceRange, min: newMin }
                    }));
                  }}
                >
                  <Text style={styles.quickPriceButtonText}>Min +€100</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.quickPriceButton}
                  onPress={() => {
                    const newMax = Math.max(minPrice + 50, maxPrice - 100);
                    setMaxPrice(newMax);
                    setFilters(prev => ({
                      ...prev,
                      priceRange: { ...prev.priceRange, max: newMax }
                    }));
                  }}
                >
                  <Text style={styles.quickPriceButtonText}>Max -€100</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.quickPriceButton}
                  onPress={() => {
                    const newMax = Math.min(maxPriceLimit, maxPrice + 100);
                    if (newMax > minPrice + 50) {
                      setMaxPrice(newMax);
                      setFilters(prev => ({
                        ...prev,
                        priceRange: { ...prev.priceRange, max: newMax }
                      }));
                    }
                  }}
                >
                  <Text style={styles.quickPriceButtonText}>Max +€100</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.priceRangeDisplay}>
                <Text style={styles.priceRangeText}>
                  Budget: €{minPrice} - €{maxPrice}
                </Text>
              </View>
            </View>
          </FilterSection>

          {/* Tenant/Roommate Filters */}
          {(userMode === 'tenant' || userMode === 'roommate') && (
            <>
              {/* Property Type Dropdown */}
              <FilterSection title="Tipo di Proprietà" icon={Home}>
                <DropdownButton
                  title="Seleziona Tipo"
                  value={filters.propertyType.length === 0 ? 'Qualsiasi Tipo' : 
                         filters.propertyType.length === 1 ? filters.propertyType[0] :
                         `${filters.propertyType.length} tipi selezionati`}
                  onPress={() => setShowPropertyTypeDropdown(true)}
                  icon={Home}
                />
                
                {filters.propertyType.length > 0 && (
                  <View style={styles.selectedTags}>
                    {filters.propertyType.map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={styles.selectedTag}
                        onPress={() => togglePropertyType(type)}
                      >
                        <Text style={styles.selectedTagText}>{type}</Text>
                        <X size={14} color={Colors.textLight} />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </FilterSection>

              {/* Bedrooms Dropdown */}
              <FilterSection title="Camere da Letto" icon={Users}>
                <DropdownButton
                  title="Numero Camere"
                  value={bedroomOptions.find(opt => opt.value === filters.bedrooms)?.label || 'Qualsiasi'}
                  onPress={() => setShowBedroomDropdown(true)}
                  icon={Users}
                />
              </FilterSection>

              {/* Location Dropdown */}
              <FilterSection title="Posizione" icon={MapPin}>
                <DropdownButton
                  title="Zona Preferita"
                  value={locationOptions.find(opt => opt.value === filters.location)?.label || 'Qualsiasi Posizione'}
                  onPress={() => setShowLocationDropdown(true)}
                  icon={MapPin}
                />
              </FilterSection>

              {/* Distance */}
              <FilterSection title="Distanza Massima" icon={MapPin}>
                <View style={styles.optionsRow}>
                  {distanceOptions.map((distance) => (
                    <OptionButton
                      key={distance}
                      title={`${distance} km`}
                      selected={filters.distance === distance}
                      onPress={() => setFilters(prev => ({ ...prev, distance }))}
                    />
                  ))}
                </View>
              </FilterSection>

              {/* Amenities */}
              <FilterSection title="Servizi Desiderati" icon={SlidersIcon}>
                <View style={styles.optionsGrid}>
                  {amenitiesList.map((amenity) => (
                    <OptionButton
                      key={amenity}
                      title={amenity}
                      selected={filters.amenities.includes(amenity)}
                      onPress={() => toggleAmenity(amenity)}
                      style={styles.amenityOption}
                    />
                  ))}
                </View>
              </FilterSection>
            </>
          )}

          {/* Landlord-specific filters */}
          {userMode === 'landlord' && (
            <>
              {/* Property Management Filters */}
              <FilterSection title="Gestione Proprietà" icon={Home}>
                <View style={styles.optionsGrid}>
                  <OptionButton
                    title="Proprietà Attive"
                    selected={filters.propertyType.includes('active')}
                    onPress={() => togglePropertyType('active')}
                    style={styles.amenityOption}
                  />
                  <OptionButton
                    title="Proprietà Inattive"
                    selected={filters.propertyType.includes('inactive')}
                    onPress={() => togglePropertyType('inactive')}
                    style={styles.amenityOption}
                  />
                  <OptionButton
                    title="In Manutenzione"
                    selected={filters.propertyType.includes('maintenance')}
                    onPress={() => togglePropertyType('maintenance')}
                    style={styles.amenityOption}
                  />
                  <OptionButton
                    title="Disponibili"
                    selected={filters.propertyType.includes('available')}
                    onPress={() => togglePropertyType('available')}
                    style={styles.amenityOption}
                  />
                </View>
              </FilterSection>
              
              {/* Tenant Age Range */}
              <FilterSection title="Età Inquilino Preferita" icon={Calendar}>
                <View style={styles.priceContainer}>
                  <View style={styles.priceLabels}>
                    <Text style={styles.priceLabel}>{minAge} anni</Text>
                    <Text style={styles.priceLabel}>{maxAge} anni</Text>
                  </View>
                  
                  <View style={styles.dualSliderContainer}>
                    <View style={styles.sliderTrack}>
                      <View 
                        style={[
                          styles.sliderActiveFill, 
                          {
                            left: `${getPositionFromValue(minAge, 18, 65)}%`,
                            width: `${getPositionFromValue(maxAge, 18, 65) - getPositionFromValue(minAge, 18, 65)}%`
                          }
                        ]} 
                      />
                      
                      <View
                        style={[
                          styles.sliderThumb,
                          isDraggingMinAge && styles.sliderThumbActive,
                          {
                            left: `${getPositionFromValue(minAge, 18, 65)}%`,
                            marginLeft: -16
                          }
                        ]}
                        {...PanResponder.create({
                          onStartShouldSetPanResponder: () => true,
                          onMoveShouldSetPanResponder: () => true,
                          onPanResponderGrant: () => {
                            setIsDraggingMinAge(true);
                          },
                          onPanResponderMove: (evt, gestureState) => {
                            const { moveX } = gestureState;
                            const containerX = evt.nativeEvent.pageX - gestureState.moveX + gestureState.dx;
                            const relativeX = Math.max(0, Math.min(sliderWidth, moveX - containerX));
                            const percentage = (relativeX / sliderWidth) * 100;
                            const newMinAge = getValueFromPosition(percentage, 18, 65);
                            
                            if (newMinAge < maxAge - 1 && newMinAge >= 18) {
                              setMinAge(newMinAge);
                            }
                          },
                          onPanResponderRelease: () => {
                            setIsDraggingMinAge(false);
                          },
                        }).panHandlers}
                      >
                        <View style={styles.sliderThumbInner} />
                      </View>
                      
                      <View
                        style={[
                          styles.sliderThumb,
                          isDraggingMaxAge && styles.sliderThumbActive,
                          {
                            left: `${getPositionFromValue(maxAge, 18, 65)}%`,
                            marginLeft: -16
                          }
                        ]}
                        {...PanResponder.create({
                          onStartShouldSetPanResponder: () => true,
                          onMoveShouldSetPanResponder: () => true,
                          onPanResponderGrant: () => {
                            setIsDraggingMaxAge(true);
                          },
                          onPanResponderMove: (evt, gestureState) => {
                            const { moveX } = gestureState;
                            const containerX = evt.nativeEvent.pageX - gestureState.moveX + gestureState.dx;
                            const relativeX = Math.max(0, Math.min(sliderWidth, moveX - containerX));
                            const percentage = (relativeX / sliderWidth) * 100;
                            const newMaxAge = getValueFromPosition(percentage, 18, 65);
                            
                            if (newMaxAge > minAge + 1 && newMaxAge <= 65) {
                              setMaxAge(newMaxAge);
                            }
                          },
                          onPanResponderRelease: () => {
                            setIsDraggingMaxAge(false);
                          },
                        }).panHandlers}
                      >
                        <View style={styles.sliderThumbInner} />
                      </View>
                    </View>
                  </View>
                  
                  {/* Live feedback for age range */}
                  <View style={styles.priceRangeDisplay}>
                    <Text style={styles.priceRangeText}>
                      Età: {minAge} - {maxAge} anni
                    </Text>
                  </View>
                </View>
              </FilterSection>
              
              {/* Tenant Profession */}
              <FilterSection title="Professione Inquilino" icon={Briefcase}>
                <View style={styles.optionsGrid}>
                  {tenantProfessions.map((profession) => (
                    <OptionButton
                      key={profession}
                      title={profession}
                      selected={filters.tenantProfession?.includes(profession) || false}
                      onPress={() => toggleTenantProfession(profession)}
                      style={styles.amenityOption}
                    />
                  ))}
                </View>
              </FilterSection>
              
              {/* Tenant Lifestyle */}
              <FilterSection title="Stile di Vita Inquilino" icon={Heart}>
                <View style={styles.optionsGrid}>
                  {tenantLifestyles.map((lifestyle) => (
                    <OptionButton
                      key={lifestyle}
                      title={lifestyle}
                      selected={filters.tenantLifestyle?.includes(lifestyle) || false}
                      onPress={() => toggleTenantLifestyle(lifestyle)}
                      style={styles.amenityOption}
                    />
                  ))}
                </View>
              </FilterSection>
              
              {/* Tenant Interests */}
              <FilterSection title="Interessi Inquilino" icon={Star}>
                <View style={styles.optionsGrid}>
                  {tenantInterests.map((interest) => (
                    <OptionButton
                      key={interest}
                      title={interest}
                      selected={filters.tenantInterests?.includes(interest) || false}
                      onPress={() => toggleTenantInterest(interest)}
                      style={styles.amenityOption}
                    />
                  ))}
                </View>
              </FilterSection>
              
              {/* Tenant Requirements */}
              <FilterSection title="Requisiti Inquilino" icon={UserCheck}>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Contratto di Lavoro Richiesto</Text>
                  <Switch
                    value={filters.workContract || false}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, workContract: value }))}
                    trackColor={{ false: Colors.border, true: Colors.primary }}
                    thumbColor={Platform.OS === 'ios' ? Colors.background : Colors.textLight}
                  />
                </View>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Animali Domestici Ammessi</Text>
                  <Switch
                    value={filters.petsAllowed || false}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, petsAllowed: value }))}
                    trackColor={{ false: Colors.border, true: Colors.primary }}
                    thumbColor={Platform.OS === 'ios' ? Colors.background : Colors.textLight}
                  />
                </View>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Fumatori Ammessi</Text>
                  <Switch
                    value={filters.smokingAllowed || false}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, smokingAllowed: value }))}
                    trackColor={{ false: Colors.border, true: Colors.primary }}
                    thumbColor={Platform.OS === 'ios' ? Colors.background : Colors.textLight}
                  />
                </View>
              </FilterSection>
            </>
          )}
          
          {/* Special Filters */}
          <FilterSection title="Filtri Speciali" icon={Star}>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>
                {userMode === 'landlord' ? 'Solo Inquilini Verificati' : 'Solo Proprietari Verificati'}
              </Text>
              <Switch
                value={filters.verified}
                onValueChange={(value) => setFilters(prev => ({ ...prev, verified: value }))}
                trackColor={{ false: Colors.border, true: Colors.primary }}
                thumbColor={Platform.OS === 'ios' ? Colors.background : Colors.textLight}
              />
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Solo Annunci in Evidenza</Text>
              <Switch
                value={filters.featured}
                onValueChange={(value) => setFilters(prev => ({ ...prev, featured: value }))}
                trackColor={{ false: Colors.border, true: Colors.primary }}
                thumbColor={Platform.OS === 'ios' ? Colors.background : Colors.textLight}
              />
            </View>
          </FilterSection>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionButton}>
              <Map size={20} color={Colors.primary} />
              <Text style={styles.quickActionText}>Visualizza su Mappa</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionButton}>
              <Filter size={20} color={Colors.primary} />
              <Text style={styles.quickActionText}>Ricerca Avanzata</Text>
            </TouchableOpacity>
          </View>
          
          {/* Filter Summary */}
          <View style={styles.filterSummary}>
            <Text style={styles.filterSummaryTitle}>Filtri Attivi: {getActiveFiltersCount(filters)}</Text>
            {getActiveFiltersCount(filters) > 0 && (
              <Text style={styles.filterSummaryText}>
                {userMode === 'landlord' ? 
                  'Stai filtrando per trovare inquilini ideali' : 
                  'Stai filtrando per trovare la casa perfetta'
                }
              </Text>
            )}
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>
              Applica Filtri ({getActiveFiltersCount(filters)})
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Dropdown Modals */}
      <DropdownModal
        visible={showBedroomDropdown}
        onClose={() => setShowBedroomDropdown(false)}
        title="Seleziona Numero Camere"
        options={bedroomOptions}
        selectedValue={filters.bedrooms}
        onSelect={(value) => setFilters(prev => ({ ...prev, bedrooms: value }))}
      />
      
      <DropdownModal
        visible={showLocationDropdown}
        onClose={() => setShowLocationDropdown(false)}
        title="Seleziona Posizione"
        options={locationOptions}
        selectedValue={filters.location}
        onSelect={(value) => setFilters(prev => ({ ...prev, location: value }))}
      />
      
      <DropdownModal
        visible={showPropertyTypeDropdown}
        onClose={() => setShowPropertyTypeDropdown(false)}
        title="Seleziona Tipo Proprietà"
        options={propertyTypes.map(type => ({ value: type, label: type }))}
        selectedValue={filters.propertyType[0] || ''}
        onSelect={(value) => {
          if (filters.propertyType.includes(value)) {
            togglePropertyType(value);
          } else {
            togglePropertyType(value);
          }
        }}
      />
    </Modal>
  );
}

function getActiveFiltersCount(filters: FilterOptions): number {
  let count = 0;
  
  if (filters.priceRange.min > 300 || filters.priceRange.max < 2500) count++;
  if (filters.propertyType.length > 0) count++;
  if (filters.bedrooms !== 'any') count++;
  if (filters.location !== 'any') count++;
  if (filters.distance < 25) count++;
  if (filters.amenities.length > 0) count++;
  if (filters.verified) count++;
  if (filters.featured) count++;
  
  // Landlord-specific filters
  if (filters.tenantAge && (filters.tenantAge.min > 18 || filters.tenantAge.max < 65)) count++;
  if (filters.tenantProfession && filters.tenantProfession.length > 0) count++;
  if (filters.tenantLifestyle && filters.tenantLifestyle.length > 0) count++;
  if (filters.tenantInterests && filters.tenantInterests.length > 0) count++;
  if (filters.workContract) count++;
  if (filters.petsAllowed) count++;
  if (filters.smokingAllowed) count++;
  
  return count;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    marginTop: Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeButton: {
    padding: Spacing.sm,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.text,
  },
  resetButton: {
    padding: Spacing.sm,
  },
  resetButtonText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  section: {
    marginVertical: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginLeft: Spacing.sm,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  optionButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  optionButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionButtonText: {
    ...Typography.caption,
    color: Colors.text,
    fontWeight: '500',
  },
  optionButtonTextSelected: {
    color: Colors.textLight,
  },
  priceOption: {
    minWidth: '45%',
  },
  typeOption: {
    minWidth: '30%',
  },
  amenityOption: {
    minWidth: '30%',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  switchLabel: {
    ...Typography.body,
    color: Colors.text,
    flex: 1,
  },
  quickActions: {
    marginVertical: Spacing.lg,
    gap: Spacing.md,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 12,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickActionText: {
    ...Typography.body,
    color: Colors.text,
    marginLeft: Spacing.sm,
    fontWeight: '500',
  },
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  applyButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    ...Typography.body,
    color: Colors.textLight,
    fontWeight: '600',
    fontSize: 16,
  },
  // Price slider styles
  priceContainer: {
    paddingVertical: Spacing.md,
  },
  priceLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  priceLabel: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
  },
  dualSliderContainer: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  sliderTrack: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    position: 'relative',
  },
  sliderActiveFill: {
    position: 'absolute',
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
    top: 0,
  },
  sliderThumb: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    borderWidth: 3,
    borderColor: Colors.primary,
    top: -13, // Center on track
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sliderThumbActive: {
    transform: [{ scale: 1.2 }],
    borderWidth: 4,
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 8,
  },
  sliderThumbInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  quickPriceButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    justifyContent: 'space-between',
  },
  quickPriceButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.background,
    minWidth: '22%',
    alignItems: 'center',
  },
  quickPriceButtonText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '500',
    fontSize: 11,
  },

  priceRangeDisplay: {
    backgroundColor: Colors.backgroundSecondary,
    padding: Spacing.md,
    borderRadius: 8,
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  priceRangeText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
  },
  // Dropdown styles
  dropdownButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    backgroundColor: Colors.background,
  },
  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  dropdownText: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  dropdownTitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  dropdownValue: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '500',
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  dropdownModal: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    margin: Spacing.xl,
    maxHeight: '60%',
    minWidth: '80%',
  },
  dropdownModalTitle: {
    ...Typography.h3,
    color: Colors.text,
    textAlign: 'center',
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dropdownOptions: {
    maxHeight: 300,
  },
  dropdownOption: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dropdownOptionSelected: {
    backgroundColor: Colors.backgroundSecondary,
  },
  dropdownOptionText: {
    ...Typography.body,
    color: Colors.text,
  },
  dropdownOptionTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  selectedTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: 16,
    gap: Spacing.xs,
  },
  selectedTagText: {
    ...Typography.caption,
    color: Colors.textLight,
    fontWeight: '500',
  },
  filterSummary: {
    backgroundColor: Colors.backgroundSecondary,
    padding: Spacing.lg,
    borderRadius: 12,
    marginVertical: Spacing.lg,
    alignItems: 'center',
  },
  filterSummaryTitle: {
    ...Typography.h3,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  filterSummaryText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});