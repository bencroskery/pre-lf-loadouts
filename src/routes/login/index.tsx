import { A } from "solid-start";
import { oauthClientId } from "~/data/bungie-api-utils";

export default function Login() {

  const clientId = oauthClientId();

  const authUrl = `https://www.bungie.net/en/oauth/authorize?client_id=${clientId}&response_type=code`;

  return (
    <main class="text-center mx-auto text-gray-700 p-4">
      <div>
        <h2 class="text-3xl">We need your permission...</h2>
        <p>
          Allow us to view your Destiny characters and vault.
        </p>
        <a
          class="bg-amber-500 py-4 px-6 inline-block mt-4 text-xl font-semibold text-gray-900"
          rel="noopener noreferrer"
          href={authUrl}
        >
          Authorize with Bungie.net
        </a>
      </div>
    </main>
  );
}
