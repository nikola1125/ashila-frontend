import React, { useMemo, useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getFilteredRowModel,
  getSortedRowModel,
} from '@tanstack/react-table';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// format duplicate-removal logic
// Group data by orderId and buyer for rowSpan logic
const groupOrders = (data) => {
  if (!Array.isArray(data)) return [];
  const orders = {};
  data.forEach((row) => {
    const key = `${row.orderId}_${row.buyer}`;
    if (!orders[key]) {
      orders[key] = { ...row, items: [] };
    }
    orders[key].items.push({
      seller: row.seller,
      itemName: row.itemName,
      itemPrice: row.itemPrice,
    });
  });

  // For each order, group items by consecutive sellers
  return Object.values(orders).map((order) => {
    const sellerGroups = [];
    let lastSeller = null;
    let currentGroup = null;
    order.items.forEach((item) => {
      if (item.seller !== lastSeller) {
        if (currentGroup) sellerGroups.push(currentGroup);
        currentGroup = { seller: item.seller, items: [] };
        lastSeller = item.seller;
      }
      currentGroup.items.push(item);
    });
    if (currentGroup) sellerGroups.push(currentGroup);
    return { ...order, sellerGroups };
  });
};

const TanstackTable = ({ data }) => {
  // Prepare TanStack Table columns for cell access
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Download functions
  const downloadPDF = () => {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.text('Sales Report', 14, 22);

    // Add date range if selected
    if (startDate || endDate) {
      doc.setFontSize(12);
      const dateRange = `${startDate ? `From: ${startDate}` : ''} ${
        endDate ? `To: ${endDate}` : ''
      }`.trim();
      doc.text(dateRange, 14, 32);
    }

    // Prepare table data
    const tableData = filteredData.map((row) => [
      row.orderId,
      row.buyer,
      row.seller,
      row.itemName,
      `${row.itemPrice?.toLocaleString()} ALL`,
      `${row.totalPrice?.toLocaleString()} ALL`,
      row.status,
    ]);

    // Add table
    autoTable(doc, {
      head: [
        [
          'Order ID',
          'Buyer',
          'Seller',
          'Item',
          'Item Price',
          'Total Price',
          'Status',
        ],
      ],
      body: tableData,
      startY: startDate || endDate ? 40 : 30,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [34, 197, 94],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    });

    // Save the PDF
    const fileName = `sales-report-${
      new Date().toISOString().split('T')[0]
    }.pdf`;
    doc.save(fileName);
  };

  const downloadExcel = () => {
    // Prepare data for Excel
    const excelData = filteredData.map((row) => ({
      'Order ID': row.orderId,
      'Buyer Email': row.buyer,
      Seller: row.seller,
      'Item Name': row.itemName,
      'Item Price': row.itemPrice,
      'Total Price': row.totalPrice,
      Status: row.status,
      'Payment Date': row.paymentDate
        ? new Date(row.paymentDate).toLocaleDateString()
        : '',
    }));

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sales Report');

    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    // Save the file
    const fileName = `sales-report-${
      new Date().toISOString().split('T')[0]
    }.xlsx`;
    saveAs(data, fileName);
  };

  const columns = useMemo(
    () => [
      { accessorKey: 'orderId', header: 'Order' },
      { accessorKey: 'buyer', header: 'Buyer Email' },
      { accessorKey: 'seller', header: 'Seller' },
      { accessorKey: 'itemName', header: 'Item' },
      {
        accessorKey: 'itemPrice',
        header: 'Item Price',
        cell: (info) => `${info.getValue()?.toLocaleString()} ALL`,
      },
      {
        accessorKey: 'totalPrice',
        header: 'Total Price',
        cell: (info) =>
          info.getValue() ? `${info.getValue()?.toLocaleString()} ALL` : '',
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: (info) => (
          <span
            className={`px-2 py-1 rounded text-white ${
              info.getValue() === 'paid' ? 'bg-stone-500' : 'bg-yellow-500'
            }`}
          >
            {info.getValue()}
          </span>
        ),
      },
    ],
    []
  );

  // Date range filter logic
  const filteredData = useMemo(() => {
    if (!startDate && !endDate) return data;
    return data.filter((row) => {
      if (!row.paymentDate) return false;
      const paymentTime = new Date(row.paymentDate).getTime();
      const afterStart = startDate
        ? paymentTime >= new Date(startDate).getTime()
        : true;
      const beforeEnd = endDate
        ? paymentTime <= new Date(endDate).getTime()
        : true;
      return afterStart && beforeEnd;
    });
  }, [data, startDate, endDate]);

  // Group for rowSpan logic
  const orders = useMemo(() => groupOrders(filteredData), [filteredData]);

  // Pagination state
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  // Paginate orders, not items
  const pageCount = Math.ceil(orders.length / pageSize);
  const paginatedOrders = useMemo(() => {
    return orders.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
  }, [orders, pageIndex, pageSize]);

  // Flatten only the paginated orders
  const flatRows = useMemo(() => {
    return paginatedOrders.flatMap((order) => {
      let rows = [];
      order.sellerGroups.forEach((sellerGroup) => {
        sellerGroup.items.forEach((item, idx) => {
          rows.push({
            orderId: order.orderId,
            buyer: order.buyer,
            seller: sellerGroup.seller,
            itemName: item.itemName,
            itemPrice: item.itemPrice,
            totalPrice: order.totalPrice,
            status: order.status,
            _orderRowSpan: order.sellerGroups.reduce(
              (sum, g) => sum + g.items.length,
              0
            ),
            _isFirstOrderRow: rows.length === 0,
            _sellerRowSpan: sellerGroup.items.length,
            _isFirstSellerRow: idx === 0,
          });
        });
      });
      return rows;
    });
  }, [paginatedOrders]);

  const table = useReactTable({
    data: flatRows,
    columns,
    state: { globalFilter, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: 'auto',
  });

  return (
    <div className="p-4 min-h-screen bg-gradient-to-br from-blue-50 via-stone-50 to-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-extrabold mb-6 text-stone-700 flex flex-col sm:flex-row items-center gap-2">
          <svg
            className="w-8 h-8 text-blue-500"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 17v-2a4 4 0 014-4h3m-7 6v2a4 4 0 004 4h3m-7-6H5a2 2 0 01-2-2v-3a2 2 0 012-2h3m0 0V5a2 2 0 012-2h3a2 2 0 012 2v3"
            />
          </svg>
          Sales Report
        </h2>
        {/* Date Range Filter */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:gap-6 sm:items-end bg-white/80 rounded-xl shadow p-4 border border-blue-100">
          <div className="w-full sm:w-auto">
            <label className="block text-sm font-semibold mb-1 text-blue-700">
              Start Date
            </label>
            <input
              type="date"
              className="border-2 border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 p-2 rounded-lg outline-none transition w-full sm:w-40"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-auto">
            <label className="block text-sm font-semibold mb-1 text-blue-700">
              End Date
            </label>
            <input
              type="date"
              className="border-2 border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 p-2 rounded-lg outline-none transition w-full sm:w-40"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="w-full sm:flex-1">
            <label className="block text-sm font-semibold mb-1 text-blue-700">
              Search
            </label>
            <input
              type="text"
              className="border-2 border-stone-200 focus:border-stone-400 focus:ring-2 focus:ring-stone-100 p-2 rounded-lg outline-none transition w-full"
              placeholder="Search all columns..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
            />
          </div>
          {/* Download Buttons */}
          <div className="flex gap-2">
            <button
              onClick={downloadPDF}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow transition flex items-center gap-2"
              title="Download as PDF"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0 1 1 0 002 0zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              PDF
            </button>
            <button
              onClick={downloadExcel}
              className="bg-stone-500 hover:bg-stone-600 text-white px-4 py-2 rounded-lg shadow transition flex items-center gap-2"
              title="Download as Excel"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
                  clipRule="evenodd"
                />
              </svg>
              Excel
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-blue-200 rounded-xl shadow-xl bg-white">
            <thead className="bg-gradient-to-r from-stone-100 to-blue-100">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    // Sorting indicator
                    const isSortable = header.column.getCanSort();
                    const sortDir = header.column.getIsSorted();
                    return (
                      <th
                        className={`p-3 border-b border-blue-200 text-left select-none cursor-pointer font-semibold text-blue-700 text-base ${
                          isSortable ? 'hover:bg-blue-50 transition' : ''
                        }`}
                        key={header.id}
                        onClick={
                          isSortable
                            ? header.column.getToggleSortingHandler()
                            : undefined
                        }
                      >
                        <span className="flex items-center gap-1">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {isSortable &&
                            (sortDir === 'asc' ? (
                              <span>▲</span>
                            ) : sortDir === 'desc' ? (
                              <span>▼</span>
                            ) : (
                              <span className="opacity-30">⇅</span>
                            ))}
                        </span>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => {
                const r = row.original;
                return (
                  <tr
                    key={row.id}
                    className="hover:bg-blue-50/50 transition border-b border-blue-100"
                  >
                    {/* Order ID */}
                    {r._isFirstOrderRow && (
                      <td
                        className="p-3 font-bold text-blue-900 bg-blue-50/50 border-r border-blue-100 rounded-l-lg"
                        rowSpan={r._orderRowSpan}
                      >
                        {r.orderId}
                      </td>
                    )}
                    {/* Buyer Email */}
                    {r._isFirstOrderRow && (
                      <td
                        className="p-3 font-medium text-stone-900 bg-stone-50/50 border-r border-stone-100"
                        rowSpan={r._orderRowSpan}
                      >
                        {r.buyer}
                      </td>
                    )}
                    {/* Seller (merged if consecutive) */}
                    {r._isFirstSellerRow && (
                      <td
                        className="p-3 text-blue-800 bg-blue-100/50 border-r border-blue-50"
                        rowSpan={r._sellerRowSpan}
                      >
                        {r.seller}
                      </td>
                    )}
                    {/* Item */}
                    <td className="p-3 text-gray-800">{r.itemName}</td>
                    {/* Item Price */}
                    <td className="p-3 text-right text-blue-700">
                      {flexRender(columns[4].cell, {
                        getValue: () => r.itemPrice,
                      })}
                    </td>
                    {/* Total Price */}
                    {r._isFirstOrderRow && (
                      <td
                        className="p-3 font-semibold text-right text-stone-800 bg-stone-50/50 border-l border-stone-100"
                        rowSpan={r._orderRowSpan}
                      >
                        {flexRender(columns[5].cell, {
                          getValue: () => r.totalPrice,
                        })}
                      </td>
                    )}
                    {/* Status */}
                    {r._isFirstOrderRow && (
                      <td className="p-3" rowSpan={r._orderRowSpan}>
                        {flexRender(columns[6].cell, {
                          getValue: () => r.status,
                        })}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Pagination Controls */}
        <div className="flex flex-wrap items-center gap-4 mt-6 justify-between bg-white/80 rounded-xl shadow p-4 border border-blue-100">
          <div className="flex items-center gap-2">
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow transition disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setPageIndex((prev) => Math.max(prev - 1, 0))}
              disabled={pageIndex === 0}
            >
              Previous
            </button>
            <span className="text-blue-700 font-medium">
              Page {pageIndex + 1} of {pageCount}
            </span>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow transition disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() =>
                setPageIndex((prev) => Math.min(prev + 1, pageCount - 1))
              }
              disabled={pageIndex >= pageCount - 1}
            >
              Next
            </button>
          </div>
          <select
            className="border-2 border-stone-200 focus:border-stone-400 p-2 rounded-lg ml-2 bg-white text-stone-700 font-semibold shadow"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPageIndex(0);
            }}
          >
            {[5, 10, 20, 30, 40, 50].map((size) => (
              <option key={size} value={size}>
                Show {size}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default TanstackTable;
