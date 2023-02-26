import { QueryClient } from '@tanstack/solid-query';
import { fetchWithBungieOAuth } from './auth-fetch';
import { BUNGIE_API_KEY } from './bungie-api-utils';
import { createFetchWithNonStoppingTimeout, createHttpClient } from './http-client';
import { rateLimitedFetch } from './rate-limiter';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
        }
    }
});

export const $http = createHttpClient(
    createFetchWithNonStoppingTimeout(
        rateLimitedFetch(fetchWithBungieOAuth),
        10000,
        (startTime, timeout) => {
            console.log(`Request timed out after ${timeout}ms.`, { startTime, timeout });
        }
    ),
    BUNGIE_API_KEY
);
