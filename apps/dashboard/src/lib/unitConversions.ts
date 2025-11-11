/**
 * Unit conversion utilities for converting between International System (SI) and Imperial units
 * All conversions maintain 10 decimal points of precision
 */

const PRECISION = 10;

/**
 * Round a number to the specified precision
 */
function roundToPrecision(value: number, precision: number = PRECISION): number {
  return Number(value.toFixed(precision));
}

// ============================================================================
// Length Conversions (mm <-> inches)
// ============================================================================

/**
 * Convert millimeters to inches
 * @param mm - Value in millimeters
 * @returns Value in inches (10 decimal precision)
 */
export function mmToInches(mm: number): number {
  return roundToPrecision(mm / 25.4);
}

/**
 * Convert inches to millimeters
 * @param inches - Value in inches
 * @returns Value in millimeters (10 decimal precision)
 */
export function inchesToMm(inches: number): number {
  return roundToPrecision(inches * 25.4);
}

// ============================================================================
// Temperature Conversions (°C <-> °F)
// ============================================================================

/**
 * Convert Celsius to Fahrenheit
 * @param celsius - Temperature in Celsius
 * @returns Temperature in Fahrenheit (10 decimal precision)
 */
export function celsiusToFahrenheit(celsius: number): number {
  return roundToPrecision((celsius * 9 / 5) + 32);
}

/**
 * Convert Fahrenheit to Celsius
 * @param fahrenheit - Temperature in Fahrenheit
 * @returns Temperature in Celsius (10 decimal precision)
 */
export function fahrenheitToCelsius(fahrenheit: number): number {
  return roundToPrecision((fahrenheit - 32) * 5 / 9);
}

// ============================================================================
// Pressure Conversions (atm <-> PSI)
// ============================================================================

/**
 * Convert atmospheres to PSI (pounds per square inch)
 * @param atm - Pressure in atmospheres
 * @returns Pressure in PSI (10 decimal precision)
 */
export function atmToPsi(atm: number): number {
  return roundToPrecision(atm * 14.6959488);
}

/**
 * Convert PSI to atmospheres
 * @param psi - Pressure in PSI (pounds per square inch)
 * @returns Pressure in atmospheres (10 decimal precision)
 */
export function psiToAtm(psi: number): number {
  return roundToPrecision(psi / 14.6959488);
}

// ============================================================================
// Unit System Types
// ============================================================================

export type LengthUnit = 'mm' | 'inches';
export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type PressureUnit = 'atm' | 'psi';

export type UnitSystem = 'si' | 'imperial';

// ============================================================================
// Generic Conversion Functions
// ============================================================================

/**
 * Convert length between units
 * @param value - The value to convert
 * @param from - Source unit
 * @param to - Target unit
 * @returns Converted value
 */
export function convertLength(
  value: number,
  from: LengthUnit,
  to: LengthUnit
): number {
  if (from === to) return roundToPrecision(value);

  if (from === 'mm' && to === 'inches') {
    return mmToInches(value);
  }

  return inchesToMm(value);
}

/**
 * Convert temperature between units
 * @param value - The value to convert
 * @param from - Source unit
 * @param to - Target unit
 * @returns Converted value
 */
export function convertTemperature(
  value: number,
  from: TemperatureUnit,
  to: TemperatureUnit
): number {
  if (from === to) return roundToPrecision(value);

  if (from === 'celsius' && to === 'fahrenheit') {
    return celsiusToFahrenheit(value);
  }

  return fahrenheitToCelsius(value);
}

/**
 * Convert pressure between units
 * @param value - The value to convert
 * @param from - Source unit
 * @param to - Target unit
 * @returns Converted value
 */
export function convertPressure(
  value: number,
  from: PressureUnit,
  to: PressureUnit
): number {
  if (from === to) return roundToPrecision(value);

  if (from === 'atm' && to === 'psi') {
    return atmToPsi(value);
  }

  return psiToAtm(value);
}

// ============================================================================
// Batch Conversion Utilities
// ============================================================================

export interface ConversionMap {
  length: LengthUnit;
  temperature: TemperatureUnit;
  pressure: PressureUnit;
}

export const SI_UNITS: ConversionMap = {
  length: 'mm',
  temperature: 'celsius',
  pressure: 'atm',
};

export const IMPERIAL_UNITS: ConversionMap = {
  length: 'inches',
  temperature: 'fahrenheit',
  pressure: 'psi',
};

/**
 * Get unit map for a given unit system
 */
export function getUnitMap(system: UnitSystem): ConversionMap {
  return system === 'si' ? SI_UNITS : IMPERIAL_UNITS;
}
