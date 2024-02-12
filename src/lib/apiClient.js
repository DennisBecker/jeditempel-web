const BASE_URL = import.meta.env.PUBLIC_BASE_URL || "http://localhost:8080";

console.log("BASE_URL", BASE_URL);
export async function getGuilds() {
    const response = await fetch(`${BASE_URL}/guilds`);
    return await response.json();
}

export async function getUnits() {
    const response = await fetch(`${BASE_URL}/units`);
    return await response.json();
}

export async function getTerritoryBattles() {
    const response = await fetch(`${BASE_URL}/territory-battles`);
    return await response.json();
}

export async function getGuildPlayers(guildId) {
    const response = await fetch(`${BASE_URL}/guilds/${guildId}/players`);
    return await response.json();
}

export async function getGuildPlatoons(guildId) {
    const response = await fetch(`${BASE_URL}/guilds/${guildId}/platoons`);
    return await response.json();
}

export async function getTerritoryBattleOperations(tbId) {
    const response = await fetch(`${BASE_URL}/territory-battles/${tbId}/operations`);
    return await response.json();
}

export async function getMissingTerritoryBattleOperationUnits(tbId, guildId) {
    const response = await fetch(`${BASE_URL}/territory-battles/${tbId}/needed/${guildId}`);
    return await response.json();
}