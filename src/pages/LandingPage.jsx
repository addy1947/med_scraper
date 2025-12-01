import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

function LandingPage() {
    const [textIndex, setTextIndex] = useState(0)
    const texts = ["Instantly", "Easily", "Securely", "Accurately"]

    useEffect(() => {
        const interval = setInterval(() => {
            setTextIndex((prev) => (prev + 1) % texts.length)
        }, 2000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900 flex flex-col relative overflow-hidden">
            {/* Background decoration */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] animate-scroll"></div>
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-emerald-100/50 blur-3xl animate-blob"></div>
                <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-teal-100/50 blur-3xl animate-blob [animation-delay:2s]"></div>
                <div className="absolute bottom-[10%] left-[20%] w-[30%] h-[30%] rounded-full bg-cyan-100/50 blur-3xl animate-blob [animation-delay:4s]"></div>
            </div>

            {/* Navbar */}
            <nav className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <img src="/logo.svg" alt="MedScrapper Logo" className="w-10 h-10 object-contain" />
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">
                        MedScrapper
                    </span>
                </div>
                <Link to="/search" className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 hover:border-emerald-200 transition-all shadow-sm">
                    Launch App
                </Link>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center mt-10 mb-20">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-semibold mb-8 animate-fade-in-up animate-[pulse-soft_3s_infinite]">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Save up to 40% on your medicines
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-6 max-w-4xl leading-tight animate-fade-in-up [animation-delay:200ms] opacity-0 [animation-fill-mode:forwards]">
                    Compare Medicine Prices <br />
                    <span key={textIndex} className="block h-[1.2em] text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 animate-text-slide">
                        {texts[textIndex]}
                    </span>
                </h1>

                <p className="text-xl text-slate-600 max-w-2xl mb-10 leading-relaxed animate-fade-in-up [animation-delay:400ms] opacity-0 [animation-fill-mode:forwards]">
                    Stop overpaying for your health. We search top pharmacies like 1mg and Apollo to find you the best deals in seconds.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md animate-fade-in-up [animation-delay:600ms] opacity-0 [animation-fill-mode:forwards]">
                    <Link to="/search" className="relative overflow-hidden flex-1 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-bold rounded-2xl shadow-xl shadow-emerald-600/20 hover:shadow-emerald-600/30 hover:-translate-y-1 transition-all text-center flex items-center justify-center gap-2 group">
                        <div className="absolute inset-0 animate-shimmer"></div>
                        <span className="relative z-10 flex items-center gap-2">
                            Start Searching
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                            </svg>
                        </span>
                    </Link>
                </div>

                {/* Supported Platforms */}
                <div className="mt-24 w-full max-w-5xl animate-fade-in [animation-delay:800ms] opacity-0 [animation-fill-mode:forwards]">
                    <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-8">Trusted Sources</p>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center justify-items-center opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Active Tools */}
                        <div className="flex flex-col items-center gap-3 group animate-float">
                            <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center p-4 group-hover:border-emerald-200 group-hover:shadow-md transition-all duration-300">
                                <img src="https://marketing-compaigns.s3.ap-south-1.amazonaws.com/emailer/Landing-Pages-2021/Tata-1mg-Announcement/TATA%201mg%20logo.svg" alt="1mg" className="w-full h-full object-contain" />
                            </div>
                            <span className="text-sm font-medium text-slate-600 group-hover:text-emerald-600 transition-colors">Tata 1mg</span>
                        </div>

                        <div className="flex flex-col items-center gap-3 group animate-float-delayed">
                            <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center p-2 group-hover:border-emerald-200 group-hover:shadow-md transition-all duration-300">
                                <img src="https://images.apollo247.in/images/ic_logo.png" alt="Apollo" className="w-full h-full object-contain" />
                            </div>
                            <span className="text-sm font-medium text-slate-600 group-hover:text-emerald-600 transition-colors">Apollo</span>
                        </div>

                        <div className="flex flex-col items-center gap-3 group animate-float">
                            <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center p-3 group-hover:border-emerald-200 group-hover:shadow-md transition-all duration-300">
                                <img src="/pharmeasy.svg" alt="PharmEasy" className="w-full h-full object-contain" />
                            </div>
                            <span className="text-sm font-medium text-slate-600 group-hover:text-emerald-600 transition-colors">PharmEasy</span>
                        </div>

                        <div className="flex flex-col items-center gap-3 group animate-float-delayed">
                            <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center p-3 group-hover:border-emerald-200 group-hover:shadow-md transition-all duration-300">
                                <img src="/truemed.svg" alt="TrueMeds" className="w-full h-full object-contain" />
                            </div>
                            <span className="text-sm font-medium text-slate-600 group-hover:text-emerald-600 transition-colors">TrueMeds</span>
                        </div>

                        <div className="flex flex-col items-center gap-3 group animate-float">
                            <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center p-3 group-hover:border-emerald-200 group-hover:shadow-md transition-all duration-300">
                                <img src="/netmeds.svg" alt="NetMeds" className="w-full h-full object-contain" />
                            </div>
                            <span className="text-sm font-medium text-slate-600 group-hover:text-emerald-600 transition-colors">NetMeds</span>
                        </div>

                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 py-8 text-center text-slate-400 text-sm">
                <p>© {new Date().getFullYear()} MedScrapper. All rights reserved.</p>
            </footer>
        </div>
    )
}

export default LandingPage
