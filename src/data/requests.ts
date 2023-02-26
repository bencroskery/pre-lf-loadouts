import { createQueries, createQuery } from "@tanstack/solid-query";
import { BungieMembershipType, DestinyComponentType, getLinkedProfiles, getProfile, getCharacter } from "bungie-api-ts/destiny2";
import { DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2/interfaces";
import { $http } from ".";
import persist from "./persist";

export interface Profile {
    id: string;
    type: BungieMembershipType;
}

export const queryLinkedProfiles = (bungieMembershipId: string) => createQuery(
    () => ['linked-profiles', bungieMembershipId],
    async () => {
        const response = await persist(['linked-profiles', bungieMembershipId], () => getLinkedProfiles($http, {
            membershipId: bungieMembershipId,
            membershipType: BungieMembershipType.BungieNext,
            getAllMemberships: true,
        }));
        return response.Response;
    })

export const queryProfile = (profile: Profile) => createQuery(
    () => ['profile', profile.id],
    async () => {
        const response = await persist(['profile', profile.id], () => getProfile($http, {
            destinyMembershipId: profile.id,
            membershipType: profile.type,
            components: [DestinyComponentType.Characters, DestinyComponentType.ProfileInventories],
        }));
        return response.Response;
    })

export const queryCharactersEquipment = (profile: Profile, characterId: string[]) => createQueries({
    queries: characterId.map(characterId => ({
        queryKey: () => ['character', profile.id, characterId, 'equipment'],
        queryFn: async () => {
            const response = await persist(['character', profile.id, characterId, 'equipment'], () => getCharacter($http, {
                destinyMembershipId: profile.id,
                membershipType: profile.type,
                characterId,
                components: [DestinyComponentType.CharacterEquipment, DestinyComponentType.CharacterInventories],
            }));
            return response.Response;
        }
    }))
})

export const queryLocalInventoryItemDefinition = () => createQuery(
    () => ['DestinyInventoryItemDefinition-prelf'],
    async () => {
        const response = await fetch('https://www.bungie.net/common/destiny2_content/json/en/DestinyInventoryItemDefinition-db012e16-ceba-494c-bf5f-41c269ef22bd.json');
        const data = await response.json() as { [key: string]: DestinyInventoryItemDefinition };
        // Convert to a map
        const map = new Map<number, DestinyInventoryItemDefinition>();
        Object.values(data).forEach(d => map.set(d.hash, d));

        return map;
    }
)