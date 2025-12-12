'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

// Cookie names
const COOKIE_LENGTH_UNIT = 'unit_length';
const COOKIE_TEMPERATURE_UNIT = 'unit_temperature';
const COOKIE_PRESSURE_UNIT = 'unit_pressure';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

// Cookie helpers
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() ?? null;
  return null;
}

function setCookie(name: string, value: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

// Unit types
export type LengthUnit = 'mm' | 'inches';
export type TemperatureUnit = 'C' | 'F';
export type PressureUnit = 'atm' | 'bar' | 'psi';

// Length conversion constants
export const MM_TO_INCHES = 1 / 25.4; // 0.03937007874015748
export const INCHES_TO_MM = 25.4;

// Pressure conversion constants (relative to atm as default)
export const ATM_TO_BAR = 1.01325;
export const ATM_TO_PSI = 14.6959;
export const BAR_TO_ATM = 1 / 1.01325;
export const PSI_TO_ATM = 1 / 14.6959;
export const BAR_TO_PSI = 14.6959 / 1.01325;
export const PSI_TO_BAR = 1.01325 / 14.6959;

// Temperature conversion functions (not linear, so we use functions)
export const celsiusToFahrenheit = (c: number): number => (c * 9) / 5 + 32;
export const fahrenheitToCelsius = (f: number): number => ((f - 32) * 5) / 9;

interface UnitManagerContextType {
  // Length
  lengthUnit: LengthUnit;
  setLengthUnit: (unit: LengthUnit) => void;
  convertLengthFromDefault: (value: number) => number;
  convertLengthToDefault: (value: number) => number;
  getLengthUnitLabel: () => string;

  // Temperature
  temperatureUnit: TemperatureUnit;
  setTemperatureUnit: (unit: TemperatureUnit) => void;
  convertTemperatureFromDefault: (value: number) => number;
  convertTemperatureToDefault: (value: number) => number;
  getTemperatureUnitLabel: () => string;

  // Pressure
  pressureUnit: PressureUnit;
  setPressureUnit: (unit: PressureUnit) => void;
  convertPressureFromDefault: (value: number) => number;
  convertPressureToDefault: (value: number) => number;
  getPressureUnitLabel: () => string;
}

const UnitManagerContext = createContext<UnitManagerContextType | null>(null);

interface UnitManagerProviderProps {
  children: ReactNode;
  defaultLengthUnit?: LengthUnit;
  defaultTemperatureUnit?: TemperatureUnit;
  defaultPressureUnit?: PressureUnit;
}

// Helper to get initial unit from cookie or default
function getInitialLengthUnit(defaultUnit: LengthUnit): LengthUnit {
  const stored = getCookie(COOKIE_LENGTH_UNIT);
  if (stored === 'mm' || stored === 'inches') return stored;
  return defaultUnit;
}

function getInitialTemperatureUnit(defaultUnit: TemperatureUnit): TemperatureUnit {
  const stored = getCookie(COOKIE_TEMPERATURE_UNIT);
  if (stored === 'C' || stored === 'F') return stored;
  return defaultUnit;
}

function getInitialPressureUnit(defaultUnit: PressureUnit): PressureUnit {
  const stored = getCookie(COOKIE_PRESSURE_UNIT);
  if (stored === 'atm' || stored === 'bar' || stored === 'psi') return stored;
  return defaultUnit;
}

export function UnitManagerProvider({
  children,
  defaultLengthUnit = 'inches',
  defaultTemperatureUnit = 'C',
  defaultPressureUnit = 'atm',
}: UnitManagerProviderProps) {
  // Length state - initialize from cookie if available
  const [lengthUnit, setLengthUnitState] = useState<LengthUnit>(() =>
    getInitialLengthUnit(defaultLengthUnit),
  );

  // Temperature state - initialize from cookie if available
  const [temperatureUnit, setTemperatureUnitState] = useState<TemperatureUnit>(() =>
    getInitialTemperatureUnit(defaultTemperatureUnit),
  );

  // Pressure state - initialize from cookie if available
  const [pressureUnit, setPressureUnitState] = useState<PressureUnit>(() =>
    getInitialPressureUnit(defaultPressureUnit),
  );

  // Save to cookies when units change
  useEffect(() => {
    setCookie(COOKIE_LENGTH_UNIT, lengthUnit);
  }, [lengthUnit]);

  useEffect(() => {
    setCookie(COOKIE_TEMPERATURE_UNIT, temperatureUnit);
  }, [temperatureUnit]);

  useEffect(() => {
    setCookie(COOKIE_PRESSURE_UNIT, pressureUnit);
  }, [pressureUnit]);

  // ============ LENGTH ============
  const setLengthUnit = useCallback((unit: LengthUnit) => {
    setLengthUnitState(unit);
  }, []);

  const convertLengthFromDefault = useCallback(
    (value: number): number => {
      if (lengthUnit === 'mm') return value;
      return value * INCHES_TO_MM;
    },
    [lengthUnit],
  );

  const convertLengthToDefault = useCallback(
    (value: number): number => {
      if (lengthUnit === 'inches') return value;
      return value * MM_TO_INCHES;
    },
    [lengthUnit],
  );

  const getLengthUnitLabel = useCallback((): string => {
    return lengthUnit === 'mm' ? 'mm' : 'in';
  }, [lengthUnit]);

  // ============ TEMPERATURE ============
  const setTemperatureUnit = useCallback((unit: TemperatureUnit) => {
    setTemperatureUnitState(unit);
  }, []);

  const convertTemperatureFromDefault = useCallback(
    (value: number): number => {
      if (temperatureUnit === 'C') return value;
      return celsiusToFahrenheit(value);
    },
    [temperatureUnit],
  );

  const convertTemperatureToDefault = useCallback(
    (value: number): number => {
      if (temperatureUnit === 'C') return value;
      return fahrenheitToCelsius(value);
    },
    [temperatureUnit],
  );

  const getTemperatureUnitLabel = useCallback((): string => {
    return temperatureUnit === 'C' ? '°C' : '°F';
  }, [temperatureUnit]);

  // ============ PRESSURE ============
  const setPressureUnit = useCallback((unit: PressureUnit) => {
    setPressureUnitState(unit);
  }, []);

  const convertPressureFromDefault = useCallback(
    (value: number): number => {
      if (pressureUnit === 'atm') return value;
      if (pressureUnit === 'bar') return value * ATM_TO_BAR;
      return value * ATM_TO_PSI; // psi
    },
    [pressureUnit],
  );

  const convertPressureToDefault = useCallback(
    (value: number): number => {
      if (pressureUnit === 'atm') return value;
      if (pressureUnit === 'bar') return value * BAR_TO_ATM;
      return value * PSI_TO_ATM; // psi
    },
    [pressureUnit],
  );

  const getPressureUnitLabel = useCallback((): string => {
    return pressureUnit;
  }, [pressureUnit]);

  return (
    <UnitManagerContext.Provider
      value={{
        // Length
        lengthUnit,
        setLengthUnit,
        convertLengthFromDefault,
        convertLengthToDefault,
        getLengthUnitLabel,
        // Temperature
        temperatureUnit,
        setTemperatureUnit,
        convertTemperatureFromDefault,
        convertTemperatureToDefault,
        getTemperatureUnitLabel,
        // Pressure
        pressureUnit,
        setPressureUnit,
        convertPressureFromDefault,
        convertPressureToDefault,
        getPressureUnitLabel,
      }}
    >
      {children}
    </UnitManagerContext.Provider>
  );
}

export function useUnitManager() {
  const context = useContext(UnitManagerContext);
  if (!context) {
    throw new Error('useUnitManager must be used within a UnitManagerProvider');
  }
  return context;
}
