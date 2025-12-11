import React from 'react';

const Table = ({ ads }) => {
  return (
    <div className="overflow-x-auto">
      <table className="table">
        {/* head */}
        <thead>
          <tr>
            <th>
              <label>#</label>
            </th>
            <th>Image</th>
            <th>Title</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {/* row 1 */}
          {ads.map((ad, index) => (
            <tr>
              <th>
                <label>{index + 1}</label>
              </th>
              <td>
                <div className="avatar">
                  <div className="mask mask-squircle h-12 w-12">
                    <img src={ad.imgUrl} alt={ad.title} />
                  </div>
                </div>
              </td>
              <td>{ad.title}</td>
              <td className="capitalize">{ad.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
