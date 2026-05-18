import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Strips currency symbols and non-numeric characters, returning a number.
 * e.g. "$12.99" → 12.99
 */
export const parsePrice = (price: string): number =>
  Number(String(price).replace(/[^0-9.]/g, "")) || 0;

/**
 * Formats a number as a USD price string.
 * e.g. 12.99 → "$12.99"
 */
export const toPrice = (value: number): string => `$${value.toFixed(2)}`;
