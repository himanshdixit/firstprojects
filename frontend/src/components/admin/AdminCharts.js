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

const PIE_COLORS = ['#d6b57e', '#8f6b33', '#b39a7a', '#5f4931'];

const tooltipStyle = {
  borderRadius: '18px',
  border: '1px solid rgba(183,146,87,0.2)',
  backgroundColor: 'rgba(255,250,244,0.96)',
  boxShadow: '0 14px 34px rgba(18,12,7,0.1)',
};

export default function AdminCharts({ monthly = [], statusBreakdown = [] }) {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <Card variant="dashboard" hover={false} className="overflow-hidden">
        <Card.Header className="flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Monthly Activity</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Platform growth across new members and published stories.
            </p>
          </div>
        </Card.Header>
        <div className="mt-4 h-[290px] w-full sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthly} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="usersGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d6b57e" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#d6b57e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="postsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8f6b33" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8f6b33" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 6" stroke="rgba(183,146,87,0.3)" opacity={0.22} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} width={30} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Area type="monotone" dataKey="users" stroke="#d6b57e" fill="url(#usersGradient)" strokeWidth={2.5} />
              <Area type="monotone" dataKey="posts" stroke="#8f6b33" fill="url(#postsGradient)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card variant="dashboard" hover={false} className="overflow-hidden">
        <Card.Header className="flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Post Status Split</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Draft versus published distribution in the editorial queue.
            </p>
          </div>
        </Card.Header>
        <div className="mt-4 h-[290px] w-full sm:h-72">
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
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
