import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ArrowUpDown } from 'lucide-react';
import _, { debounce } from 'lodash';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

// Interface definitions
interface DateScheduleProps {
  startDate: Date;
  endDate: Date;
  holidays: {
    german: string[];
    indian: string[];
  };
  hybridDays: {
    hatim: string[];
  };
}

interface PriceData {
  april: number[];
  may: number[];
}

interface Prices {
  hasanOutbound: PriceData;
  hasanReturn: PriceData;
  hatimOutbound: PriceData;
  hatimReturn: PriceData;
  hussainOutbound: PriceData;
  hussainReturn: PriceData;
}

interface Option {
  dates: {
    start: string;
    end: string;
  };
  holidays: {
    german: string[];
    indian: string[];
  };
  hybridDays: {
    hatim: string[];
  };
  weekends: number;
  costs: {
    hasan: number;
    hatim: number;
    hussain: number;
    total: number;
  };
  leaves: {
    german: number;
    indian: number;
  };
  duration: number;
}

const DateSchedule: React.FC<DateScheduleProps> = ({ startDate, endDate, holidays, hybridDays }) => {
  const start = useMemo(() => new Date(startDate), [startDate]);
  const end = useMemo(() => new Date(endDate), [endDate]);

  const getWeeks = useCallback(() => {
    // Find middle week that contains the start date
    const firstDay = new Date(start);
    firstDay.setDate(firstDay.getDate() - firstDay.getDay() - 7); // Go back two weeks

    const days: Date[] = [];
    const currentDate = new Date(firstDay);

    // Generate 28 days (4 weeks)
    for (let i = 0; i < 28; i++) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Split into weeks
    const weeks: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return weeks;
  }, [start]);

  const isDateInRange = useCallback((date: Date) => {
    const compareDate = new Date(date);
    const compareStart = new Date(start);
    const compareEnd = new Date(end);
    compareDate.setHours(0, 0, 0, 0);
    compareStart.setHours(0, 0, 0, 0);
    compareEnd.setHours(0, 0, 0, 0);
    return compareDate >= compareStart && compareDate <= compareEnd;
  }, [start, end]);

  const getDateStyle = useCallback((date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const isGermanHoliday = holidays.german.includes(dateStr);
    const isIndianHoliday = holidays.indian.includes(dateStr);
    const isHybridDay = hybridDays.hatim.includes(dateStr);
    const inRange = isDateInRange(date);

    return {
      cellClass: `
        relative h-12 p-1.5 border border-gray-200
        ${inRange ? 'ring-1 ring-blue-200' : ''}
        ${isWeekend ? 'bg-gray-50' : 'bg-white'}
        ${inRange && isWeekend ? 'bg-gray-100' : ''}
        ${inRange && isGermanHoliday && isIndianHoliday ? 'bg-green-50' : ''}
        ${inRange && isGermanHoliday && !isIndianHoliday ? 'bg-blue-50' : ''}
        ${inRange && !isGermanHoliday && isIndianHoliday ? 'bg-yellow-50' : ''}
        ${inRange && isHybridDay ? 'bg-purple-50' : ''}
      `,
      textClass: `text-xs ${inRange ? 'font-medium' : 'text-gray-500'}`,
      monthLabel: date.toLocaleString('default', { month: 'short' }),
    };
  }, [holidays, hybridDays, isDateInRange]);

  const weeks = useMemo(() => getWeeks(), [getWeeks]);

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow-sm max-w-4xl mx-auto">
        {/* Week day headers */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-1.5 text-center">
              <span className="text-xs font-medium text-gray-500">
                {day}
              </span>
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="divide-y divide-gray-200">
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="grid grid-cols-7">
              {week.map((date, dateIdx) => {
                const { cellClass, textClass, monthLabel } = getDateStyle(date);
                return (
                  <div key={dateIdx} className={cellClass}>
                    <div className="flex justify-between">
                      <span className={textClass}>
                        {date.getDate() === 1 ? `${monthLabel} ${date.getDate()}` : date.getDate()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Trip Summary */}
      <div className="mt-4 bg-white rounded-lg shadow-sm p-3 mx-auto" style={{ width: '360px' }}>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-gray-500">Weekends</div>
            <div className="mt-0.5 text-sm font-medium">
              {weeks.flat().filter(date => 
                isDateInRange(date) && (date.getDay() === 0 || date.getDay() === 6)
              ).length} days
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Holidays</div>
            <div className="mt-0.5">
              <div className="flex items-center gap-1 text-sm font-medium">
                <span className="text-xs">🇩🇪</span> {holidays.german.length} days
              </div>
              <div className="flex items-center gap-1 text-sm font-medium">
                <span className="text-xs">🇮🇳</span> {holidays.indian.length} days
              </div>
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Hybrid Days</div>
            <div className="mt-0.5">
              <div className="flex items-center gap-1 text-sm font-medium">
                <span className="text-xs">💻</span> {hybridDays.hatim.length} days
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TripAnalysisTable: React.FC = () => {
  // State definitions with types
  const [sortField, setSortField] = useState<string>('totalCost');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedDurations, setSelectedDurations] = useState<number[]>([]);
  
  const [maxPriceHasan, setMaxPriceHasan] = useState<string>('');
  const [maxPriceHatim, setMaxPriceHatim] = useState<string>('');
  const [maxPriceHussain, setMaxPriceHussain] = useState<string>('');
  const [debouncedMaxPriceHasan, setDebouncedMaxPriceHasan] = useState<string>('');
  const [debouncedMaxPriceHatim, setDebouncedMaxPriceHatim] = useState<string>('');
  const [debouncedMaxPriceHussain, setDebouncedMaxPriceHussain] = useState<string>('');

  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [roundPrices, setRoundPrices] = useState<boolean>(true);

  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [isLoadingRate, setIsLoadingRate] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState<'INR' | 'EUR'>('INR');

  useEffect(() => {
    fetch('https://api.exchangerate-api.com/v4/latest/INR')
      .then(response => response.json())
      .then(data => {
        setExchangeRate(data.rates.EUR);
        setIsLoadingRate(false);
      })
      .catch(error => {
        console.error('Error fetching exchange rate:', error);
        setIsLoadingRate(false);
      });
  }, []);

  const debouncedSetPrice = useCallback(
    debounce((setter: (value: string) => void, value: string) => {
      setter(value);
    }, 400),
    []
  );

  const roundToNearest500 = (price: number): number => {
    return Math.round(price / 500) * 500;
  };

  const toggleRowExpansion = (index: number): void => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(index)) {
      newExpandedRows.delete(index);
    } else {
      newExpandedRows.add(index);
    }
    setExpandedRows(newExpandedRows);
  };

  // Define prices as Prices type
  const prices: Prices = {
    hasanOutbound: {
      april: [11021,4547,8535,13860,15062,13410,11038,9093,8789,12665,12766,13309,15019,11723,11672,8237,9839,9155,6120,8981,5056,4547,4740,4547,5878,4547,4547,6287,4547,8092],
      may: [9482,6231,4786,8308,6683,4786,4786,4786,4967,6954,6773,6592,6502,6502,11017,6954,5148,7134,6773,8760,10205,9482,12914,13365,11559,11108,10746,4606,11920,8399]
    },
    hasanReturn: {
      april: [6412,5960,8399,7134,6322,8940,6231,6322,5780,6322,6683,9121,11017,6954,8128,9211,9302,8940,16887,17429,18873,11649,11108,14358,10205,16345,16887,10114,8218,6954],
      may: [8218,8850,8940,8037,6322,5238,4154,4967,6051,6683,6231,6322,7044,5419,5960,6954,8218,6954,7405,6412,3432,6051,7044,7134,7134,8760,5780,3342,7315,8940]
    },
    hatimOutbound: {
      april: [18122,18116,18122,19218,18214,17040,16528,18083,18099,16326,16865,16800,17279,16326,18023,17023,16516,16610,16791,16139,16859,16945,18457,17494,15859,17462,16774,17506,16955,16787],
      may: [17609,18241,16887,17609,18422,18783,18603,18332,18241,18151,18332,17970,18422,18241,17700,17067,17700,19596,19596,18422,18332,17519,17609,16887,18332,17700,18783,19506,18061,19867]
    },
    hatimReturn: {
      april: [14990,12914,13184,14810,15171,15984,15261,12462,12643,12191,13365,14990,15171,14810,10114,10114,10024,10114,9843,10295,16706,11740,10114,10566,10024,10205,10114,15984,16706,10114],
      may: [10114,14358,16435,14358,15984,45964,16435,15894,10114,15803,10114,14810,13455,10295,14810,10114,15894,16706,13275,15623,13726,14629,20499,16526,10114,16345,19776,19506,17429,19506]
    },
    hussainOutbound: {
      april: [8128,5870,8128,9843,11017,11649,9843,8489,9843,11288,13726,21221,18061,16164,13094,13004,13997,11830,11378,13636,13997,8308,4877,4877,6141,6954,6954,6412,6141,6141],
      may: [6773,4877,4877,4877,7947,4877,5148,4877,4967,4967,4967,4967,4877,4877,4877,4877,4877,5148,5148,4877,4877,4877,4877,6773,4877,6592,5148,5148,4877,4877]
    },
    hussainReturn: {
      april: [3432,3432,3432,3432,3432,3432,3432,4967,3432,4967,7405,10746,11378,7586,9843,9302,9392,10656,14268,14990,14720,13275,14629,13094,18603,22756,15623,8669,8760,8218],
      may: [6141,8308,9302,11378,10385,4335,4967,4335,3432,4335,4335,4335,4335,3432,3432,3432,6502,4335,6954,6141,4335,3432,3432,3432,3432,3432,3432,3432,3432,3432]
    }
  };

  const HOLIDAYS = {
    german: ['2025-04-18', '2025-04-21'] as string[],
    indian: ['2025-04-18', '2025-05-01'] as string[]
  };

  const HYBRID_DAYS = {
    hatim: ['2025-05-02'] as string[]
  };

  const getSpecialDays = (startDateStr: Date, endDateStr: Date) => {
    const start = startDateStr;
    const end = endDateStr;
    start.setHours(12, 0, 0, 0);
    end.setHours(12, 0, 0, 0);
    
    const toDateString = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const startStr = toDateString(start);
    const endStr = toDateString(end);

    const germanHolidays = HOLIDAYS.german.filter(holiday => 
      holiday >= startStr && holiday <= endStr
    );

    const indianHolidays = HOLIDAYS.indian.filter(holiday => 
      holiday >= startStr && holiday <= endStr
    );

    const hatimHybridDays = HYBRID_DAYS.hatim.filter(day => 
      day >= startStr && day <= endStr
    );
    
    return {
      holidays: {
        german: germanHolidays,
        indian: indianHolidays
      },
      hybridDays: {
        hatim: hatimHybridDays
      }
    };
  };

  const getWorkingDays = (
    startDate: Date, 
    endDate: Date, 
    holidays: string[], 
    hybridDays: string[] = []
  ): number => {
    let count = 0;
    const curDate = new Date(startDate);
    
    while (curDate <= endDate) {
      const dayOfWeek = curDate.getDay();
      const dateString = curDate.toISOString().split('T')[0];
      
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        if (!holidays.includes(dateString)) {
          if (hybridDays.includes(dateString)) {
            count += 0.5;
          } else {
            count += 1;
          }
        }
      }
      
      curDate.setDate(curDate.getDate() + 1);
    }
    
    return count;
  };

  const convertPrice = useCallback((priceInINR: number): number => {
    if (selectedCurrency === 'INR' || !exchangeRate) return priceInINR;
    return Number((priceInINR * exchangeRate).toFixed(2));
  }, [selectedCurrency, exchangeRate]);

  const formatPrice = useCallback((price: number): string => {
    const symbol = selectedCurrency === 'INR' ? '₹' : '€';
    const convertedPrice = convertPrice(price);
    return `${symbol}${convertedPrice.toLocaleString(selectedCurrency === 'INR' ? 'en-IN' : 'de-DE', {
      minimumFractionDigits: selectedCurrency === 'EUR' ? 2 : 0,
      maximumFractionDigits: selectedCurrency === 'EUR' ? 2 : 0,
    })}`;
  }, [selectedCurrency, convertPrice]);

  const getWeekendCount = (startDate: Date, endDate: Date): number => {
    let count = 0;
    const curDate = new Date(startDate);
    
    while (curDate <= endDate) {
      const dayOfWeek = curDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        count++;
      }
      curDate.setDate(curDate.getDate() + 1);
    }
    
    return count;
  };

  const generateDateAnalysis = (): Option[] => {
    // If no durations are selected, return an empty array
    if (selectedDurations.length === 0) {
      return [];
    }

    const combinations: Option[] = [];
    
    for (let startDate = 1; startDate <= 34; startDate++) {
      for (const duration of (selectedDurations.length > 0 ? selectedDurations : [6, 7, 8, 9, 10])) {
        const endDate = startDate + duration - 1;
        if (endDate > 40) continue;
  
        const startIdx = startDate <= 30 ? startDate - 1 : startDate - 31;
        const endIdx = endDate <= 30 ? endDate - 1 : endDate - 31;
        const startMonthKey = startDate <= 30 ? 'april' : 'may';
        const endMonthKey = endDate <= 30 ? 'april' : 'may';
  
        const hasanOutbound = roundPrices ? roundToNearest500(prices.hasanOutbound[startMonthKey][startIdx]) : prices.hasanOutbound[startMonthKey][startIdx];
        const hasanReturn = roundPrices ? roundToNearest500(prices.hasanReturn[endMonthKey][endIdx]) : prices.hasanReturn[endMonthKey][endIdx];
        const hatimOutbound = roundPrices ? roundToNearest500(prices.hatimOutbound[startMonthKey][startIdx]) : prices.hatimOutbound[startMonthKey][startIdx];
        const hatimReturn = roundPrices ? roundToNearest500(prices.hatimReturn[endMonthKey][endIdx]) : prices.hatimReturn[endMonthKey][endIdx];
        const hussainOutbound = roundPrices ? roundToNearest500(prices.hussainOutbound[startMonthKey][startIdx]) : prices.hussainOutbound[startMonthKey][startIdx];
        const hussainReturn = roundPrices ? roundToNearest500(prices.hussainReturn[endMonthKey][endIdx]) : prices.hussainReturn[endMonthKey][endIdx];
    
        const startDateObj = new Date(2025, startDate <= 30 ? 3 : 4, startDate <= 30 ? startDate : startDate - 30);
        const endDateObj = new Date(2025, endDate <= 30 ? 3 : 4, endDate <= 30 ? endDate : endDate - 30);
        startDateObj.setHours(12, 0, 0, 0);
        endDateObj.setHours(12, 0, 0, 0);
    
        const specialDays = getSpecialDays(startDateObj, endDateObj);
  
        const germanLeaves = getWorkingDays(startDateObj, endDateObj, specialDays.holidays.german);
        const indianLeaves = getWorkingDays(
          startDateObj, 
          endDateObj, 
          specialDays.holidays.indian,
          specialDays.hybridDays.hatim
        );
  
        const weekendCount = getWeekendCount(startDateObj, endDateObj);
  
        const option = {
          dates: {
            start: `${startDate <= 30 ? 'April' : 'May'} ${startDate <= 30 ? startDate : startDate - 30}`,
            end: `${endDate <= 30 ? 'April' : 'May'} ${endDate <= 30 ? endDate : endDate - 30}`
          },
          holidays: specialDays.holidays,
          hybridDays: specialDays.hybridDays,
          weekends: weekendCount,
          duration: duration,
          costs: {
            hasan: hasanOutbound + hasanReturn,
            hatim: hatimOutbound + hatimReturn,
            hussain: hussainOutbound + hussainReturn,
            total: hasanOutbound + hasanReturn + hatimOutbound + hatimReturn + hussainOutbound + hussainReturn
          },
          leaves: {
            german: germanLeaves,
            indian: indianLeaves
          }      
        };
  
        combinations.push(option);
      }
    }
  
    return combinations;
  };

  const handleSort = (field: string): void => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Memoized options with price constraints
  const filteredOptions = useMemo(() => {
    const options: Option[] = generateDateAnalysis();
    return options.filter(option => {
      const hasanConstraint = maxPriceHasan === '' || convertPrice(option.costs.hasan) <= Number(maxPriceHasan);
      const hatimConstraint = maxPriceHatim === '' || convertPrice(option.costs.hatim) <= Number(maxPriceHatim);
      const hussainConstraint = maxPriceHussain === '' || convertPrice(option.costs.hussain) <= Number(maxPriceHussain);
  
      return hasanConstraint && hatimConstraint && hussainConstraint;
    });
  }, [
    selectedDurations, 
    debouncedMaxPriceHasan, 
    debouncedMaxPriceHatim, 
    debouncedMaxPriceHussain, 
    roundPrices,
    selectedCurrency,
    exchangeRate
  ]);
  
  const sortedOptions = _.orderBy(
    filteredOptions,
    [(option: Option) => {
      if (sortField === 'dates') {
        return option.dates.start;
      }
      if (sortField === 'leaves') {
        return (option.leaves.german + option.leaves.indian) * 100 + option.leaves.german;
      }
      if (sortField === 'duration') {
        return option.duration;
      }
      // Convert prices for sorting if needed
      const price = option.costs[sortField as keyof typeof option.costs];
      return convertPrice(price);
    }],
    [sortDirection]
  );

  const getRowClassName = (option: Option): string => {
    if (option.holidays.german.length > 0 && option.holidays.indian.length > 0) {
      return 'bg-green-50 hover:bg-green-100';
    }
    if (option.holidays.german.length > 0) {
      return 'bg-blue-50 hover:bg-blue-100';
    }
    if (option.holidays.indian.length > 0) {
      return 'bg-yellow-50 hover:bg-yellow-100';
    }
    if (option.hybridDays.hatim.length > 0) {
      return 'bg-purple-50 hover:bg-purple-100';
    }
    return 'hover:bg-gray-50';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Trip Analysis Table</CardTitle>
        <CardDescription>
          Analyze and compare different trip options across multiple parameters
        </CardDescription>
        <div className="mt-2 flex items-center justify-between">
          <div className="text-sm">
            {isLoadingRate ? (
              <span className="text-gray-500">Loading exchange rate...</span>
            ) : exchangeRate ? (
              <div className="flex items-center gap-2 text-gray-600">
                <span>Current Exchange Rate:</span>
                <span className="font-medium">
                  {selectedCurrency === 'INR' 
                    ? `1 INR = ${exchangeRate.toFixed(3)} EUR`
                    : `1 EUR = ${(1/exchangeRate).toFixed(2)} INR`}
                </span>
              </div>
            ) : (
              <span className="text-red-500">Failed to load exchange rate</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="currency-toggle"
              checked={selectedCurrency === 'EUR'}
              onCheckedChange={(checked) => setSelectedCurrency(checked ? 'EUR' : 'INR')}
            />
            <Label htmlFor="currency-toggle">Show prices in {selectedCurrency === 'INR' ? 'EUR' : 'INR'}</Label>
          </div>
        </div>
        
        <div className="space-y-6 pt-4">
          {/* Duration Selection */}
          <div className="space-y-2">
            <Label>Trip Duration</Label>
            <div className="flex flex-wrap gap-4">
              {[6, 7, 8, 9, 10].map((days) => (
                <div key={days} className="flex items-center space-x-2">
                  <Switch
                    checked={selectedDurations.includes(days)}
                    onCheckedChange={(checked) => {
                      setSelectedDurations(prev =>
                        checked
                          ? [...prev, days]
                          : prev.filter(d => d !== days)
                      );
                    }}
                    id={`duration-${days}`}
                  />
                  <Label htmlFor={`duration-${days}`}>{days} days</Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Price Constraints */}
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="hasan-price">Hasan Max Price (₹)</Label>
              <Input
                id="hasan-price"
                type="number"
                value={maxPriceHasan}
                onChange={(e) => {
                  const value = e.target.value;
                  // Store all constraints in INR internally
                  const priceInINR = selectedCurrency === 'EUR' && exchangeRate  ? Number(value) / exchangeRate : Number(value);
                  setMaxPriceHasan(value);
                  debouncedSetPrice(setDebouncedMaxPriceHasan, String(priceInINR));
                }}
                placeholder={`No limit (${selectedCurrency})`}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="hatim-price">Hatim Max Price (₹)</Label>
              <Input
                id="hatim-price"
                type="number"
                value={maxPriceHatim}
                onChange={(e) => {
                  const value = e.target.value;
                  // Store all constraints in INR internally
                  const priceInINR = selectedCurrency === 'EUR' && exchangeRate  ? Number(value) / exchangeRate : Number(value);
                  setMaxPriceHatim(value);
                  debouncedSetPrice(setDebouncedMaxPriceHatim, String(priceInINR));
                }}
                placeholder={`No limit (${selectedCurrency})`}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="hussain-price">Hussain Max Price (₹)</Label>
              <Input
                id="hussain-price"
                type="number"
                value={maxPriceHussain}
                onChange={(e) => {
                  const value = e.target.value;
                  // Store all constraints in INR internally
                  const priceInINR = selectedCurrency === 'EUR' && exchangeRate  ? Number(value) / exchangeRate : Number(value);
                  setMaxPriceHussain(value);
                  debouncedSetPrice(setDebouncedMaxPriceHussain, String(priceInINR));
                }}
                placeholder={`No limit (${selectedCurrency})`}
                className="w-full"
              />
            </div>
          </div>

          <Separator />

          {/* Additional Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="round-prices"
                checked={roundPrices}
                onCheckedChange={setRoundPrices}
              />
              <Label htmlFor="round-prices">
                Round prices to nearest {selectedCurrency === 'INR' ? '₹500' : '€5'}
              </Label>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-50 border border-gray-200 rounded"></div>
              <span>Both German & Indian Holidays</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-50 border border-gray-200 rounded"></div>
              <span>German Holidays</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-50 border border-gray-200 rounded"></div>
              <span>Indian Holidays</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-purple-50 border border-gray-200 rounded"></div>
              <span>Hybrid Working Day</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[400px] cursor-pointer" onClick={() => handleSort('dates')}>
                  <div className="flex items-center gap-2">
                    Dates
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="text-right cursor-pointer" onClick={() => handleSort('duration')}>
                  <div className="flex items-center justify-end gap-2">
                    Duration
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="text-right cursor-pointer" onClick={() => handleSort('duration')}>
                  <div className="flex items-center justify-end gap-2">
                    Hasan Cost {selectedCurrency === 'INR' ? '₹' : '€'}
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="text-right cursor-pointer" onClick={() => handleSort('duration')}>
                  <div className="flex items-center justify-end gap-2">
                    Hatim Cost {selectedCurrency === 'INR' ? '₹' : '€'}
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="text-right cursor-pointer" onClick={() => handleSort('duration')}>
                  <div className="flex items-center justify-end gap-2">
                    Hussain Cost {selectedCurrency === 'INR' ? '₹' : '€'}
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="text-right cursor-pointer" onClick={() => handleSort('duration')}>
                  <div className="flex items-center justify-end gap-2">
                    Total Cost {selectedCurrency === 'INR' ? '₹' : '€'}
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="text-right cursor-pointer" onClick={() => handleSort('duration')}>
                  <div className="flex items-center justify-end gap-2">
                    Leave Days
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedOptions.map((option, index) => (
                <TableRow key={index} className={getRowClassName(option)}>
                  <TableCell className="font-medium">
                    <Collapsible open={expandedRows.has(index)} onOpenChange={() => toggleRowExpansion(index)}>
                      <CollapsibleTrigger className="flex items-center justify-between w-full">
                        <span>{option.dates.start} - {option.dates.end}</span>
                        <span className="text-gray-500">
                          {expandedRows.has(index) ? '▼' : '▶'}
                        </span>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <DateSchedule
                          startDate={new Date(2025, option.dates.start.includes('April') ? 3 : 4, parseInt(option.dates.start.split(' ')[1]))}
                          endDate={new Date(2025, option.dates.end.includes('April') ? 3 : 4, parseInt(option.dates.end.split(' ')[1]))}
                          holidays={option.holidays}
                          hybridDays={option.hybridDays}
                        />
                      </CollapsibleContent>
                    </Collapsible>
                  </TableCell>
                  <TableCell className="text-right">{option.duration} days</TableCell>
                  <TableCell className="text-right">{formatPrice(option.costs.hasan)}</TableCell>
                  <TableCell className="text-right">{formatPrice(option.costs.hatim)}</TableCell>
                  <TableCell className="text-right">{formatPrice(option.costs.hussain)}</TableCell>
                  <TableCell className="text-right">{formatPrice(option.costs.total)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end">
                      <span>🇩🇪 {option.leaves.german} days</span>
                      <span>🇮🇳 {option.leaves.indian} days</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {sortedOptions.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No trip options match the current constraints.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TripAnalysisTable;