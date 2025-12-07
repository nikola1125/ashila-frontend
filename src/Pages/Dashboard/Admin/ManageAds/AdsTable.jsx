
import React from 'react';
import SwitchCom from './SwitchCom';


const AdsTable = ({ ads, onStatusChange }) => {
  // toggle


  return (
    <div className="overflow-x-auto p-4 bg-white rounded-xl shadow-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr className="bg-gradient-to-r from-blue-50 to-blue-100">
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">#</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Image</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Title</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {ads.map((ad, index) => (
            <tr key={ad.id || index} className="hover:bg-blue-50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-500">{index + 1}</td>
              <td className="px-4 py-3">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                    <img src={ad.imgUrl} alt={ad.title} className="object-cover h-full w-full" />
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-gray-700 font-semibold">{ad.title}</td>
              <td className="px-4 py-3 capitalize">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${ad.status === 'active' ? 'bg-stone-100 text-stone-700' : 'bg-gray-200 text-gray-600'}`}>{ad.status}</span>
              </td>
              <td className="px-4 py-3">
                <SwitchCom ad={ad} onStatusChange={onStatusChange} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdsTable;
