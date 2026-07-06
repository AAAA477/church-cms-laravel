"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ["#8B6F47", "#C4A574"];

export default function GenderChart({ male, female }: { male: number; female: number }) {
  const data = [
    { name: "Male", value: male },
    { name: "Female", value: female },
  ];

  if (male === 0 && female === 0) {
    return (
      <p className="text-sm text-ink-soft flex items-center justify-center h-full">
        No member data yet.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
