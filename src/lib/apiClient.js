import { getCollection } from 'astro:content';

const BASE_URL = import.meta.env.PUBLIC_BASE_URL || "http://localhost:8080";

// Direct API fallback functions
async function fetchFromApi(endpoint) {
  const response = await fetch(`${BASE_URL}${endpoint}`);
  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }
  return await response.json();
}

// API client with Live Collections and direct API fallbacks
export async function getGuilds() {
  try {
    const guilds = await getCollection('guilds');
    
    if (!guilds || guilds.length === 0) {
      return await fetchFromApi('/guilds');
    }
    
    const guildData = guilds.map(guild => guild.data);
    return guildData.sort((a, b) => (b.guildGalacticPower || 0) - (a.guildGalacticPower || 0));
  } catch (error) {
    console.warn('Live Collection failed, falling back to API:', error);
    return await fetchFromApi('/guilds');
  }
}

export async function getUnits() {
  try {
    const units = await getCollection('units');
    if (!units || units.length === 0) {
      return await fetchFromApi('/units');
    }
    
    return units.map(unit => unit.data);
  } catch (error) {
    console.warn('Units Live Collection failed, falling back to API:', error);
    return await fetchFromApi('/units');
  }
}

export async function getTerritoryBattles() {
  try {
    const tbs = await getCollection('territoryBattles');
    if (!tbs || tbs.length === 0) {
      return await fetchFromApi('/territory-battles');
    }
    
    return tbs.map(tb => tb.data);
  } catch (error) {
    console.warn('Territory Battles Live Collection failed, falling back to API:', error);
    return await fetchFromApi('/territory-battles');
  }
}

export async function getGuildPlayers(guildId) {
  try {
    const allPlayers = await getCollection('guildPlayers');
    if (!allPlayers || allPlayers.length === 0) {
      return await fetchFromApi(`/guilds/${guildId}/players`);
    }
    
    return allPlayers
      .filter(player => player.data.guildId === guildId)
      .map(player => player.data);
  } catch (error) {
    console.warn('Guild Players Live Collection failed, falling back to API:', error);
    return await fetchFromApi(`/guilds/${guildId}/players`);
  }
}

export async function getGuildPlatoons(guildId) {
  try {
    const allPlatoons = await getCollection('guildPlatoons');
    if (!allPlatoons || allPlatoons.length === 0) {
      return await fetchFromApi(`/guilds/${guildId}/platoons`);
    }
    
    return allPlatoons
      .filter(platoon => platoon.data.guildId === guildId)
      .map(platoon => platoon.data);
  } catch (error) {
    console.warn('Guild Platoons Live Collection failed, falling back to API:', error);
    return await fetchFromApi(`/guilds/${guildId}/platoons`);
  }
}

export async function getTerritoryBattleOperations(tbId) {
  try {
    const allOperations = await getCollection('territoryBattleOperations');
    if (!allOperations || allOperations.length === 0) {
      return await fetchFromApi(`/territory-battles/${tbId}/operations`);
    }
    
    const tbOperations = allOperations.find(op => op.data.tbId === parseInt(tbId));
    
    if (!tbOperations) {
      return await fetchFromApi(`/territory-battles/${tbId}/operations`);
    }

    return {
      phases: tbOperations.data.phases || []
    };
  } catch (error) {
    console.warn('Territory Battle Operations Live Collection failed, falling back to API:', error);
    return await fetchFromApi(`/territory-battles/${tbId}/operations`);
  }
}

export async function getMissingTerritoryBattleOperationUnits(tbId, guildId) {
  try {
    // This endpoint computes data, so we always call the API directly
    return await fetchFromApi(`/territory-battles/${tbId}/needed/${guildId}`);
  } catch (error) {
    console.warn('Missing units API call failed:', error);
    throw error; // Re-throw since this is a computed endpoint
  }
}