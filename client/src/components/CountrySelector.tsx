import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search, Globe, MapPin } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface Country {
  id: number;
  code: string;
  code2: string;
  name: string;
  nameNative: string;
  flag: string;
  continent: string;
  region: string;
  currency: string;
  isActive: boolean;
}

interface CountrySelectorProps {
  value: {
    restriction: "all" | "selected" | "exclude";
    allowedCountries?: string[];
    excludedCountries?: string[];
  };
  onChange: (value: {
    restriction: "all" | "selected" | "exclude";
    allowedCountries?: string[];
    excludedCountries?: string[];
  }) => void;
  label?: string;
  description?: string;
}

export function CountrySelector({ value, onChange, label = "Country Restrictions", description }: CountrySelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountries, setSelectedCountries] = useState<string[]>(
    value.restriction === "selected" ? (value.allowedCountries || []) :
    value.restriction === "exclude" ? (value.excludedCountries || []) : []
  );

  const { data: countries = [], isLoading } = useQuery<Country[]>({
    queryKey: ["/api/countries"],
    queryFn: () => apiRequest("GET", "/api/countries").then(res => res.json()),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    refetchInterval: false,
    retry: false,
  });

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.nameNative?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.code2.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const continents = Array.from(new Set(countries.map(c => c.continent))).filter(Boolean);

  const handleRestrictionChange = (restriction: "all" | "selected" | "exclude") => {
    setSelectedCountries([]);
    onChange({
      restriction,
      allowedCountries: restriction === "selected" ? [] : undefined,
      excludedCountries: restriction === "exclude" ? [] : undefined,
    });
  };

  const handleCountryToggle = (countryCode: string) => {
    const newSelected = selectedCountries.includes(countryCode)
      ? selectedCountries.filter(c => c !== countryCode)
      : [...selectedCountries, countryCode];
    
    setSelectedCountries(newSelected);
    
    onChange({
      restriction: value.restriction,
      allowedCountries: value.restriction === "selected" ? newSelected : undefined,
      excludedCountries: value.restriction === "exclude" ? newSelected : undefined,
    });
  };

  const getCountriesByContinent = (continent: string) => {
    return filteredCountries.filter(c => c.continent === continent);
  };

  const selectedCountryNames = countries
    .filter(c => selectedCountries.includes(c.code))
    .map(c => c.name);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          {label}
        </CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup
          value={value.restriction}
          onValueChange={handleRestrictionChange}
          className="space-y-3"
        >
          <div className="flex items-center space-x-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <RadioGroupItem value="all" id="all" />
            <Label htmlFor="all" className="flex items-center gap-3 cursor-pointer flex-1">
              <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                <Globe className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">Herkese Açık</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Tüm dünyadan katılım yapılabilir</div>
              </div>
            </Label>
          </div>
          <div className="flex items-center space-x-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <RadioGroupItem value="selected" id="selected" />
            <Label htmlFor="selected" className="flex items-center gap-3 cursor-pointer flex-1">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">Sadece Belirli Ülkeler</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Seçeceğiniz ülkelerden katılım</div>
              </div>
            </Label>
          </div>
          <div className="flex items-center space-x-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <RadioGroupItem value="exclude" id="exclude" />
            <Label htmlFor="exclude" className="flex items-center gap-3 cursor-pointer flex-1">
              <div className="bg-red-100 dark:bg-red-900 p-2 rounded-full">
                <MapPin className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">Belirli Ülkeleri Hariç Tut</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Seçeceğiniz ülkeler katılamaz</div>
              </div>
            </Label>
          </div>
        </RadioGroup>

        {value.restriction !== "all" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-500" />
              <Input
                placeholder="Ülke ara... (örn: Türkiye, Germany, France)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>

            {selectedCountries.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {value.restriction === "selected" ? "Seçilen Ülkeler" : "Hariç Tutulan Ülkeler"} ({selectedCountries.length})
                </Label>
                <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
                  {selectedCountryNames.map((name) => (
                    <Badge key={name} variant={value.restriction === "selected" ? "default" : "destructive"} className="text-xs">
                      {name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <ScrollArea className="h-80 w-full border rounded-md p-4">
              <div className="space-y-6">
                {continents.map((continent) => {
                  const continentCountries = getCountriesByContinent(continent);
                  if (continentCountries.length === 0) return null;

                  return (
                    <div key={continent} className="space-y-3">
                      <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                        {continent}
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        {continentCountries.map((country) => (
                          <div
                            key={country.code}
                            className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded"
                          >
                            <Checkbox
                              id={country.code}
                              checked={selectedCountries.includes(country.code)}
                              onCheckedChange={() => handleCountryToggle(country.code)}
                            />
                            <Label
                              htmlFor={country.code}
                              className="flex items-center gap-2 cursor-pointer flex-1"
                            >
                              <span className="text-lg">{country.flag}</span>
                              <div className="flex flex-col">
                                <span className="font-medium">{country.name}</span>
                                {country.nameNative && country.nameNative !== country.name && (
                                  <span className="text-xs text-muted-foreground">
                                    {country.nameNative}
                                  </span>
                                )}
                              </div>
                              <Badge variant="outline" className="ml-auto text-xs">
                                {country.code2}
                              </Badge>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            {value.restriction === "selected" && selectedCountries.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Katılmasını istediğiniz ülkeleri seçin</p>
              </div>
            )}

            {value.restriction === "exclude" && selectedCountries.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Katılımını engellemek istediğiniz ülkeleri seçin</p>
              </div>
            )}
          </div>
        )}

        {value.restriction === "all" && (
          <div className="text-center py-8 text-gray-600 dark:text-gray-400">
            <Globe className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
            <p className="text-lg font-medium text-gray-900 dark:text-white">Tüm Dünyaya Açık</p>
            <p className="text-sm">Herkes katılabilir, ülke kısıtlaması yok</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}