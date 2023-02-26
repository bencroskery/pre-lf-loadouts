import { DestinyInventoryItemDefinition, DestinyItemComponent, ItemState, } from "bungie-api-ts/destiny2";
import { For, Match, Show, Switch } from "solid-js";
import { Loadout, LoadoutItem } from "~/data/dim-bak";
import { queryLocalInventoryItemDefinition } from "~/data/requests";

interface ItemWithDef {
    key: LoadoutItem,
    invItem: DestinyItemComponent,
    def: DestinyInventoryItemDefinition
}

function ItemIcon(props: { def?: DestinyInventoryItemDefinition, class?: string, state?: ItemState }) {

    const extraClass = () => {
        let className = " "
        if (!props.state) return className;
        if (props.state === (-1 as ItemState)) return " border-[3px] border-red-700";

        if (props.state & ItemState.Masterwork) {
            className += "border-[3px] border-yellow-400"
        } else if (props.state & ItemState.Crafted) {
            className += "border-[3px] border-orange-400"
        }

        return className;
    }

    return (
        <div
            class={props.class + " bg-no-repeat bg-center"}
            title={props.def?.displayProperties.name ?? "N/A"}
            style={{ "background-image": props.def?.displayProperties.icon !== undefined ? `url(https://www.bungie.net${props.def?.displayProperties.icon})` : "", "background-size": "100%" }}
        >
            <div class={"w-full h-full " + extraClass()}>

            </div>
        </div>
    )
}

function ShowSubClass(props: { subClass: ItemWithDef, items: DestinyItemComponent[], invDef: Map<number, DestinyInventoryItemDefinition> }) {
    const findSockets = () => {
        const sockets = Object.values(props.subClass.key.socketOverrides ?? {}).map((socket) => {
            const def = props.invDef.get(socket)!;

            return { socket, def }
        });

        let aspects = [];
        let fragments = [];
        let sup = undefined;
        let other = [];
        for (const socket of sockets) {
            if (socket.def.itemTypeDisplayName.includes('Aspect')) {
                aspects.push(socket);
            } else if (socket.def.itemTypeDisplayName.includes('Fragment')) {
                fragments.push(socket);
            } else if (socket.def.itemTypeDisplayName.includes('Super')) {
                sup = socket;
            } else {
                other.push(socket);
            }
        }

        return { aspects, fragments, sup, other };
    }

    return (
        <div class="flex gap-4">
            <ItemIcon class="w-40 h-40" def={props.subClass.def} />
            <ItemIcon class="w-20 h-20 -ml-8 -mt-4" def={findSockets().sup?.def} />

            <div class="grid grid-cols-2 gap-y-2 gap-x-8">

                <div>
                    <span class="uppercase font-semibold">Abilities</span>
                    <div class="flex gap-2">
                        <For each={findSockets().other}>
                            {(socket) => <ItemIcon class="w-12 h-12" def={socket.def} />}
                        </For>
                    </div>
                </div>
                <div>
                    <span class="uppercase font-semibold">Aspects</span>
                    <div class="flex gap-2">
                        <For each={findSockets().aspects}>
                            {(socket) => <ItemIcon class="w-12 h-12" def={socket.def} />}
                        </For>
                    </div>
                </div>

                <div>
                    <span class="uppercase font-semibold">Fragments</span>
                    <div class="flex gap-2 col-span-2">
                        <For each={findSockets().fragments}>
                            {(socket) => <ItemIcon class="w-12 h-12" def={socket.def} />}
                        </For>
                    </div>
                </div>
            </div>
        </div>
    )
}

function ShowLoadout(props: { loadout: Loadout, items: DestinyItemComponent[], invDef: Map<number, DestinyInventoryItemDefinition> }) {

    const equipped = () => {
        const itemsWithDef = props.loadout.loadout.equipped.map((key) => {
            const invItem = props.items.find((item) => item.itemInstanceId === key.id)!;
            const def = props.invDef.get(key.hash)!;
            return { key, invItem, def }
        })

        const subClass = itemsWithDef.find((i) => i.def.itemType === 16);
        const weapons = itemsWithDef.filter((i) => i.def.itemType === 3);
        const armor = itemsWithDef.filter((i) => i.def.itemType === 2);

        const armorBySlot = [
            armor.find((i) => i.def.inventory?.bucketTypeHash === 3448274439),
            armor.find((i) => i.def.inventory?.bucketTypeHash === 3551918588),
            armor.find((i) => i.def.inventory?.bucketTypeHash === 14239492),
            armor.find((i) => i.def.inventory?.bucketTypeHash === 20886954),
            armor.find((i) => i.def.inventory?.bucketTypeHash === 1585787867),
        ]

        return { subClass, weapons, armor: armorBySlot };
    }

    const mods = () => {
        const modsWithDef = props.loadout.loadout.parameters.mods?.map((key) => {
            const def = props.invDef.get(key)!;
            return { key, def }
        }) ?? []

        return modsWithDef.filter(m => m.def);
    }

    const armor = () => {
        const relItems = equipped().armor.map((key, i) => {
            //const bucket = key.def.inventory?.bucketTypeHash;
            const bucket : number = i === 0 ? 3448274439 : i === 1 ? 3551918588 : i === 2 ? 14239492 : i === 3 ? 20886954 : 1585787867;
            const mods = props.loadout.loadout.parameters.modsByBucket?.[bucket!] ?? [];

            const withDef = mods.map((key) => {
                const def = props.invDef.get(key)!;
                return { key, def }
            })

            const ornament = withDef.find((i) => (i.def.itemType === 19 && i.def.itemSubType === 21) || (i.def.itemType === 2));
            const shader = withDef.find((i) => i.def.itemType === 19 && i.def.itemSubType === 20);

            return { item: key, ornament, shader };
        })

        return relItems;
    }

    // console.log(mods())
    // console.log(mods().map(m => ({ id: m.key, name: m.def.itemTypeDisplayName })))

    const modsByBucket = () => {
        const bucketed = armor().map((a, i) => {
            const key = a.item;
            const armorTypeName = i === 0 ? "helmet" : i === 1 ? "arms" : i === 2 ? "chest" : i === 3 ? "leg" : i === 4 ? "class" : "unknown";
            //const armorTypeName = key.def.inventory?.bucketTypeHash === 3448274439 ? "helmet" : key.def.inventory?.bucketTypeHash === 3551918588 ? "arms" : key.def.inventory?.bucketTypeHash === 14239492 ? "chest" : key.def.inventory?.bucketTypeHash === 20886954 ? "leg" : key.def.inventory?.bucketTypeHash === 1585787867 ? "class" : "unknown";
            const rel = mods().filter((m) => m.def?.itemTypeDisplayName.toLowerCase().includes(armorTypeName));

            return rel
        })

        const fla = bucketed.flat();
        const nonBuck = mods().filter(m => !fla.some(f => f.key === m.key));

        const eneryPerArmor = armor().map((a, i) => {
            const b = bucketed[i];
            const energy = b.reduce((acc, cur) => acc + (cur.def.plug?.energyCost?.energyCost ?? 0), 0);
            return energy;
        })

        // try to find a spot for non bucketed mods
        for (const m of nonBuck) {
            for (const i in eneryPerArmor) {
                const energy = eneryPerArmor[i];

                const newEnergy = energy + (m.def.plug?.energyCost?.energyCost ?? 0);
                if (newEnergy > 10) continue;

                // Check we don't have multiple mods of the same type
                const existing = bucketed[i].some(b => b.def.itemTypeDisplayName === m.def.itemTypeDisplayName);
                if (existing) continue;

                if (m.def.itemTypeDisplayName.startsWith("General")) {
                    bucketed[i].unshift(m);
                } else {
                    bucketed[i].push(m);
                }
                eneryPerArmor[i] = newEnergy;
                break;
            }
        }

        const fla2 = bucketed.flat();
        const unfit = mods().filter(m => !fla2.some(f => f.key === m.key));

        return { bucketed, unfit };
    }

    const dimQuery = () => {
        const wIds = equipped().weapons.map(w => w.invItem.itemInstanceId);
        const aIds = equipped().armor.map(a => a?.invItem.itemInstanceId).filter(a => a);

        return [...wIds, ...aIds].map(i => `id:${i}`).join(" or ");
    }

    return (
        <div class="text-left">
            <div class="flex gap-4 items-center">
                <div class="text-2xl mb-3">{props.loadout.loadout.name}</div>
                <button class="bg-blue-300 text-blue-900 py-1 px-2 rounded h-min" onClick={() => navigator.clipboard.writeText(dimQuery())}>Copy DIM Query</button>
            </div>

            <div class="flex flex-col gap-8">

                <Show when={equipped().subClass}><div>
                    <span class="text-lg">Subclass</span>
                    <ShowSubClass subClass={equipped().subClass!} items={props.items} invDef={props.invDef} />
                </div></Show>

                <Show when={equipped().weapons.length > 0}><div>
                    <span class="text-lg">Weapons</span>
                    <div class="flex gap-4">
                        <For each={equipped().weapons}>
                            {(d) => {
                                return (
                                    <div class="flex gap-4">
                                        <ItemIcon class="w-20 h-20" def={d.def} state={d.invItem?.state ?? -1} />
                                    </div>
                                )
                            }}
                        </For>
                    </div>
                </div></Show>

                <Show when={armor().length > 0}><div>
                    <span class="text-lg">Armor</span>
                    <div class="flex flex-col gap-4">
                        <For each={armor()}>
                            {(dk, i) => {
                                const d = dk.item;
                                const mods = modsByBucket().bucketed[i()];

                                return (
                                    <div class="flex gap-4">
                                        <ItemIcon class="w-20 h-20" def={d?.def} state={d?.invItem?.state ?? -1} />
                                        <div class="grid grid-rows-2 gap-2">
                                            <ItemIcon class="w-9 h-9" def={dk.ornament?.def} />
                                            <ItemIcon class="w-9 h-9" def={dk.shader?.def} />
                                        </div>
                                        <div class="flex gap-2">
                                            <For each={mods}>
                                                {(d) => {
                                                    return (
                                                        <ItemIcon class="w-20 h-20" def={d.def} />
                                                    )
                                                }}
                                            </For>
                                        </div>
                                    </div>
                                )
                            }}
                        </For>
                    </div>
                </div></Show>

                <Show when={modsByBucket().unfit.length > 0}><div>
                    <span class="text-lg">Additional Mods</span>
                    <div class="flex gap-2 flex-wrap w-[calc(100vw-20rem)]">
                        <For each={modsByBucket().unfit}>
                            {(d) => {
                                return (
                                    <ItemIcon class="w-20 h-20" def={d.def} />
                                )
                            }}
                        </For>
                    </div>
                </div></Show>
            </div>
        </div >
    )
}

export default function LoadoutView(props: { loadout: Loadout, items: DestinyItemComponent[] }) {
    const query = queryLocalInventoryItemDefinition();

    return (
        <Switch>
            <Match when={query.data}>
                <ShowLoadout loadout={props.loadout} items={props.items} invDef={query.data!} />
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