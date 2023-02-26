import { createSignal } from "solid-js";

export interface LoadoutItem {
    id: string;
    hash: number;
    socketOverrides?: { [key: number]: number };
}

interface LoadoutParameters {
    mods: number[];
    modsByBucket: { [key: number]: number[] };
    lockArmorEnergyType: number;
    assumeArmorMasterwork: number;
}

export interface Loadout {
    platformMembershipId: string;
    destinyVersion: number;
    loadout: {
        id: string;
        name: string;
        classType: number;
        clearSpace: boolean;
        equipped: LoadoutItem[];
        createdAt: number;
        lastUpdatedAt: number;
        parameters: LoadoutParameters;
    }
}

interface DIMBak {
    loadouts: Loadout[];
}

export const [loadouts, setLoadouts] = createSignal<Loadout[]>([]);
LoadLoadouts();

export function LoadLoadouts() {
    const str = localStorage.getItem('loadouts') as string;
    if (!str) return;
    const loadouts = JSON.parse(str) as Loadout[];
    if (!loadouts) return;
    setLoadouts(loadouts);
}

export function SaveLoadoutsFromDimBak(bakJson: string) {
    try {
        const bak = JSON.parse(bakJson) as DIMBak;
        localStorage.setItem('loadouts', JSON.stringify(bak.loadouts));
        setLoadouts(bak.loadouts);
    } catch (e) {
        console.error(e);
        alert('Error parsing DIM backup file.');
    }
}