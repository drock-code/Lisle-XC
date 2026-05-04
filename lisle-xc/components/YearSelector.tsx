"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Select } from "@/components/Select";
import { useCallback } from "react";

interface YearSelectorProps {
  years: (number | string)[];
  selectedYear: number | string;
}

export function YearSelector({ years, selectedYear }: YearSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // This safely updates ONLY the year parameter in the URL, keeping others intact
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  return (
    <Select
      value={selectedYear.toString()}
      onChange={(e) => {
        router.push(pathname + "?" + createQueryString("year", e.target.value));
      }}
      className="border-none bg-transparent focus:ring-0 font-bold text-base pr-8"
      wrapperClassName="w-full md:w-auto"
    >
      {years.map((y) => (
        <option key={y} value={y.toString()}>
          {y} Season
        </option>
      ))}
    </Select>
  );
}