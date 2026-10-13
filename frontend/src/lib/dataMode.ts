/**
 * Data Mode Helper
 *
 * Single source of truth across the application.
 * Demo and mock mode have been removed for production; the application always uses the backend API.
 */

export function isMockMode(): boolean {
  return false;
}

export function getDataMode(): "backend" {
  return "backend";
}

export function getDataModeLabel(): string {
  return "Data: Backend API";
}

