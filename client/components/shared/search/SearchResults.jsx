"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchProductQuery } from "@/features/products/productApi";
import useDebounce from "@/hooks/useDebounce";
import { Loader2 } from "lucide-react";

const SearchResults = ({ query, onClose }) => {
  const debouncedQuery = useDebounce(query, 300);
  const { data: searchData, isLoading, isError } = useSearchProductQuery(debouncedQuery, {
    skip: !debouncedQuery.trim(),
  });

  const products = searchData?.data?.products || [];

  if (!query.trim()) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-2 p-4 z-50">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span className="text-sm text-gray-600">Searching...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-2 p-4 z-50">
        <div className="text-center py-4">
          <span className="text-sm text-red-600">Error searching products</span>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-2 z-50 max-h-96 overflow-y-auto">
      {products.length > 0 ? (
        <div className="p-2">
          <div className="text-xs text-gray-500 mb-2 px-2">
            {products.length} product{products.length !== 1 ? 's' : ''} found
          </div>
          {products.slice(0, 5).map((product) => (
            <Link
              key={product._id}
              href={`/product/${product._id}`}
              onClick={onClose}
              className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="w-12 h-12 flex-shrink-0">
                <Image
                  src={product.images?.[0] || "/img/product.png"}
                  alt={product.name}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover rounded"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {product.name}
                </h4>
                <p className="text-sm text-gray-600">
                  ₹{product.price}
                </p>
                {product.category && (
                  <p className="text-xs text-gray-500">
                    {product.category.name}
                  </p>
                )}
              </div>
            </Link>
          ))}
          {products.length > 5 && (
            <div className="p-2 border-t">
              <Link
                href={`/shop?search=${encodeURIComponent(query)}`}
                onClick={onClose}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View all {products.length} results
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 text-center">
          <p className="text-sm text-gray-600">No products found</p>
          <p className="text-xs text-gray-500 mt-1">
            Try different keywords or check spelling
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
