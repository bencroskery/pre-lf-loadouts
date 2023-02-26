import { Show } from "solid-js";
import { SaveLoadoutsFromDimBak } from "~/data/dim-bak";
import { getToken } from "~/data/oauth-tokens";
import { queryLinkedProfiles } from "~/data/requests";

function uploadDimBackup() {
  var input = document.createElement('input');
  input.type = 'file';

  input.onchange = async e => {
    const file = (e.target as HTMLInputElement).files![0];
    const json = await file.text()
    SaveLoadoutsFromDimBak(json);
  }

  input.click();
}

function NavControls() {

  const token = getToken();

  const query = queryLinkedProfiles(token!.bungieMembershipId!)

  return (
    <Show when={query.data}>
      <div class="px-4 py-1">
        {query.data!.bnetMembership.bungieGlobalDisplayName}#{query.data!.bnetMembership.bungieGlobalDisplayNameCode}
        {/* put logout button here */}
      </div>
      <div>
        <button onClick={uploadDimBackup}>Upload DIM Backup</button>
      </div>
      <div>
      </div>
    </Show>
  )
}

export default function Nav() {
  const token = getToken();
  return (
    <nav class="bg-sky-800 text-white h-[34px] flex justify-between items-center">
      <Show when={token}>
        <NavControls />
      </Show>
    </nav>
  )
}