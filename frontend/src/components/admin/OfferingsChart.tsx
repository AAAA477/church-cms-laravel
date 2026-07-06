"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function OfferingsChart({
  data,
}: {
  data: { label: string | number; amount: number }[];
}) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-ink-soft flex items-center justify-center h-full">
        No offering records yet.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data}>
        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="amount" fill="#8B6F47" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
