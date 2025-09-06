import { defineCollection } from 'astro:content';

const BASE_URL = import.meta.env.PUBLIC_BASE_URL || "http://localhost:8080";

// Cache TTL: 15 minutes (900000 ms)
const CACHE_TTL = 15 * 60 * 1000;

// Global collections for static data
export const units = defineCollection({
  loader: async () => {
    const response = await fetch(`${BASE_URL}/units`);
    if (!response.ok) {
      throw new Error(`Failed to fetch units: ${response.status}`);
    }
    const unitsData = await response.json();
    
    // Return the units directly, Astro will wrap them automatically
    return unitsData.map((unit: any) => ({
      id: unit.baseId,
      ...unit  // Spread the unit data directly, no nested 'data' property
    }));
  }
});

export const territoryBattles = defineCollection({
  loader: async () => {
    const response = await fetch(`${BASE_URL}/territory-battles`);
    if (!response.ok) {
      throw new Error(`Failed to fetch territory battles: ${response.status}`);
    }
    const tbsData = await response.json();
    
    // Return the territory battles directly, Astro will wrap them automatically
    return tbsData.map((tb: any) => {
      const { id, ...tbWithoutId } = tb;  // Extract id and spread the rest
      return {
        id: `tb-${id}`,  // Use prefixed string ID
        tbId: id,        // Keep original ID as tbId
        ...tbWithoutId   // Spread the rest (name, etc.)
      };
    });
  }
});

export const guilds = defineCollection({
  loader: async () => {
    const response = await fetch(`${BASE_URL}/guilds`);
    if (!response.ok) {
      throw new Error(`Failed to fetch guilds: ${response.status}`);
    }
    const guildsData = await response.json();
    
    // Return the guilds directly, Astro will wrap them automatically
    return guildsData.map((guild: any) => {
      return {
        id: guild.guildId,
        ...guild  // Spread the guild data directly, no nested 'data' property
      };
    });
  }
});

export const guildPlayers = defineCollection({
  loader: async () => {
    // First get all guilds
    const guildsResponse = await fetch(`${BASE_URL}/guilds`);
    if (!guildsResponse.ok) {
      throw new Error(`Failed to fetch guilds: ${guildsResponse.status}`);
    }
    const guildsData = await guildsResponse.json();
    
    // Then load all players in parallel
    const playerPromises = guildsData.map(async (guild: any) => {
      const response = await fetch(`${BASE_URL}/guilds/${guild.guildId}/players`);
      if (!response.ok) {
        console.warn(`Failed to fetch players for guild ${guild.guildId}: ${response.status}`);
        return [];
      }
      const players = await response.json();
      
      return players.map((player: any) => ({
        id: `${guild.guildId}-${player.playerId}`,
        guildId: guild.guildId,  // Add guildId to player
        ...player  // Spread player data directly, no nested 'data' property
      }));
    });
    
    const allPlayersArrays = await Promise.all(playerPromises);
    return allPlayersArrays.flat();
  }
});

export const guildPlatoons = defineCollection({
  loader: async () => {
    // First get all guilds
    const guildsResponse = await fetch(`${BASE_URL}/guilds`);
    if (!guildsResponse.ok) {
      throw new Error(`Failed to fetch guilds: ${guildsResponse.status}`);
    }
    const guildsData = await guildsResponse.json();
    
    // Then load all platoons in parallel
    const platoonPromises = guildsData.map(async (guild: any) => {
      const response = await fetch(`${BASE_URL}/guilds/${guild.guildId}/platoons`);
      if (!response.ok) {
        console.warn(`Failed to fetch platoons for guild ${guild.guildId}: ${response.status}`);
        return [];
      }
      const platoons = await response.json();
      
      return platoons.map((unit: any) => ({
        id: `${guild.guildId}-${unit.playerId}-${unit.baseId}`,
        guildId: guild.guildId,  // Add guildId to platoon unit
        ...unit  // Spread unit data directly, no nested 'data' property
      }));
    });
    
    const allPlatoonsArrays = await Promise.all(platoonPromises);
    return allPlatoonsArrays.flat();
  }
});

export const territoryBattleOperations = defineCollection({
  loader: async () => {
    // First get all territory battles
    const tbsResponse = await fetch(`${BASE_URL}/territory-battles`);
    if (!tbsResponse.ok) {
      throw new Error(`Failed to fetch territory battles: ${tbsResponse.status}`);
    }
    const tbsData = await tbsResponse.json();
    
    // Then load all operations in parallel
    const operationPromises = tbsData.map(async (tb: any) => {
      const response = await fetch(`${BASE_URL}/territory-battles/${tb.id}/operations`);
      if (!response.ok) {
        console.warn(`Failed to fetch operations for TB ${tb.id}: ${response.status}`);
        return null;
      }
      const operations = await response.json();
      
      const { id, ...operationsWithoutId } = operations;  // Remove id if present
      return {
        id: `tb-${tb.id}-ops`,  // Unique ID for operations
        tbId: tb.id,
        tbName: tb.name,
        ...operationsWithoutId  // Spread operations data without conflicting id
      };
    });
    
    const allOperations = await Promise.all(operationPromises);
    return allOperations.filter(op => op !== null);
  }
});

export const collections = {
  units,
  territoryBattles,
  guilds,
  guildPlayers,
  guildPlatoons,
  territoryBattleOperations
};
