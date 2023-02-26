import { DestinyCharacterComponent, DestinyCharacterResponse, DestinyItemComponent, DestinyProfileResponse } from "bungie-api-ts/destiny2";
import { For, Match, Show, Switch } from "solid-js";
import { A, Navigate, useSearchParams } from "solid-start";
import LoadoutView from "~/components/LoadoutView";
import { Loadout, loadouts } from "~/data/dim-bak";

import { getToken, hasValidAuthTokens } from "~/data/oauth-tokens";
import { Profile, queryCharactersEquipment, queryLinkedProfiles, queryProfile } from "~/data/requests";

interface CharData { character: DestinyCharacterComponent, loadouts: Loadout[], items: DestinyItemComponent[] }

function classTypeToName(classType: number) {
  switch (classType) {
    case 0:
      return 'Titan';
    case 1:
      return 'Hunter';
    case 2:
      return 'Warlock';
    default:
      return 'Unknown';
  }
}

function LoadoutPanel(props: { items: DestinyItemComponent[] }) {
  const [searchParams] = useSearchParams();

  const loadout = () => loadouts().find((l) => l.loadout.id === searchParams.id);

  return (
    <div>
      <Switch fallback={
        <LoadoutView loadout={loadout()!} items={props.items} />
      }>
        <Match when={loadouts().length === 0}>
          <div class="text-lg italic mt-2">No loadouts found. Upload a DIM Backup using the button above.</div>
        </Match>
        <Match when={!loadout()}>
          <div class="text-lg italic mt-2">No loadout selected.</div>
        </Match>
      </Switch>
    </div>
  )
}

function CharacterEmblem(props: { character: DestinyCharacterComponent }) {
  return (
    <div class="relative w-64">
      <img src={`https://www.bungie.net${props.character.emblemBackgroundPath}`} />
      <div class="absolute top-0 left-0 right-0 pl-14 pr-4 text-white text-left">
        <div class="text-2xl flex">
          <div class="flex-1">{classTypeToName(props.character.classType)}</div>
          <div class="text-[#f5dc56]">{props.character?.light}</div>
        </div>
      </div>
    </div>
  )
}

function Character(props: CharData) {
  const [searchParams] = useSearchParams();

  return (
    <div class="text-left">
      <div class="flex gap-4 items-center">
        <CharacterEmblem character={props.character} />
        {/* <div class="text-2xl">{props.loadouts.length} loadouts</div> */}
      </div>
      <div class="flex flex-col px-2">
        {/* <For each={props.loadouts}>
          {(loadout) => <LoadoutView loadout={loadout} items={props.items} />}
        </For> */}
        <For each={props.loadouts}>
          {(loadout) => {
            const selected = () => loadout.loadout.id === searchParams.id;
            return <A class={selected() ? "font-bold" : ""} href={`?id=${loadout.loadout.id}`}>{loadout.loadout.name}</A>;
          }}
        </For>
      </div>
    </div>
  )
}

function CharactersLoad2(props: { profile: Profile, data: DestinyProfileResponse }) {
  const query = queryCharactersEquipment(props.profile, Object.keys(props.data.characters.data!));

  return (
    <Switch>
      <Match when={query.every(t => t.data)}>
        <Characters data1={props.data} data2={query.map(t => t.data!)} />
      </Match>
      <Match when={query.some(t => t.isLoading)}>
        <p>Loading...</p>
      </Match>
    </Switch>
  )
}

function CharactersLoad(props: { profile: Profile }) {
  const query = queryProfile(props.profile)

  return (
    <Switch>
      <Match when={query.data}>
        <CharactersLoad2 profile={props.profile} data={query.data!} />
      </Match>
      <Match when={query.error}>
        <p>Error: {(query.error as Error).message}</p>
      </Match>
      <Match when={query.isLoading}>
        <p>Loading...</p>
      </Match>
    </Switch>
  )
}

function Characters(props: { data1: DestinyProfileResponse, data2: DestinyCharacterResponse[] }) {
  const resolvedChars = () => {
    const characters = props.data1.characters.data!;

    const loadoutsByClassType = loadouts().reduce((acc, loadout) => {
      const classType = loadout.loadout.classType;
      if (!acc[classType]) {
        acc[classType] = [];
      }
      acc[classType].push(loadout);
      return acc;
    }, {} as Record<number, Loadout[]>);

    let data: { character: DestinyCharacterComponent, loadouts: Loadout[] }[] = [];
    for (const character of Object.values(characters)) {
      if (data.some(d => d.character.classType === character.classType)) {
        continue;
      }
      const loadouts = loadoutsByClassType[character.classType] ?? [];
      data.push({ character, loadouts });
    }

    return data;
  }

  const allItems = () => {
    const vault = props.data1.profileInventory.data!.items;
    const equipped = props.data2.flatMap(t => t.equipment.data!.items);
    const inventory = props.data2.flatMap(t => t.inventory.data!.items);
    return [...vault, ...equipped, ...inventory];
  }

  return (
    <div class="grid grid-cols-[16rem_1fr] gap-4 h-[calc(100vh-34px)]">
      <div class="overflow-auto">
        <For each={resolvedChars()}>
          {(d) => <Character character={d.character} loadouts={d.loadouts} items={allItems()} />}
        </For>
      </div>
      <LoadoutPanel items={allItems()} />
    </div>
  )
}

console.log(import.meta.env)

export default function Home() {
  if (!hasValidAuthTokens()) return <Navigate href={`/login`} />;
  const token = getToken();

  const query = queryLinkedProfiles(token?.bungieMembershipId!)

  return (
    <main class="text-gray-700">
      <Switch>
        <Match when={query.data}>
          <CharactersLoad profile={{ id: query.data?.profiles[0].membershipId!, type: query.data?.profiles[0].membershipType! }} />
        </Match>
        <Match when={query.error}>
          <p>Error: {(query.error as Error).message}</p>
        </Match>
        <Match when={query.isLoading}>
          <p>Loading...</p>
        </Match>
      </Switch>
    </main>
  );
}
