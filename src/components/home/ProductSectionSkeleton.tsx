import React from 'react';

export function ProductSectionSkeleton() {
  return (
    <section className="mx-auto mt-6 w-full max-w-7xl px-2 sm:mt-10 sm:px-4" aria-label="Đang tải sản phẩm">
      <div className="animate-pulse rounded-xl border border-gray-100 bg-white p-3 sm:p-5 md:p-8">
        <div className="mx-auto mb-6 flex max-w-3xl justify-center gap-3 sm:gap-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-12 w-12 rounded-full bg-gray-200 sm:h-18 sm:w-18" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className={`${index > 1 ? 'hidden sm:block' : ''} rounded-lg border border-gray-100 p-2 sm:p-3`}>
              <div className="aspect-square rounded-lg bg-gray-200" />
              <div className="mt-3 h-4 rounded bg-gray-200" />
              <div className="mt-2 h-3 w-2/3 rounded bg-gray-100" />
              <div className="mt-3 h-5 w-1/2 rounded bg-red-100" />
              <div className="mt-3 h-8 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
