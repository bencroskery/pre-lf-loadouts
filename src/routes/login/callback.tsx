import { useNavigate } from "solid-start";
import { getAccessTokenFromCode } from "~/data/oauth";
import { setToken } from "~/data/oauth-tokens";

async function completeAuth(code: string | null) {
  if (code === null || code.length === 0) {
    return "We expected an authorization code parameter from Bungie.net, but didn't get one.";
  }

  try {
    const token = await getAccessTokenFromCode(code);
    setToken(token);
  } catch (e) {
    console.log('authReturn', e);
    return "We encountered an error while trying to get an access token from Bungie.net.";
  }
}

export default function Callback() {
  const navigate = useNavigate()

  const queryParams = new URL(window.location.href).searchParams;
  const code = queryParams.get('code');

  completeAuth(code).then((error) => {
    if (error) {
      const errorElement = document.getElementById('login-error');
      if (errorElement) {
        errorElement.innerText = error;
      }
    } else {
      navigate('/');
    }
  });

  return (
    <main class="text-center mx-auto text-gray-700 p-4">
      <h1 class="max-6-xs text-6xl text-sky-700 font-thin uppercase my-16">
        Completing login...
      </h1>
      <p id="login-error"></p>
    </main>
  );
}
