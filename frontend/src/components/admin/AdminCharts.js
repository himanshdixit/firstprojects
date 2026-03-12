'use client';

import React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Card from '@/components/ui/Card';

const PIE_COLORS = ['#10b981', '#f59e0b', '#0ea5e9', '#ef4444'];

export default function AdminCharts({ monthly = [], statusBreakdown = [] }) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card>
        <h3 className="text-lg font-semibold">Monthly Activity</h3>
        <div className="mt-4 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthly} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="usersGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="postsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.22} />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="users" stroke="#10b981" fill="url(#usersGradient)" strokeWidth={2} />
              <Area type="monotone" dataKey="posts" stroke="#0ea5e9" fill="url(#postsGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold">Post Status Split</h3>
        <div className="mt-4 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusBreakdown}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={95}
                innerRadius={55}
                paddingAngle={4}
              >
                {statusBreakdown.map((entry, index) => (
                  <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
