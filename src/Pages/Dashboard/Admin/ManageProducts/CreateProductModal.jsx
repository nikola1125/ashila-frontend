import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { X, Upload, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import useAxiosSecure from '../../../../hooks/useAxiosSecure';

const CATEGORY_HIERARCHY = {
    "Kujdesi per fytyren": {
        subcategories: {
            "Tipi i lekures": ["Te gjitha", "Lekure normale", "Lekure e yndyrshme", "Lekure e thate", "Lekure mikes", "Lekure sensitive"],
            "Problematikat e fytyres": ["Akne", "Rrudha", "Hiperpigmentim", "Balancim yndyre/pore evidente", "Pika te zeza", "Dehidratim", "Skuqje", "Rozacea"]
        }
    },
    "Kujdesi per trupin dhe floke": {
        subcategories: {
            "Per trupin": ["Lares trupi", "Hidratues trupi", "Scrub trupi", "Akne ne trup", "Kujdesi ndaj diellit", "Deodorant", "Vaj per trupin", "Krem per duart & kembet"],
            "Per floke": ["Skalp i thate", "Skalp i yndyrshem", "Skalp sensitive", "Renia e flokut", "Aksesore"]
        }
    },
    "Higjene": {
        subcategories: {
            "Higjena intime": ["Lares intim", "Peceta"],
            "Higjena orale": ["Furce dhembesh", "Paste dhembesh", "Fill dentar/furca interdentare"]
        }
    },
    "Nena dhe femije": {
        subcategories: {
            "Kujdesi per nenen": ["Shtatezania", "Pas lindjes", "Ushqyerja me gji"],
            "Kujdesi per femije": ["Ushqim per femije", "Pelena", "Aksesore"]
        }
    },
    "Suplemente dhe vitamina": {
        subcategories: {
            "Kategorite": ["Vitamina", "Suplemente per shendetin", "Minerale", "Suplemente bimore"]
        }
    },
    "Monitoruesit e shendetit": {
        subcategories: {
            "Kategorite": ["Peshore", "Aparat tensioni", "Termometer", "Monitorues te diabetit", "Oksimeter", "Paisje ortopedike"]
        }
    }
};

// Additional options that match sidebar filters exactly
const ADDITIONAL_PRODUCT_OPTIONS = [
    "Lares vajor", "Lares ujor", "Toner", "Exfoliant", "Serume", "Krem per syte",
    "Vitamin C/antioxidant", "Hidratues", "Retinol", "SPF", "Eye patches",
    "Acne patches", "Maske fytyre", "Spot treatment", "Uje termal",
    "Peeling Pads", "Lipbalm", "Set me produkte"
];

const PRODUCT_TYPE_OPTIONS = [
    "Lares vajor", "Lares ujor", "Toner", "Exfoliant", "Serume", "Krem per syte",
    "Vitamin C/antioxidant", "Hidratues", "Retinol", "SPF", "Eye patches",
    "Acne patches", "Maske fytyre", "Spot treatment", "Uje termal",
    "Peeling Pads", "Lipbalm", "Set me produkte"
];

const CreateProductModal = ({ isOpen, onClose, productToEdit, refetch, isBestseller = false }) => {
    const { privateApi, publicApi } = useAxiosSecure();
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(productToEdit?.image || null);
    const [imageFile, setImageFile] = useState(null);

    const normalizeCategoryName = (value) => {
        if (!value) return '';
        return String(value).split('>')[0].trim();
    };

    // Form State
    const [formData, setFormData] = useState({
        itemName: productToEdit?.itemName || '',
        company: productToEdit?.company || '',
        price: productToEdit?.price || '',
        stock: productToEdit?.stock || 0,
        categoryName: normalizeCategoryName(productToEdit?.categoryName) || Object.keys(CATEGORY_HIERARCHY)[0],
        subcategory: productToEdit?.subcategory || '',
        option: productToEdit?.option || '',
        options: productToEdit?.options || (productToEdit?.option ? [productToEdit.option] : []), // Include single option if present
        productTypes: productToEdit?.productType
            ? (String(productToEdit.productType).includes(',')
                ? String(productToEdit.productType).split(', ')
                : [productToEdit.productType])
            : [],
        skinProblem: productToEdit?.skinProblem || '',
        description: productToEdit?.description || '',
        isFreeDelivery: productToEdit?.isFreeDelivery || false,
        discount: productToEdit?.discount || 0,
        discountPrice: (productToEdit?.price && productToEdit?.discount > 0)
            ? Math.round(productToEdit.price * (1 - productToEdit.discount / 100))
            : '',
        isBestseller: productToEdit?.isBestseller || false,
        variants: productToEdit?.variants?.length > 0
            ? productToEdit.variants.map(v => ({
                ...v,
                discountPrice: v.price && v.discount ? (v.price - (v.price * v.discount / 100)).toFixed(2) : ''
            }))
            : (productToEdit ? [{
                size: productToEdit.size || '',
                price: productToEdit.price || '',
                stock: productToEdit.stock || 0,
                discount: productToEdit.discount || 0,
                discountPrice: (productToEdit.price && productToEdit.discount > 0)
                    ? (productToEdit.price - (productToEdit.price * productToEdit.discount / 100)).toFixed(2)
                    : ''
            }] : []),
    });

    // Validation state for optional fields
    const [showOptionalFields, setShowOptionalFields] = useState(false);

    // Derived state for dropdowns - FULLY LINKED SYSTEM
    const currentCategoryData = CATEGORY_HIERARCHY[formData.categoryName];
    const availableSubcategories = currentCategoryData ? Object.keys(currentCategoryData.subcategories) : [];

    // Update available options when subcategory changes
    const availableOptions = (formData.subcategory && currentCategoryData?.subcategories[formData.subcategory])
        ? currentCategoryData.subcategories[formData.subcategory]
        : [];



    useEffect(() => {
        // Reset sub-selections when category changes if they aren't valid anymore
        if (formData.subcategory && !availableSubcategories.includes(formData.subcategory)) {
            setFormData(prev => ({ ...prev, subcategory: availableSubcategories[0] || '', option: '' }));
        }
    }, [formData.categoryName]);

    useEffect(() => {
        // Reset option when subcategory changes
        if (formData.option && !availableOptions.includes(formData.option)) {
            setFormData(prev => ({ ...prev, option: availableOptions[0] || '' }));
        }
    }, [formData.subcategory]);

    useEffect(() => {
        // Reset skinProblem when option changes if not Akne
        if (formData.option !== 'Akne') {
            setFormData(prev => ({ ...prev, skinProblem: '' }));
        }
    }, [formData.option]);

    // Handlers
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };
    // Fetch Categories from DB to get their IDs
    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await publicApi.get('/categories');
            return res;
        }
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Find database ID for selected category name
        const baseCategoryName = normalizeCategoryName(formData.categoryName);
        const selectedDbCategory = categories.find(c => c.categoryName === baseCategoryName);

        if (!selectedDbCategory) {
            toast.error(`Error: Category "${baseCategoryName || formData.categoryName}" does not exist in database!`);
            setLoading(false);
            return; // Stop submission
        }

        // Construct category path for searching/filtering
        // Path format: "Category > Subcategory > Option1, Option2"
        const optionsString = formData.options.length > 0 ? ` > ${formData.options.join(', ')}` : '';

        let subcategoryToSave = formData.subcategory;
        if (formData.categoryName === 'Kujdesi per fytyren') {
            // Find which subcategories have at least one selected option
            const activeSubs = [];
            const faceCategoryData = CATEGORY_HIERARCHY['Kujdesi per fytyren'];
            Object.keys(faceCategoryData.subcategories).forEach(sub => {
                const hasOption = faceCategoryData.subcategories[sub].some(opt => formData.options.includes(opt));
                if (hasOption) activeSubs.push(sub);
            });
            if (activeSubs.length > 0) {
                subcategoryToSave = activeSubs.join(', ');
            }
        }

        const categoryPath = `${baseCategoryName} > ${subcategoryToSave}${optionsString}`;

        try {
            // Validate only required fields
            if (!formData.itemName || formData.itemName.trim() === '') {
                toast.error('Product name is required.');
                setLoading(false);
                return;
            }

            if (!formData.variants || formData.variants.length === 0) {
                toast.error('Please add at least one product variant (size, price, stock).');
                setLoading(false);
                return;
            }

            // Validate variants have required fields
            for (const variant of formData.variants) {
                if (!variant.price || variant.price <= 0) {
                    toast.error('Each variant must have a valid price.');
                    setLoading(false);
                    return;
                }
                if (!variant.stock || variant.stock < 0) {
                    toast.error('Each variant must have valid stock (0 or more).');
                    setLoading(false);
                    return;
                }
            }

            // Calculate derived main fields from variants
            const totalStock = formData.variants.reduce((acc, v) => acc + parseInt(v.stock || 0), 0);
            const mainPrice = formData.variants[0].price || 0;
            const mainDiscount = formData.variants[0].discount || 0;

            const data = new FormData();
            Object.keys(formData).forEach(key => {
                // Skip price/stock/discount keys from main formData as we manually append derived ones
                // Also skip single option as we now use multiple options
                // IMPORTANT: skip 'categoryName' and 'subcategory' here because we append them manually as strings later
                if (key !== 'price' && key !== 'stock' && key !== 'discount' && key !== 'discountPrice' && key !== 'variants' && key !== 'option' && key !== 'categoryName' && key !== 'subcategory') {
                    if (key === 'options') {
                        data.append(key, JSON.stringify(formData[key]));
                    } else {
                        data.append(key, formData[key]);
                    }
                }
            });

            // Append calculated subcategory and product type strings
            data.append('subcategory', subcategoryToSave);
            data.append('productType', formData.productTypes.join(', '));

            // Append derived/calculated fields
            data.append('price', mainPrice);
            data.append('stock', totalStock);
            data.append('discount', mainDiscount);

            // Append correct MongoDB _id for category
            data.append('category', selectedDbCategory._id);

            // Save the full path string in categoryName for easier retrieval/filtering as requested
            // We ensure it is a string to avoid cast errors
            data.append('categoryName', String(categoryPath));

            // Add other required fields
            data.append('genericName', formData.itemName);
            data.append('sellerEmail', 'admin@medimart.com'); // sending email to string field instead of ObjectId field

            // Append variants
            data.append('variants', JSON.stringify(formData.variants));

            if (isBestseller) {
                data.append('isBestseller', 'true');
                data.append('bestsellerCategory', 'skincare'); // Default category
            }

            // Only append image if a new file was selected
            if (imageFile) {
                data.append('image', imageFile);
            } else if (productToEdit && productToEdit.image) {
                // If editing and no new image, keep the old one
                data.append('imageUrl', productToEdit.image);
            }

            if (productToEdit) {
                await privateApi.patch(`/medicines/${productToEdit._id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Product updated successfully');
            } else {
                await privateApi.post('/medicines', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Product created successfully');
            }

            refetch();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
                {/* Header - Fixed */}
                <div className="flex-none flex justify-between items-center p-6 border-b bg-white z-10">
                    <h2 className="text-xl font-bold text-amber-900">
                        {productToEdit ? 'Edit Product' : 'Add New Product'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

                {/* Form - Flexible Body with Scroll */}
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left Column - Image & Basic Info */}
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                                    <div
                                        className="relative border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-amber-500 hover:bg-amber-50 transition h-64"
                                        onClick={() => document.getElementById('product-image').click()}
                                    >
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Preview" className="h-full object-contain" />
                                        ) : (
                                            <>
                                                <Upload className="w-12 h-12 text-gray-400 mb-2" />
                                                <span className="text-gray-500 text-sm">Click to upload image</span>
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            id="product-image"
                                            className="hidden"
                                            onChange={handleImageChange}
                                            accept="image/*"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                                    <input
                                        type="text"
                                        name="itemName"
                                        required
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                        value={formData.itemName}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand / Company</label>
                                    <input
                                        type="text"
                                        name="company"
                                        required
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                        value={formData.company}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            {/* Right Column - Details & Pricing */}
                            <div className="space-y-6">
                                {/* Price & Stock inputs filtered out as per request - Derived from variants now */}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        name="categoryName"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                        value={formData.categoryName}
                                        onChange={handleChange}
                                    >
                                        {Object.keys(CATEGORY_HIERARCHY).map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className={`${formData.categoryName === 'Kujdesi per fytyren' ? 'col-span-2' : 'contents'}`}>
                                    {formData.categoryName === 'Kujdesi per fytyren' ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {availableSubcategories.map(sub => (
                                                <div key={sub}>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">{sub}</label>
                                                    <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-white">
                                                        {currentCategoryData.subcategories[sub].map(opt => (
                                                            <label key={opt} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                                                <input
                                                                    type="checkbox"
                                                                    name="options"
                                                                    value={opt}
                                                                    checked={formData.options.includes(opt)}
                                                                    onChange={(e) => {
                                                                        const { value, checked } = e.target;
                                                                        setFormData(prev => ({
                                                                            ...prev,
                                                                            options: checked
                                                                                ? [...prev.options, value]
                                                                                : prev.options.filter(o => o !== value)
                                                                        }));
                                                                    }}
                                                                    className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-2 focus:ring-amber-500"
                                                                />
                                                                <span className="text-sm text-gray-700">{opt}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-4 w-full">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
                                                <select
                                                    name="subcategory"
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                                    value={formData.subcategory}
                                                    onChange={handleChange}
                                                    disabled={availableSubcategories.length === 0}
                                                >
                                                    <option value="">Select...</option>
                                                    {availableSubcategories.map(sub => (
                                                        <option key={sub} value={sub}>{sub}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Options</label>
                                                <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-white">
                                                    {availableOptions.map(opt => (
                                                        <label key={opt} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                                            <input
                                                                type="checkbox"
                                                                name="options"
                                                                value={opt}
                                                                checked={formData.options.includes(opt)}
                                                                onChange={(e) => {
                                                                    const { value, checked } = e.target;
                                                                    setFormData(prev => ({
                                                                        ...prev,
                                                                        options: checked
                                                                            ? [...prev.options, value]
                                                                            : prev.options.filter(o => o !== value)
                                                                    }));
                                                                }}
                                                                className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-2 focus:ring-amber-500"
                                                            />
                                                            <span className="text-sm text-gray-700">{opt}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {formData.options.length} option{formData.options.length !== 1 ? 's' : ''} selected
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Lloji i Produktit</label>
                                    <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-white">
                                        {PRODUCT_TYPE_OPTIONS.map(opt => (
                                            <label key={opt} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                                <input
                                                    type="checkbox"
                                                    name="productTypes"
                                                    value={opt}
                                                    checked={formData.productTypes.includes(opt)}
                                                    onChange={(e) => {
                                                        const { value, checked } = e.target;
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            productTypes: checked
                                                                ? [...prev.productTypes, value]
                                                                : prev.productTypes.filter(t => t !== value)
                                                        }));
                                                    }}
                                                    className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-2 focus:ring-amber-500"
                                                />
                                                <span className="text-sm text-gray-700">{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {formData.productTypes.length} type{formData.productTypes.length !== 1 ? 's' : ''} selected
                                    </p>
                                </div>

                                {(formData.subcategory === 'Problematikat e fytyres' && formData.options.includes('Akne')) && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Lloji i problematikës (Acne Type)</label>
                                        <select
                                            name="skinProblem"
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                            value={formData.skinProblem}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select Acne Type...</option>
                                            <option value="papules">Papules</option>
                                            <option value="cyst">Cyst</option>
                                            <option value="pustules">Pustules</option>
                                            <option value="blackhead">Blackheads</option>
                                            <option value="back-acne">Back Acne</option>
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        name="description"
                                        rows="4"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none resize-y"
                                        placeholder="Enter product description...&#10;&#10;• Type Enter for new line&#10;• Double Enter for new paragraph&#10;• Copy-paste text preserves formatting"
                                        value={formData.description}
                                        onChange={handleChange}
                                        style={{ whiteSpace: 'pre-wrap' }}
                                    ></textarea>
                                    <p className="text-xs text-gray-500 mt-1">
                                        💡 Tip: Paste text with existing formatting - line breaks and paragraphs will be preserved
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Variants Section - In Flow but Separated */}
                        <div className="border-t pt-6 mt-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Product Variants (Sizes)</h3>

                            {formData.variants && formData.variants.map((variant, index) => (
                                <div key={index} className="bg-gray-50 p-4 rounded-xl mb-4 relative border border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newVariants = formData.variants.filter((_, i) => i !== index);
                                            setFormData(prev => ({ ...prev, variants: newVariants }));
                                        }}
                                        className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1"
                                    >
                                        <X size={18} />
                                    </button>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Size (e.g. 50ml)</label>
                                            <input
                                                type="text"
                                                value={variant.size}
                                                onChange={(e) => {
                                                    const newVariants = [...formData.variants];
                                                    newVariants[index].size = e.target.value;
                                                    setFormData(prev => ({ ...prev, variants: newVariants }));
                                                }}
                                                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
                                                placeholder="Size"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Price</label>
                                            <input
                                                type="number"
                                                value={variant.price}
                                                onChange={(e) => {
                                                    const newVariants = [...formData.variants];
                                                    newVariants[index].price = e.target.value;
                                                    if (newVariants[index].discountPrice) {
                                                        const p = parseFloat(e.target.value);
                                                        const dp = parseFloat(newVariants[index].discountPrice);
                                                        if (p > 0 && dp < p) {
                                                            newVariants[index].discount = ((p - dp) / p) * 100;
                                                        }
                                                    }
                                                    setFormData(prev => ({ ...prev, variants: newVariants }));
                                                }}
                                                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
                                                placeholder="Price"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Discount Price</label>
                                            <input
                                                type="number"
                                                value={variant.discountPrice || ''}
                                                onChange={(e) => {
                                                    const newVariants = [...formData.variants];
                                                    const dPrice = parseFloat(e.target.value);
                                                    const price = parseFloat(variant.price);
                                                    newVariants[index].discountPrice = e.target.value;
                                                    if (!isNaN(dPrice) && price > 0 && dPrice < price) {
                                                        newVariants[index].discount = ((price - dPrice) / price) * 100;
                                                    } else {
                                                        newVariants[index].discount = 0;
                                                    }
                                                    setFormData(prev => ({ ...prev, variants: newVariants }));
                                                }}
                                                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
                                                placeholder="Disc. Price"
                                            />
                                            {variant.discount > 0 && (
                                                <span className="text-xs text-green-600 block mt-0.5">Save {Math.round(variant.discount)}%</span>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Stock</label>
                                            <input
                                                type="number"
                                                value={variant.stock}
                                                onChange={(e) => {
                                                    const newVariants = [...formData.variants];
                                                    newVariants[index].stock = e.target.value;
                                                    setFormData(prev => ({ ...prev, variants: newVariants }));
                                                }}
                                                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
                                                placeholder="Stock"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={() => {
                                    setFormData(prev => ({
                                        ...prev,
                                        variants: [...(prev.variants || []), { size: '', price: '', stock: 0, discount: 0, discountPrice: '' }]
                                    }));
                                }}
                                className="text-sm text-amber-600 font-medium hover:text-amber-700 flex items-center gap-1"
                            >
                                <span className="text-lg">+</span> Add Variant
                            </button>
                        </div>
                    </div>

                    {/* Footer - Fixed */}
                    <div className="flex-none flex justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-2xl z-10">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition flex items-center gap-2"
                        >
                            {loading && <Loader2 className="animate-spin" size={18} />}
                            {productToEdit ? 'Update Product' : 'Create Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateProductModal;
