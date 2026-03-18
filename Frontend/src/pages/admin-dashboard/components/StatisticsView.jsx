import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import axiosClient from '../../../api/axiosClient';

const PERIODS = [
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'year', label: 'This Year' }
];

const StatisticsView = ({ accessibilitySettings }) => {
  const [data, setData] = useState({
    totalUsers: 0,
    newUsers: 0,
    subscribedUsers: 0,
    period: 'month',
    usersWithPlans: [],
    planDistribution: [],
    newUsersTrend: []
  });
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data: res } = await axiosClient.get(`/api/admin/statistics?period=${period}`);
      setData({
        totalUsers: res?.totalUsers ?? 0,
        newUsers: res?.newUsers ?? 0,
        subscribedUsers: res?.subscribedUsers ?? 0,
        period: res?.period ?? period,
        usersWithPlans: res?.usersWithPlans ?? [],
        planDistribution: res?.planDistribution ?? [],
        newUsersTrend: res?.newUsersTrend ?? []
      });
    } catch {
      setData({
        totalUsers: 0,
        newUsers: 0,
        subscribedUsers: 0,
        period,
        usersWithPlans: [],
        planDistribution: [],
        newUsersTrend: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [period]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface border border-border rounded-lg px-3 py-2 shadow-lg text-sm">
          <p className="font-medium text-text-primary mb-1">{label}</p>
          {payload.map((entry, i) => (
            <p key={i} className="text-text-secondary">
              <span style={{ color: entry.color }}>{entry.name}: </span>
              {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-text-secondary animate-pulse-gentle">
        Loading statistics...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">Statistics</h2>
        <div className="flex gap-2">
          {PERIODS.map((p) => (
            <Button
              key={p.id}
              variant={period === p.id ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setPeriod(p.id)}
            >
              {p.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-surface border border-border rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
              <Icon name="Users" size={24} className="text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-text-primary">{data.totalUsers}</div>
              <div className="text-sm text-text-secondary">Total Users</div>
            </div>
          </div>
          <p className="text-xs text-text-secondary mt-2">All active users in the system</p>
        </div>

        <div className="bg-surface border border-border rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-lg bg-success-100 flex items-center justify-center">
              <Icon name="UserPlus" size={24} className="text-success-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-text-primary">{data.newUsers}</div>
              <div className="text-sm text-text-secondary">New Users</div>
            </div>
          </div>
          <p className="text-xs text-text-secondary mt-2">New sign-ups in {PERIODS.find((x) => x.id === period)?.label?.toLowerCase() || period}</p>
        </div>

        <div className="bg-surface border border-border rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-lg bg-accent-100 flex items-center justify-center">
              <Icon name="CreditCard" size={24} className="text-accent-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-text-primary">{data.subscribedUsers}</div>
              <div className="text-sm text-text-secondary">Subscribed Users</div>
            </div>
          </div>
          <p className="text-xs text-text-secondary mt-2">Users on paid plans (Basic, Premium)</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Plan Distribution Pie Chart */}
        <div className="bg-surface border border-border rounded-lg p-6 shadow-sm">
          <h3 className="text-base font-semibold text-text-primary mb-4">Users by Plan</h3>
          {data.planDistribution?.length > 0 ? (
            <div className="h-64" role="img" aria-label="Plan distribution pie chart">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.planDistribution}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, count }) => `${name}: ${count}`}
                  >
                    {data.planDistribution.map((entry, index) => (
                      <Cell key={index} fill={entry.fill || '#6B7280'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Users']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-text-secondary text-sm">No plan data</div>
          )}
        </div>

        {/* New Users Trend Bar Chart */}
        <div className="bg-surface border border-border rounded-lg p-6 shadow-sm">
          <h3 className="text-base font-semibold text-text-primary mb-4">New Users Trend</h3>
          {data.newUsersTrend?.length > 0 ? (
            <div className="h-64" role="img" aria-label="New users trend bar chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.newUsersTrend} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="label" stroke="#6B7280" fontSize={12} />
                  <YAxis stroke="#6B7280" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="New users" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-text-secondary text-sm">No trend data</div>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-surface border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-base font-semibold text-text-primary">All Users & Plans</h3>
          <p className="text-xs text-text-secondary mt-0.5">User, email, plan, and role</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-secondary border-b border-border">
                <th className="text-left px-6 py-3 font-medium text-text-primary">Name</th>
                <th className="text-left px-6 py-3 font-medium text-text-primary">Email</th>
                <th className="text-left px-6 py-3 font-medium text-text-primary">Plan</th>
                <th className="text-left px-6 py-3 font-medium text-text-primary">Role</th>
                <th className="text-left px-6 py-3 font-medium text-text-primary">Joined</th>
              </tr>
            </thead>
            <tbody>
              {data.usersWithPlans?.length > 0 ? (
                data.usersWithPlans.map((u) => (
                  <tr key={u.id} className="border-b border-border last:border-0 hover:bg-surface-secondary/50">
                    <td className="px-6 py-3 text-text-primary">{u.name}</td>
                    <td className="px-6 py-3 text-text-secondary">{u.email}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          u.planName === 'Premium' ? 'bg-accent-100 text-accent-700' : u.planName === 'Basic' ? 'bg-primary-100 text-primary-700' : 'bg-surface-tertiary text-text-secondary'
                        }`}
                      >
                        {u.planName === 'Unknown' ? 'Free' : u.planName} {u.planPrice > 0 ? `($${u.planPrice})` : ''}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-text-secondary">{u.roleName}</td>
                    <td className="px-6 py-3 text-text-secondary">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-text-secondary">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-surface-secondary rounded-lg p-4 text-sm text-text-secondary">
        <p><strong>Period:</strong> {PERIODS.find((x) => x.id === data.period)?.label || data.period}</p>
        {data.startDate && <p><strong>From:</strong> {new Date(data.startDate).toLocaleDateString()}</p>}
      </div>
    </div>
  );
};

export default StatisticsView;
