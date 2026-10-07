export interface RegistryEntry {
  name: string;
  description: string;
  tags: string[];
  url: string;
}

export const REGISTRY_URL = 'https://raw.githubusercontent.com/harsha-pyla/skillhub/main/registry/index.json';

export async function fetchRegistry(): Promise<RegistryEntry[]> {
  const response = await fetch(REGISTRY_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch registry: ${response.statusText}`);
  }
  return await response.json();
}
