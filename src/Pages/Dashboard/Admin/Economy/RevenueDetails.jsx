import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../../../hooks/useAxiosSecure';
import DataLoading from '../../../../Components/Common/Loaders/DataLoading';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line
} from 'recharts';
import { Banknote, ShoppingBag, Calendar } from 'lucide-react';

const RevenueDetails = () => {
    const { privateApi } = useAxiosSecure();
    const [range, setRange] = useState('day'); // day, week, month, year
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    // Month Range
    const [startMonth, setStartMonth] = useState('');
    const [endMonth, setEndMonth] = useState('');

    // Year Range
    const currentYear = new Date().getFullYear();
    const [startYear, setStartYear] = useState('');
    const [endYear, setEndYear] = useState('');

    // Generate years for dropdown
    const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

    const { data: revenueData = [], isLoading } = useQuery({
        queryKey: ['revenue-series', range, startDate, endDate, startMonth, endMonth, startYear, endYear],
        queryFn: async () => {
            let query = `/orders/admin/revenue-series?range=${range}`;

            if (range === 'day') {
                if (startDate) query += `&startDate=${startDate}`;
                if (endDate) query += `&endDate=${endDate}`;
            } else if (range === 'month') {
                if (startMonth) query += `&startDate=${startMonth}-01`;
                if (endMonth) {
                    // Get last day of end month
                    const [y, m] = endMonth.split('-');
                    const lastDay = new Date(y, m, 0).getDate();
                    query += `&endDate=${endMonth}-${lastDay}`;
                }
            } else if (range === 'year') {
                if (startYear) query += `&startDate=${startYear}-01-01`;
                if (endYear) query += `&endDate=${endYear}-12-31`;
            }

            const res = await privateApi.get(query);
            return Array.isArray(res) ? res : (res?.data || []);
        }
    });

    // Reset date filters when range changes
    const handleRangeChange = (newRange) => {
        setRange(newRange);
        setStartDate(''); setEndDate('');
        setStartMonth(''); setEndMonth('');
        setStartYear(''); setEndYear('');
    };

    // Calculate totals for the selected period
    const totalPeriodRevenue = revenueData.reduce((acc, curr) => acc + curr.totalRevenue, 0);
    const totalPeriodOrders = revenueData.reduce((acc, curr) => acc + curr.totalOrders, 0);

    return (
        <div className="w-full">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-amber-900">Revenue Analytics</h2>
                <p className="text-amber-700 text-sm">Detailed insights into your sales performance</p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 mb-8 bg-white p-4 rounded-xl shadow-sm border border-amber-50 w-full md:w-fit">
                <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                    {['day', 'week', 'month', 'year'].map((filter) => (
                        <button
                            key={filter}
                            onClick={() => handleRangeChange(filter)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize ${range === filter
                                ? 'bg-amber-500 text-white shadow-sm'
                                : 'text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {filter}s
                        </button>
                    ))}
                </div>

                {/* Specific Filters based on Range */}
                <div className="flex flex-wrap items-center gap-2 mt-4 md:mt-0 md:border-l md:border-gray-200 md:pl-4 md:ml-2">
                    {range === 'day' && (
                        <>
                            <div className="flex flex-col">
                                <label className="text-[10px] text-gray-400 font-semibold uppercase">Start Date</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="border border-gray-300 rounded-md px-2 py-1 text-sm text-gray-600 focus:outline-none focus:border-amber-500"
                                />
                            </div>
                            <span className="text-gray-400 font-bold">-</span>
                            <div className="flex flex-col">
                                <label className="text-[10px] text-gray-400 font-semibold uppercase">End Date</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="border border-gray-300 rounded-md px-2 py-1 text-sm text-gray-600 focus:outline-none focus:border-amber-500"
                                />
                            </div>
                        </>
                    )}

                    {range === 'month' && (
                        <>
                            <div className="flex flex-col">
                                <label className="text-[10px] text-gray-400 font-semibold uppercase">Start Month</label>
                                <input
                                    type="month"
                                    value={startMonth}
                                    onChange={(e) => setStartMonth(e.target.value)}
                                    className="border border-gray-300 rounded-md px-2 py-1 text-sm text-gray-600 focus:outline-none focus:border-amber-500"
                                />
                            </div>
                            <span className="text-gray-400 font-bold">-</span>
                            <div className="flex flex-col">
                                <label className="text-[10px] text-gray-400 font-semibold uppercase">End Month</label>
                                <input
                                    type="month"
                                    value={endMonth}
                                    onChange={(e) => setEndMonth(e.target.value)}
                                    className="border border-gray-300 rounded-md px-2 py-1 text-sm text-gray-600 focus:outline-none focus:border-amber-500"
                                />
                            </div>
                        </>
                    )}

                    {range === 'year' && (
                        <>
                            <div className="flex flex-col">
                                <label className="text-[10px] text-gray-400 font-semibold uppercase">Start Year</label>
                                <select
                                    value={startYear}
                                    onChange={(e) => setStartYear(e.target.value)}
                                    className="border border-gray-300 rounded-md px-2 py-1 text-sm text-gray-600 focus:outline-none focus:border-amber-500 min-w-[80px]"
                                >
                                    <option value="">All</option>
                                    {years.map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                            <span className="text-gray-400 font-bold">-</span>
                            <div className="flex flex-col">
                                <label className="text-[10px] text-gray-400 font-semibold uppercase">End Year</label>
                                <select
                                    value={endYear}
                                    onChange={(e) => setEndYear(e.target.value)}
                                    className="border border-gray-300 rounded-md px-2 py-1 text-sm text-gray-600 focus:outline-none focus:border-amber-500 min-w-[80px]"
                                >
                                    <option value="">All</option>
                                    {years.map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {isLoading ? <DataLoading /> : (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-50 flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                                <Banknote size={28} />
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Period Revenue</p>
                                <h3 className="text-2xl font-bold text-gray-900">{totalPeriodRevenue.toLocaleString()} ALL</h3>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-50 flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                <ShoppingBag size={28} />
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Period Orders</p>
                                <h3 className="text-2xl font-bold text-gray-900">{totalPeriodOrders}</h3>
                            </div>
                        </div>
                    </div>



                    {/* Simple Data Table */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-100">
                        <h3 className="font-bold text-lg text-amber-900 mb-4">Breakdown</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-amber-50 text-amber-900 text-xs uppercase font-semibold">
                                    <tr>
                                        <th className="p-3 rounded-l-lg">Date / Period</th>
                                        <th className="p-3">Orders</th>
                                        <th className="p-3 rounded-r-lg text-right">Revenue</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {revenueData.map((item) => (
                                        <tr key={item._id} className="hover:bg-gray-50">
                                            <td className="p-3 font-medium text-gray-700">{item._id}</td>
                                            <td className="p-3 text-gray-600">{item.totalOrders}</td>
                                            <td className="p-3 text-right font-bold text-gray-900">{item.totalRevenue.toLocaleString()} ALL</td>
                                        </tr>
                                    ))}
                                    {revenueData.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="p-4 text-center text-gray-500">No data for this period</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default RevenueDetails;
