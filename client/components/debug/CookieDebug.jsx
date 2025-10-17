"use client";

import { useTestCookieQuery } from "@/features/auth/authApi";
import { Button } from "@/components/ui/button";

export function CookieDebug() {
  const { data, error, isLoading, refetch } = useTestCookieQuery();

  const handleTestCookie = () => {
    refetch();
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Cookie Debug Test</h3>
      <Button onClick={handleTestCookie} disabled={isLoading}>
        {isLoading ? "Testing..." : "Test Cookie Setting"}
      </Button>
      
      {data && (
        <div className="mt-4 p-2 bg-green-100 rounded">
          <p><strong>Success:</strong> {data.message}</p>
          <p><strong>Environment:</strong> {data.environment}</p>
          <p><strong>Timestamp:</strong> {data.timestamp}</p>
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-2 bg-red-100 rounded">
          <p><strong>Error:</strong> {error.message || "Failed to test cookie"}</p>
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-600">
        <p>Check browser DevTools → Application → Cookies to see if "test-cookie" is set</p>
      </div>
    </div>
  );
}
