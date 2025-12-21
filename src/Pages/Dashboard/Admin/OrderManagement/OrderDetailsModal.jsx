import React from 'react';
import { X, MapPin, User, Mail, Phone, Calendar, Package, CreditCard } from 'lucide-react';
import { getProductImage } from '../../../../utils/productImages';

const OrderDetailsModal = ({ isOpen, onClose, order }) => {
    if (!isOpen || !order) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
                    <div>
                        <h2 className="text-xl font-bold text-amber-900 flex items-center gap-2">
                            Order Details <span className="text-gray-400 font-normal text-sm">#{order.orderNumber}</span>
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column: Customer & Shipping */}
                    <div className="space-y-6">
                        {/* Customer Info */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <User size={18} className="text-amber-600" /> Customer Information
                            </h3>
                            <div className="space-y-2 text-sm text-gray-700">
                                <p><span className="font-medium">Name:</span> {order.buyerName || 'N/A'}</p>
                                <p className="flex items-center gap-2"><Mail size={14} className="text-gray-400" /> {order.buyerEmail}</p>
                                {/* Assuming phone might be in deliveryAddress or separate field if added later */}
                            </div>
                        </div>

                        {/* Shipping Info */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <MapPin size={18} className="text-amber-600" /> Shipping Address
                            </h3>
                            <div className="text-sm text-gray-700 leading-relaxed">
                                {order.deliveryAddress ? (
                                    <>
                                        <p>{order.deliveryAddress.street || ''}</p>
                                        <p>{order.deliveryAddress.city}, {order.deliveryAddress.zipCode || ''}</p>
                                        <p>{order.deliveryAddress.country || ''}</p>
                                        {order.deliveryAddress.phone && (
                                            <p className="mt-2 flex items-center gap-2"><Phone size={14} className="text-gray-400" /> {order.deliveryAddress.phone}</p>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-gray-400 italic">No address provided</p>
                                )}
                            </div>
                        </div>

                        {/* Payment Status */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <CreditCard size={18} className="text-amber-600" /> Payment Info
                            </h3>
                            <div className="flex items-center gap-3">
                                <span className={`px-2 py-1 rounded-md text-xs font-semibold uppercase ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {order.paymentStatus}
                                </span>
                                <span className="text-sm text-gray-600">Total: <strong>{order.finalPrice.toFixed(2)} ALL</strong></span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Order Items */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Package size={18} className="text-amber-600" /> Order Items ({order.items.length})
                        </h3>
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                            {order.items.map((item, index) => (
                                <div key={index} className="flex gap-4 p-3 border border-gray-100 rounded-xl hover:border-amber-200 transition bg-white">
                                    <img
                                        src={getProductImage(item.image)}
                                        alt={item.itemName}
                                        className="w-16 h-16 object-cover rounded-lg bg-gray-50"
                                    />
                                    <div className="flex-1">
                                        <h4 className="text-sm font-medium text-gray-900 line-clamp-2">{item.itemName}</h4>
                                        <p className="text-xs text-gray-500 mt-1">{item.company}</p>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">Qty: {item.quantity}</span>
                                            <span className="text-sm font-bold text-amber-700">{(item.price * item.quantity).toFixed(2)} ALL</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Summary Footer */}
                        <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Subtotal</span>
                                <span>{order.totalPrice.toFixed(2)} ALL</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Discount</span>
                                <span>-{order.discountAmount.toFixed(2)} ALL</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-100">
                                <span>Total</span>
                                <span>{order.finalPrice.toFixed(2)} ALL</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsModal;
