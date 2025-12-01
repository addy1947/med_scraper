import { useState } from 'react'

function SearchPage() {
    const [message, setMessage] = useState('paracetamol')
    const [pincode, setPincode] = useState('')
    const [oneMgProducts, setOneMgProducts] = useState([])
    const [apolloProducts, setApolloProducts] = useState([])
    const [pharmEasyProducts, setPharmEasyProducts] = useState([])
    const [truemedProducts, setTruemedProducts] = useState([])
    const [netmedProducts, setNetmedProducts] = useState([])
    const [maxProduct, setMaxProduct] = useState(3)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [sortBy, setSortBy] = useState('relevance') // 'relevance', 'price', 'discount', 'perUnit'
    const [sortOrder, setSortOrder] = useState('asc') // 'asc', 'desc'

    const [selectedProducts, setSelectedProducts] = useState([])
    const [savedItems, setSavedItems] = useState([])
    const [showCompareModal, setShowCompareModal] = useState(false)
    const [showSavedModal, setShowSavedModal] = useState(false)
    const [showUploadModal, setShowUploadModal] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [extractedMedicines, setExtractedMedicines] = useState([])

    // ⭐ Added price per unit calculator for 1mg
    const calculatePricePerUnit = (packSize, price) => {
        if (!packSize || !price) return null

        const unitCount = parseInt(packSize.match(/\d+/)?.[0])
        if (!unitCount || unitCount === 0) return null

        return (price / unitCount).toFixed(2)
    }

    const sortProducts = (products, criteria, order = 'asc') => {
        if (!products || products.length === 0) return [];
        let sorted = [...products];

        switch (criteria) {
            case 'price':
                sorted.sort((a, b) => {
                    const priceA = parseFloat(a.specialPrice || a.price) || 0;
                    const priceB = parseFloat(b.specialPrice || b.price) || 0;
                    return priceA - priceB;
                });
                break;
            case 'discount':
                sorted.sort((a, b) => {
                    const discountA = parseFloat(a.discount || a.discountPercentage) || 0;
                    const discountB = parseFloat(b.discount || b.discountPercentage) || 0;
                    return discountA - discountB; // Base sort: Low to High
                });
                break;
            case 'perUnit':
                sorted.sort((a, b) => {
                    const getPrice = (p) => {
                        const val = p.pricePerUnit || calculatePricePerUnit(p.packSize || p.unitSize || p.measurement || p.package, p.price);
                        if (!val) return Infinity;
                        // Remove non-numeric characters except dot
                        const cleanVal = String(val).replace(/[^\d.]/g, '');
                        return parseFloat(cleanVal) || Infinity;
                    };
                    return getPrice(a) - getPrice(b);
                });
                break;
            default:
                break;
        }

        if (order === 'desc') {
            sorted.reverse();
        }

        return sorted;
    };

    const sourceLabel = source => {
        if (source === '1mg') return 'Tata 1mg'
        if (source === 'apollo') return 'Apollo'
        if (source === 'pharmeasy') return 'PharmEasy'
        if (source === 'truemed') return 'TrueMeds'
        if (source === 'netmed') return 'NetMeds'
        return 'Unknown'
    }

    const sourceBadgeClass = source => {
        if (source === '1mg') return 'bg-emerald-500'
        if (source === 'apollo') return 'bg-teal-500'
        if (source === 'pharmeasy') return 'bg-amber-500'
        if (source === 'truemed') return 'bg-purple-500'
        if (source === 'netmed') return 'bg-cyan-500'
        return 'bg-slate-500'
    }

    const handleSelect = (product, source) => {
        const productWithSource = { ...product, source }
        const isSelected = selectedProducts.some(p => p.name === product.name && p.source === source)

        if (isSelected) {
            setSelectedProducts(selectedProducts.filter(p => !(p.name === product.name && p.source === source)))
        } else {
            if (selectedProducts.length >= 3) {
                alert("You can select up to 3 products at a time.")
                return
            }
            setSelectedProducts([...selectedProducts, productWithSource])
        }
    }

    const handleSave = () => {
        if (selectedProducts.length === 0) return

        const newItems = selectedProducts.filter(p =>
            !savedItems.some(s => s.name === p.name && s.source === p.source)
        )

        if (newItems.length === 0) {
            alert("Selected items are already in your saved list.")
            return
        }

        setSavedItems([...savedItems, ...newItems])
        setSelectedProducts([]) // Clear selection after saving
        alert(`Added ${newItems.length} items to your saved list!`)
    }

    const removeSavedItem = (product) => {
        setSavedItems(savedItems.filter(p => !(p.name === product.name && p.source === product.source)))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!message.trim()) return

        setLoading(true)
        setError('')
        setOneMgProducts([])
        setApolloProducts([])
        setPharmEasyProducts([])
        setTruemedProducts([])
        setNetmedProducts([])
        setSelectedProducts([]) // Clear selection on new search

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, maxProduct }),
            })

            const data = await res.json()

            if (data.success) {
                setOneMgProducts(data.data.oneMg || [])
                setApolloProducts(data.data.apollo || [])
                setPharmEasyProducts(data.data.pharmEasy || [])
                setTruemedProducts(data.data.truemed || [])
                setNetmedProducts(data.data.netmed || [])
            } else {
                setError(data.message)
                setOneMgProducts([])
                setApolloProducts(data.data?.apollo || [])
                setPharmEasyProducts(data.data?.pharmEasy || [])
                setTruemedProducts(data.data?.truemed || [])
                setNetmedProducts(data.data?.netmed || [])
            }
        } catch (error) {
            console.error('Error:', error)
            setError('Error fetching data')
        } finally {
            setLoading(false)
        }
    }

    const handlePincodeSubmit = async (e) => {
        if (e.key === 'Enter' && pincode.length === 6) {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/pincode`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ pincode }),
                })
                const data = await res.json()
                if (data.success) {
                    alert(`Pincode ${pincode} received!`)
                }
            } catch (error) {
                console.error('Error sending pincode:', error)
            }
        }
    }

    const handleLiveLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;

            try {
                // 1. Reverse Geocoding to get Pincode
                let detectedPincode = '';
                try {
                    const nominatimRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const nominatimData = await nominatimRes.json();
                    if (nominatimData.address && nominatimData.address.postcode) {
                        detectedPincode = nominatimData.address.postcode;
                        setPincode(detectedPincode); // Auto-fill input
                    }
                } catch (geoError) {
                    console.error("Error fetching pincode from coordinates:", geoError);
                }

                // 2. Send to Backend
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/pincode`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        lat: latitude,
                        lon: longitude,
                        pincode: detectedPincode
                    }),
                })
                const data = await res.json()
                if (data.success) {
                    alert(`Location received! ${detectedPincode ? `Pincode: ${detectedPincode}` : ''} (Lat: ${latitude}, Lon: ${longitude})`)
                }
            } catch (error) {
                console.error('Error sending location:', error)
            }
        }, (error) => {
            console.error("Error getting location:", error);
            alert("Unable to retrieve your location");
        });
    }

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/extract-medicines`, {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();

            if (data.success && data.data && data.data.length > 0) {
                setExtractedMedicines(data.data);
                setShowUploadModal(false);
                // Optional: Auto-search first item
                // setMessage(data.data[0]);
            } else {
                alert("Could not extract medicine names from the image.");
            }
        } catch (error) {
            console.error("Upload error:", error);
            alert("Failed to upload image.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900 relative">
            {/* Background decoration */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-emerald-100/50 blur-3xl"></div>
                <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-teal-100/50 blur-3xl"></div>
            </div>

            {/* Extracted Medicines Sidebar (Desktop) */}
            {extractedMedicines.length > 0 && (
                <div className="hidden xl:block fixed right-8 top-32 w-80 bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-100 p-6 z-40 animate-fade-in">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                            Extracted Medicines
                        </h3>
                        <button onClick={() => setExtractedMedicines([])} className="text-slate-400 hover:text-red-500 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {extractedMedicines.map((med, idx) => (
                            <button
                                key={idx}
                                onClick={() => setMessage(med)}
                                className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors border border-emerald-100 text-left"
                            >
                                {med}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-slate-400 mt-4">Click on a medicine to search</p>
                </div>
            )}

            {/* Compare Modal */}
            {showCompareModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in-up">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h2 className="text-2xl font-bold text-slate-800">Compare Medicines</h2>
                            <button onClick={() => setShowCompareModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                                <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                        <div className="p-6 overflow-auto">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {selectedProducts.map((product, idx) => (
                                    <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col h-full relative overflow-hidden group">
                                        <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-bold text-white rounded-bl-xl ${sourceBadgeClass(product.source)}`}>
                                            {sourceLabel(product.source)}
                                        </div>
                                        <div className="h-40 flex items-center justify-center mb-6 p-4 bg-slate-50 rounded-xl">
                                            {product.image ? (
                                                <img src={product.image} alt={product.name} className="h-full object-contain mix-blend-multiply" />
                                            ) : (
                                                <div className="text-slate-300">No Image</div>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 min-h-14">{product.name}</h3>
                                        <div className="space-y-3 flex-1">
                                            <div className="flex justify-between items-start py-2 border-b border-slate-50">
                                                <span className="text-slate-500 text-sm mt-1">Price</span>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-xl font-bold text-emerald-600">₹{product.specialPrice || product.price}</span>
                                                    {(product.mrp || (product.specialPrice && product.specialPrice !== product.price)) && (
                                                        <span className="text-xs text-slate-400 line-through">
                                                            ₹{product.mrp || product.price}
                                                        </span>
                                                    )}
                                                    {(product.discount || product.discountPercentage) && (
                                                        <span className="text-xs font-bold text-green-600">
                                                            {product.discount || product.discountPercentage}% OFF
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-slate-50">
                                                <span className="text-slate-500 text-sm">Pack Size</span>
                                                <span className="font-medium text-slate-700">{product.packSize || product.unitSize || product.measurement || 'N/A'}</span>
                                            </div>
                                            {(product.pricePerUnit || calculatePricePerUnit(product.packSize || product.unitSize || product.measurement, product.price)) && (
                                                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                                                    <span className="text-slate-500 text-sm">Per Unit</span>
                                                    <span className="font-medium text-slate-700">
                                                        {product.pricePerUnit || `₹${calculatePricePerUnit(product.packSize || product.unitSize || product.measurement, product.price)}/unit`}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <button onClick={() => window.open(product.url)} className="w-full mt-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors">
                                            Buy Now
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-fade-in-up">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h2 className="text-xl font-bold text-slate-800">Upload Prescription</h2>
                            <button onClick={() => setShowUploadModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                                <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                        <div className="p-8 flex flex-col items-center justify-center gap-4">
                            {uploading ? (
                                <div className="flex flex-col items-center gap-3">
                                    <svg className="animate-spin h-10 w-10 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <p className="text-slate-600 font-medium">Extracting medicines...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="w-full h-40 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <svg className="w-10 h-10 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                        <p className="text-sm text-slate-500 font-medium">Click to upload image</p>
                                    </div>
                                    <p className="text-xs text-slate-400 text-center">Supported formats: JPG, PNG</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {showSavedModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in-up">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h2 className="text-2xl font-bold text-slate-800">Saved Medicines ({savedItems.length})</h2>
                            <button onClick={() => setShowSavedModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                                <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                        <div className="p-6 overflow-auto">
                            {savedItems.length === 0 ? (
                                <div className="text-center py-12 text-slate-500">
                                    <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
                                    <p className="text-lg">No saved items yet.</p>
                                    <p className="text-sm">Search and select medicines to save them here.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {savedItems.map((product, idx) => (
                                        <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col h-full relative overflow-hidden group">
                                            <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-bold text-white rounded-bl-xl ${sourceBadgeClass(product.source)}`}>
                                                {sourceLabel(product.source)}
                                            </div>
                                            <div className="h-40 flex items-center justify-center mb-6 p-4 bg-slate-50 rounded-xl">
                                                {product.image ? (
                                                    <img src={product.image} alt={product.name} className="h-full object-contain mix-blend-multiply" />
                                                ) : (
                                                    <div className="text-slate-300">No Image</div>
                                                )}
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 min-h-14">{product.name}</h3>
                                            <div className="space-y-3 flex-1">
                                                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                                                    <span className="text-slate-500 text-sm">Price</span>
                                                    <span className="text-xl font-bold text-emerald-600">₹{product.specialPrice || product.price}</span>
                                                </div>
                                                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                                                    <span className="text-slate-500 text-sm">Pack Size</span>
                                                    <span className="font-medium text-slate-700">{product.packSize || product.unitSize || product.measurement || 'N/A'}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 mt-6">
                                                <button onClick={() => window.open(product.url)} className="flex-1 py-2 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors text-sm">
                                                    Buy Now
                                                </button>
                                                <button onClick={() => removeSavedItem(product)} className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors" title="Remove">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="relative z-10 max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8 py-12">

                {/* HEADER */}
                <div className="flex justify-between items-start mb-12">
                    <div className="flex-1 text-center">
                        <div className="inline-flex items-center gap-2 p-3 mb-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                            <img src="/logo.svg" alt="MedScrapper Logo" className="w-8 h-8 object-contain" />
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">
                                MedScrapper
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
                            Find the Best Medicine Prices
                        </h1>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            Compare prices across top pharmacies like 1mg and Apollo to ensure you get the best deal for your health.
                        </p>
                    </div>

                    {/* Top Right Actions */}
                    <div className="absolute top-8 right-8 flex items-center gap-4">
                        {/* Pincode Input */}
                        <div className="relative group flex items-center gap-2">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    value={pincode}
                                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    onKeyDown={handlePincodeSubmit}
                                    placeholder="Pincode"
                                    className="w-32 pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none shadow-sm hover:bg-slate-50"
                                />
                            </div>
                            <button
                                onClick={handleLiveLocation}
                                className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 transition-all shadow-sm"
                                title="Use Live Location"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                </svg>
                            </button>
                        </div>

                        {/* Saved Items Button */}
                        <button
                            onClick={() => setShowSavedModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 transition-all text-slate-700 font-medium"
                        >
                            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
                            Saved
                            {savedItems.length > 0 && (
                                <span className="bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{savedItems.length}</span>
                            )}
                        </button>
                    </div>
                </div>

                {/* SEARCH SECTION */}
                <div className="max-w-3xl mx-auto mb-8">
                    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-2">
                        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-2">
                            <div className="flex-1 relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="h-6 w-6 text-slate-400 group-focus-within:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Search for medicines (e.g., Paracetamol)"
                                    className="w-full pl-12 pr-4 py-4 bg-transparent border-none rounded-2xl text-lg text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-100 focus:bg-slate-50 transition-all outline-none"
                                />
                            </div>

                            <div className="h-px md:h-auto md:w-px bg-slate-100 mx-2"></div>

                            <div className="flex items-center gap-2 p-1">
                                <div className="relative">
                                    <select
                                        value={maxProduct}
                                        onChange={(e) => setMaxProduct(Number(e.target.value))}
                                        className="appearance-none pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer hover:bg-slate-100"
                                    >
                                        {[...Array(10)].map((_, i) => (
                                            <option key={i + 1} value={i + 1}>{i + 1} Results</option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                        </svg>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-semibold rounded-xl shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 min-w-[140px] justify-center"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Searching</span>
                                        </>
                                    ) : (
                                        'Search'
                                    )}
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowUploadModal(true)}
                                className="px-4 py-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
                                title="Upload Prescription"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            </button>

                        </form>
                    </div>

                    {/* Extracted Medicines List (Mobile/Tablet) */}
                    {extractedMedicines.length > 0 && (
                        <div className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 animate-fade-in xl:hidden">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                    Extracted Medicines
                                </h3>
                                <button onClick={() => setExtractedMedicines([])} className="text-slate-400 hover:text-red-500 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {extractedMedicines.map((med, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setMessage(med)}
                                        className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors border border-emerald-100"
                                    >
                                        {med}
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-slate-400 mt-3">Click on a medicine to search</p>
                        </div>
                    )}
                </div>

                {/* ACTION BUTTONS */}
                {selectedProducts.length > 0 && (
                    <div className="flex justify-center gap-4 mb-12 animate-fade-in">
                        <button
                            onClick={() => setShowCompareModal(true)}
                            className="px-6 py-3 bg-slate-900 text-white font-semibold rounded-xl shadow-lg hover:bg-slate-800 transition-all flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                            Compare ({selectedProducts.length})
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-6 py-3 bg-white text-slate-700 border border-slate-200 font-semibold rounded-xl shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
                            Save Selection
                        </button>
                    </div>
                )}

                {/* ERROR MESSAGE */}
                {error && (
                    <div className="max-w-3xl mx-auto mb-8 animate-fade-in">
                        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700">
                            <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                            </svg>
                            <span className="font-medium">{error}</span>
                        </div>
                    </div>
                )}

                {/* RESULTS GRID */}
                {(oneMgProducts.length > 0 || apolloProducts.length > 0 || pharmEasyProducts.length > 0 || truemedProducts.length > 0 || netmedProducts.length > 0) && (
                    <>
                        {/* SORTING CONTROLS */}
                        <div className="flex flex-wrap justify-center gap-3 mb-8 animate-fade-in">
                            <span className="text-slate-500 font-medium self-center mr-2">Sort by:</span>
                            <button
                                onClick={() => {
                                    setSortBy('relevance');
                                    setSortOrder('asc');
                                }}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${sortBy === 'relevance'
                                        ? 'bg-slate-900 text-white shadow-md'
                                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                    }`}
                            >
                                Relevance
                            </button>
                            <button
                                onClick={() => setSortBy('discount')}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${sortBy === 'discount'
                                    ? 'bg-emerald-600 text-white shadow-md'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                    }`}
                            >
                                Discount %
                            </button>
                            <button
                                onClick={() => setSortBy('price')}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${sortBy === 'price'
                                    ? 'bg-emerald-600 text-white shadow-md'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                    }`}
                            >
                                Price (Low to High)
                            </button>
                            <button
                                onClick={() => setSortBy('perUnit')}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${sortBy === 'perUnit'
                                    ? 'bg-emerald-600 text-white shadow-md'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                    }`}
                            >
                                Price per Unit
                            </button>

                            {/* Order Toggle */}
                            {sortBy !== 'relevance' && (
                                <button
                                    onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-1"
                                    title={sortOrder === 'asc' ? "Ascending Order" : "Descending Order"}
                                >
                                    <span className="text-sm font-semibold">{sortOrder === 'asc' ? 'Asc' : 'Desc'}</span>
                                    <svg className={`w-4 h-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"></path>
                                    </svg>
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 animate-fade-in">

                            {/* 1mg RESULTS */}
                            {oneMgProducts.length > 0 && (
                                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col">
                                    <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-16 h-10 flex items-center justify-center">
                                                <img
                                                    src="https://marketing-compaigns.s3.ap-south-1.amazonaws.com/emailer/Landing-Pages-2021/Tata-1mg-Announcement/TATA%201mg%20logo.svg"
                                                    alt="Tata 1mg"
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                            <h2 className="text-xl font-bold text-slate-800">Tata 1mg</h2>
                                        </div>
                                        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full uppercase tracking-wider">
                                            {oneMgProducts.length} Results
                                        </span>
                                    </div>

                                    <div className="flex-1">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                    <th className="px-6 py-4 w-12">Select</th>
                                                    <th className="px-6 py-4">Medicine</th>
                                                    <th className="px-6 py-4">Price</th>
                                                    <th className="px-6 py-4">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {sortProducts(oneMgProducts, sortBy, sortOrder).map((product, idx) => (
                                                    <tr key={idx} className="group hover:bg-slate-50/80 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedProducts.some(p => p.name === product.name && p.source === '1mg')}
                                                                onChange={() => handleSelect(product, '1mg')}
                                                                className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-4">
                                                                {product.image ? (
                                                                    <div className="w-12 h-12 rounded-lg border border-slate-100 bg-white p-1 shrink-0">
                                                                        <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                                                                    </div>
                                                                ) : (
                                                                    <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <div className="font-semibold text-slate-900 line-clamp-2 group-hover:text-emerald-700 transition-colors">
                                                                        {product.name}
                                                                    </div>
                                                                    <div className="text-sm text-slate-500 mt-0.5">
                                                                        {product.packSize || product.unitSize}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-lg font-bold text-slate-900">₹{product.price}</span>
                                                                {product.mrp && (
                                                                    <span className="text-xs text-slate-400 line-through">₹{product.mrp}</span>
                                                                )}
                                                                {(product.discount || product.discountPercentage) && (
                                                                    <span className="text-xs font-medium text-green-600">
                                                                        {product.discount || product.discountPercentage}% OFF
                                                                    </span>
                                                                )}
                                                                <span className="text-[10px] text-slate-400 mt-1">
                                                                    {calculatePricePerUnit(product.packSize || product.unitSize, product.price)
                                                                        ? `₹${calculatePricePerUnit(product.packSize || product.unitSize, product.price)}/unit`
                                                                        : ''}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <button
                                                                onClick={() => window.open(product.url)}
                                                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                                title="View on 1mg"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                                                                </svg>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* APOLLO RESULTS */}
                            {apolloProducts.length > 0 && (
                                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col">
                                    <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-16 h-10 flex items-center justify-center">
                                                <img
                                                    src="https://images.apollo247.in/images/ic_logo.png"
                                                    alt="Apollo Pharmacy"
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                            <h2 className="text-xl font-bold text-slate-800">Apollo Pharmacy</h2>
                                        </div>
                                        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full uppercase tracking-wider">
                                            {apolloProducts.length} Results
                                        </span>
                                    </div>

                                    <div className="flex-1">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                    <th className="px-6 py-4 w-12">Select</th>
                                                    <th className="px-6 py-4">Medicine</th>
                                                    <th className="px-6 py-4">Price</th>
                                                    <th className="px-6 py-4">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {sortProducts(apolloProducts, sortBy, sortOrder).map((product, idx) => (
                                                    <tr key={idx} className="group hover:bg-slate-50/80 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedProducts.some(p => p.name === product.name && p.source === 'apollo')}
                                                                onChange={() => handleSelect(product, 'apollo')}
                                                                className="w-5 h-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-4">
                                                                {product.image ? (
                                                                    <div className="w-12 h-12 rounded-lg border border-slate-100 bg-white p-1 shrink-0">
                                                                        <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                                                                    </div>
                                                                ) : (
                                                                    <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <div className="font-semibold text-slate-900 line-clamp-2 group-hover:text-teal-700 transition-colors">
                                                                        {product.name}
                                                                    </div>
                                                                    <div className="text-sm text-slate-500 mt-0.5">
                                                                        {product.unitSize}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-lg font-bold text-slate-900">₹{product.specialPrice || product.price}</span>
                                                                {product.specialPrice && product.specialPrice !== product.price && (
                                                                    <span className="text-xs text-slate-400 line-through">₹{product.price}</span>
                                                                )}
                                                                {product.discountPercentage && (
                                                                    <span className="text-xs font-medium text-green-600">
                                                                        {product.discountPercentage}% OFF
                                                                    </span>
                                                                )}
                                                                <span className="text-[10px] text-slate-400 mt-1">
                                                                    {product.pricePerUnit}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <button
                                                                onClick={() => window.open(product.url)}
                                                                className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                                                                title="View on Apollo"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                                                                </svg>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* PHARMEASY RESULTS */}
                            {pharmEasyProducts.length > 0 && (
                                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col">
                                    <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-16 h-10 flex items-center justify-center">
                                                <img
                                                    src="/pharmeasy.svg"
                                                    alt="PharmEasy"
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                            <h2 className="text-xl font-bold text-slate-800">PharmEasy</h2>
                                        </div>
                                        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full uppercase tracking-wider">
                                            {pharmEasyProducts.length} Results
                                        </span>
                                    </div>

                                    <div className="flex-1">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                    <th className="px-6 py-4 w-12">Select</th>
                                                    <th className="px-6 py-4">Medicine</th>
                                                    <th className="px-6 py-4">Price</th>
                                                    <th className="px-6 py-4">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {sortProducts(pharmEasyProducts, sortBy, sortOrder).map((product, idx) => (
                                                    <tr key={idx} className="group hover:bg-slate-50/80 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedProducts.some(p => p.name === product.name && p.source === 'pharmeasy')}
                                                                onChange={() => handleSelect(product, 'pharmeasy')}
                                                                className="w-5 h-5 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-4">
                                                                {product.image ? (
                                                                    <div className="w-12 h-12 rounded-lg border border-slate-100 bg-white p-1 shrink-0">
                                                                        <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                                                                    </div>
                                                                ) : (
                                                                    <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <div className="font-semibold text-slate-900 line-clamp-2 group-hover:text-amber-700 transition-colors">
                                                                        {product.name}
                                                                    </div>
                                                                    <div className="text-sm text-slate-500 mt-0.5">
                                                                        {product.measurement || 'N/A'}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-lg font-bold text-slate-900">₹{product.price}</span>
                                                                {product.mrp && (
                                                                    <span className="text-xs text-slate-400 line-through">₹{product.mrp}</span>
                                                                )}
                                                                {product.discount && (
                                                                    <span className="text-xs font-medium text-green-600">
                                                                        {product.discount}
                                                                    </span>
                                                                )}
                                                                <span className="text-[10px] text-slate-400 mt-1">
                                                                    {calculatePricePerUnit(product.measurement, product.price)
                                                                        ? `₹${calculatePricePerUnit(product.measurement, product.price)}/unit`
                                                                        : ''}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <button
                                                                onClick={() => window.open(product.url)}
                                                                className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                                title="View on PharmEasy"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                                                                </svg>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* TRUEMEDS RESULTS */}
                            {truemedProducts.length > 0 && (
                                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col">
                                    <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-16 h-10 flex items-center justify-center">
                                                <img
                                                    src="/truemed.svg"
                                                    alt="TrueMeds"
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                            <h2 className="text-xl font-bold text-slate-800">TrueMeds</h2>
                                        </div>
                                        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full uppercase tracking-wider">
                                            {truemedProducts.length} Results
                                        </span>
                                    </div>

                                    <div className="flex-1">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                    <th className="px-6 py-4 w-12">Select</th>
                                                    <th className="px-6 py-4">Medicine</th>
                                                    <th className="px-6 py-4">Price</th>
                                                    <th className="px-6 py-4">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {sortProducts(truemedProducts, sortBy, sortOrder).map((product, idx) => (
                                                    <tr key={idx} className="group hover:bg-slate-50/80 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedProducts.some(p => p.name === product.name && p.source === 'truemed')}
                                                                onChange={() => handleSelect(product, 'truemed')}
                                                                className="w-5 h-5 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-4">
                                                                {product.image ? (
                                                                    <div className="w-12 h-12 rounded-lg border border-slate-100 bg-white p-1 shrink-0">
                                                                        <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                                                                    </div>
                                                                ) : (
                                                                    <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <div className="font-semibold text-slate-900 line-clamp-2 group-hover:text-purple-700 transition-colors">
                                                                        {product.name}
                                                                    </div>
                                                                    <div className="text-sm text-slate-500 mt-0.5">
                                                                        {product.measurement || 'N/A'}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-lg font-bold text-slate-900">₹{product.price}</span>
                                                                {product.mrp && (
                                                                    <span className="text-xs text-slate-400 line-through">₹{product.mrp}</span>
                                                                )}
                                                                {product.discount && (
                                                                    <span className="text-xs font-medium text-green-600">
                                                                        {product.discount} OFF
                                                                    </span>
                                                                )}
                                                                <span className="text-[10px] text-slate-400 mt-1">
                                                                    {calculatePricePerUnit(product.measurement, product.price)
                                                                        ? `₹${calculatePricePerUnit(product.measurement, product.price)}/unit`
                                                                        : ''}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <button
                                                                onClick={() => product.url && window.open(product.url)}
                                                                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                                title="View on TrueMeds"
                                                                disabled={!product.url}
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                                                                </svg>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* NETMEDS RESULTS */}
                            {netmedProducts.length > 0 && (
                                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col">
                                    <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-16 h-10 flex items-center justify-center">
                                                <img
                                                    src="/netmeds.svg"
                                                    alt="NetMeds"
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                            <h2 className="text-xl font-bold text-slate-800">NetMeds</h2>
                                        </div>
                                        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full uppercase tracking-wider">
                                            {netmedProducts.length} Results
                                        </span>
                                    </div>

                                    <div className="flex-1">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                    <th className="px-6 py-4 w-12">Select</th>
                                                    <th className="px-6 py-4">Medicine</th>
                                                    <th className="px-6 py-4">Price</th>
                                                    <th className="px-6 py-4">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {sortProducts(netmedProducts, sortBy, sortOrder).map((product, idx) => (
                                                    <tr key={idx} className="group hover:bg-slate-50/80 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedProducts.some(p => p.name === product.name && p.source === 'netmed')}
                                                                onChange={() => handleSelect(product, 'netmed')}
                                                                className="w-5 h-5 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-4">
                                                                {product.image ? (
                                                                    <div className="w-12 h-12 rounded-lg border border-slate-100 bg-white p-1 shrink-0">
                                                                        <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                                                                    </div>
                                                                ) : (
                                                                    <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <div className="font-semibold text-slate-900 line-clamp-2 group-hover:text-cyan-700 transition-colors">
                                                                        {product.name}
                                                                    </div>
                                                                    <div className="text-sm text-slate-500 mt-0.5">
                                                                        {product.package || 'N/A'}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-lg font-bold text-slate-900">₹{product.price}</span>
                                                                {product.mrp && (
                                                                    <span className="text-xs text-slate-400 line-through">₹{product.mrp}</span>
                                                                )}
                                                                {product.discount && (
                                                                    <span className="text-xs font-medium text-green-600">
                                                                        {product.discount}% OFF
                                                                    </span>
                                                                )}
                                                                <span className="text-[10px] text-slate-400 mt-1">
                                                                    {calculatePricePerUnit(product.package, product.price)
                                                                        ? `₹${calculatePricePerUnit(product.package, product.price)}/unit`
                                                                        : ''}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <button
                                                                onClick={() => product.url && window.open(product.url)}
                                                                className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                                                                title="View on NetMeds"
                                                                disabled={!product.url}
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                                                                </svg>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div >
    )
}

export default SearchPage
