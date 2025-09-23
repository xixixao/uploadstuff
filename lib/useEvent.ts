// Ripped from https://github.com/scottrippey/react-use-event-hook
import { useInsertionEffect, useRef } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...args: any[]) => any;

/**
 * Similar to useCallback, with a few subtle differences:
 * - The returned function is a stable reference, and will always be the same between renders
 * - No dependency lists required
 * - Properties or state accessed within the callback will always be "current"
 */
export function useEvent<TCallback extends AnyFunction>(
  callback: TCallback
): TCallback {
  // Keep track of the latest callback:
  const latestRef = useRef<TCallback>(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    useEvent_shouldNotBeInvokedBeforeMount as any
  );
  
  // useInsertionEffect is stable in React 19 and handles SSR properly
  useInsertionEffect(() => {
    latestRef.current = callback;
  }, [callback]);

  // Create a stable callback that always calls the latest callback:
  // using useRef instead of useCallback avoids creating and empty array on every render
  const stableRef = useRef<TCallback | null>(null);
  if (!stableRef.current) {
    stableRef.current = function (this: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, prefer-rest-params, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
      return latestRef.current.apply(this, arguments as any);
    } as TCallback;
  }

  return stableRef.current;
}

/**
 * Render methods should be pure, especially when concurrency is used,
 * so we will throw this error if the callback is called while rendering.
 */
function useEvent_shouldNotBeInvokedBeforeMount() {
  throw new Error(
    "INVALID_USEEVENT_INVOCATION: the callback from useEvent cannot be invoked before the component has mounted."
  );
}
