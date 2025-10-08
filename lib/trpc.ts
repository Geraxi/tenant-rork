import { createTRPCReact, createTRPCClient } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const url = window.location.origin;
    console.log('Web baseUrl:', url);
    return url;
  }

  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    console.log('Using EXPO_PUBLIC_RORK_API_BASE_URL:', process.env.EXPO_PUBLIC_RORK_API_BASE_URL);
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  }

  if (__DEV__) {
    console.log('Using dev localhost');
    return "http://localhost:8081";
  }

  console.log('Using empty baseUrl');
  return "";
};

const baseUrl = getBaseUrl();
const trpcUrl = `${baseUrl}/api/trpc`;
console.log('tRPC URL configured as:', trpcUrl);

export const trpcReactClient = trpc.createClient({
  links: [
    httpLink({
      url: trpcUrl,
      transformer: superjson,
      async headers() {
        try {
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
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000);
          });
          
          const response = await Promise.race([
            fetch(url, options),
            timeoutPromise
          ]);
          
          console.log('tRPC response status:', response.status);
          console.log('tRPC response ok:', response.ok);
          
          if (!response.ok) {
            console.error('tRPC response not ok:', response.status, response.statusText);
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

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpLink({
      url: trpcUrl,
      transformer: superjson,
      async headers() {
        try {
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
        console.log('tRPC vanilla client request to:', url);
        console.log('Request options:', {
          method: options?.method,
          headers: options?.headers,
          bodyLength: options?.body ? String(options.body).length : 0,
        });
        
        try {
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000);
          });
          
          const response = await Promise.race([
            fetch(url, options),
            timeoutPromise
          ]);
          
          console.log('tRPC vanilla client response status:', response.status);
          console.log('tRPC vanilla client response ok:', response.ok);
          
          if (!response.ok) {
            console.error('tRPC vanilla client response not ok:', response.status, response.statusText);
            const clonedResponse = response.clone();
            try {
              const errorText = await clonedResponse.text();
              console.error('tRPC vanilla client error response body:', errorText);
            } catch (e) {
              console.error('Could not read error response body:', e);
            }
          }
          
          return response;
        } catch (error) {
          console.error('tRPC vanilla client fetch error:', error);
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