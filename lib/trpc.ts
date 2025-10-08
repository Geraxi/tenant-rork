import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  // Check for explicit environment variable
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    console.log('Using EXPO_PUBLIC_RORK_API_BASE_URL:', process.env.EXPO_PUBLIC_RORK_API_BASE_URL);
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  }

  // For Rork platform, the backend is served from the same origin
  // The backend is mounted at /api, so we can use relative URLs
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    console.log('Using window.location.origin:', origin);
    return origin;
  }

  // Fallback for development (native apps)
  if (__DEV__) {
    console.log('Using development fallback URL: http://localhost:8081');
    return "http://localhost:8081";
  }

  // If no environment variable is set, try to use a reasonable default
  console.warn('No EXPO_PUBLIC_RORK_API_BASE_URL found, using fallback');
  return "";
};

const baseUrl = getBaseUrl();
const trpcUrl = `${baseUrl}/api/trpc`;
console.log('tRPC client connecting to:', trpcUrl);
console.log('Environment variables:', {
  EXPO_PUBLIC_RORK_API_BASE_URL: process.env.EXPO_PUBLIC_RORK_API_BASE_URL,
  __DEV__: __DEV__,
});

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: trpcUrl,
      transformer: superjson,
      async headers() {
        try {
          // Get user data from AsyncStorage to extract user ID
          const userData = await AsyncStorage.getItem('tenant_user');
          if (userData) {
            const user = JSON.parse(userData);
            if (user && user.id) {
              console.log('Adding authorization header for user:', user.id);
              return {
                authorization: `Bearer ${user.id}`,
                'Content-Type': 'application/json',
              };
            }
          }
          console.log('No user found, sending request without authorization');
        } catch (error) {
          console.error('Error getting user data from AsyncStorage:', error);
        }
        return {
          'Content-Type': 'application/json',
        };
      },
      fetch: async (url, options) => {
        console.log('tRPC request to:', url);
        console.log('Request options:', {
          method: options?.method,
          headers: options?.headers,
          bodyLength: options?.body ? String(options.body).length : 0,
        });
        
        try {
          // Create a timeout promise
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000);
          });
          
          // Race between fetch and timeout
          const response = await Promise.race([
            fetch(url, options),
            timeoutPromise
          ]);
          
          console.log('tRPC response status:', response.status);
          console.log('tRPC response ok:', response.ok);
          
          if (!response.ok) {
            console.error('tRPC response not ok:', response.status, response.statusText);
            // Clone the response before reading it
            const clonedResponse = response.clone();
            try {
              const errorText = await clonedResponse.text();
              console.error('tRPC error response body:', errorText);
            } catch (e) {
              console.error('Could not read error response body:', e);
            }
          }
          
          return response;
        } catch (error) {
          console.error('tRPC fetch error:', error);
          if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
          }
          throw error;
        }
      },
    }),
  ],
});