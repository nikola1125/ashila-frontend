import { Button } from '@headlessui/react';
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../../Context/Cart/CartContext';

const ShopTable = ({
  paginatedMedicines,
  handleItemsPerPageChange,
  itemsPerPage,
  currentPage,
  goToPage,
  totalPages,
}) => {
  const { addItem } = useContext(CartContext);
  const navigate = useNavigate();
  return (
    <>
      <div>
        <div className="overflow-x-auto">
          <table className="table">
            {/* head */}
            <thead>
              <tr>
                <th>
                  <label>#</label>
                </th>
                <th>Name</th>
                <th>Company</th>
                <th>Price</th>
                <th>Discount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMedicines?.map((medicine, index) => (
                <tr key={medicine._id || index}>
                  <th>
                    <label>{index + 1}</label>
                  </th>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="mask mask-squircle h-12 w-12 cursor-pointer" onClick={() => {
                          window.scrollTo({ top: 0, behavior: 'instant' });
                          navigate(`/product/${medicine._id}`);
                        }}>
                          <img
                            src={medicine.image}
                            alt="Avatar Tailwind CSS Component"
                          />
                        </div>
                      </div>
                      <div>
                        <div 
                          className="font-bold cursor-pointer hover:text-gray-600 transition-colors"
                          onClick={() => {
                            window.scrollTo({ top: 0, behavior: 'instant' });
                            navigate(`/product/${medicine._id}`);
                          }}
                        >
                          {medicine.itemName}
                        </div>
                        <div className="text-sm opacity-50">
                          {medicine.genericName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{medicine.company}</td>
                  <td>{medicine.price}</td>
                  <td>{medicine.discount}</td>
                  <td>
                    {' '}
                    <div className="join join-vertical">
                      <button
                        className="btn join-item bg-white hover:bg-gray-100 text-gray-600 px-4 py-2 text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 border-2 border-gray-300"
                        onClick={() =>
                          addItem({
                            id: medicine._id,
                            name: medicine.itemName,
                            price: medicine.price,
                            discountedPrice: (
                              Number(medicine.price) *
                              (1 - Number(medicine.discount) / 100)
                            ).toFixed(2),
                            image: medicine.image,
                            company: medicine.company,
                            genericName: medicine.genericName,
                            discount: medicine.discount,
                            seller: medicine.seller,
                          })
                        }
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="9" cy="21" r="1" />
                          <circle cx="20" cy="21" r="1" />
                          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                        </svg>
                        Add to cart
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination Controls */}
        <div className="flex flex-wrap justify-center items-center my-4 gap-2 rounded-lg shadow-sm p-3">
          {/* Prev Button */}
          <button
            className="btn btn-sm text-xs sm:text-sm px-2 sm:px-3 py-2"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Prev
          </button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1 sm:gap-2">
            {totalPages <= 5 ? (
              // If total pages is 5 or less, show all page numbers
              [...Array(totalPages)].map((_, idx) => (
                <button
                  key={idx + 1}
                  className={`btn btn-sm text-xs sm:text-sm px-2 sm:px-3 py-2 ${
                    currentPage === idx + 1 ? 'btn-active' : ''
                  }`}
                  onClick={() => goToPage(idx + 1)}
                >
                  {idx + 1}
                </button>
              ))
            ) : (
              // If more than 5 pages, show smart pagination with max 5 page numbers
              <>
                {/* Always show first page */}
                <button
                  className={`btn btn-sm text-xs sm:text-sm px-2 sm:px-3 py-2 ${
                    currentPage === 1 ? 'btn-active' : ''
                  }`}
                  onClick={() => goToPage(1)}
                >
                  1
                </button>

                {/* Show ellipsis if there's a gap */}
                {currentPage > 3 && (
                  <span className="px-1 sm:px-2 text-xs sm:text-sm">...</span>
                )}

                {/* Show current page and 2 pages around it (max 3 pages) */}
                {Array.from({ length: 3 }, (_, i) => currentPage - 1 + i)
                  .filter((pageNum) => pageNum > 1 && pageNum < totalPages)
                  .map((pageNum) => (
                    <button
                      key={pageNum}
                      className={`btn btn-sm text-xs sm:text-sm px-2 sm:px-3 py-2 ${
                        currentPage === pageNum ? 'btn-active' : ''
                      }`}
                      onClick={() => goToPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  ))}

                {/* Show ellipsis if there's a gap */}
                {currentPage < totalPages - 2 && (
                  <span className="px-1 sm:px-2 text-xs sm:text-sm">...</span>
                )}

                {/* Always show last page if it's different from first */}
                {totalPages > 1 && (
                  <button
                    className={`btn btn-sm text-xs sm:text-sm px-2 sm:px-3 py-2 ${
                      currentPage === totalPages ? 'btn-active' : ''
                    }`}
                    onClick={() => goToPage(totalPages)}
                  >
                    {totalPages}
                  </button>
                )}
              </>
            )}
          </div>


          {/* Items Per Page Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm text-gray-600 hidden sm:inline">
              Show:
            </span>
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="select select-sm select-bordered text-xs sm:text-sm min-w-[60px] sm:min-w-[80px]"
            >
              {[5, 10, 20, 50].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShopTable;
