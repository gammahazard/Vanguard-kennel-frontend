import {
    Activity,
    AlertCircle,
    Calendar,
    Camera,
    ChevronRight,
    Clock,
    Dog,
    Home,
    LogOut,
    Menu,
    Search,
    Settings,
    Utensils
} from "lucide-react";

const DOGS = [
    { id: 1, name: "Rex", breed: "German Shepherd", status: "Resting", statusColor: "text-blue-400", inKennel: true, feedTime: "18:00", img: "/api/placeholder/400/320" },
    { id: 2, name: "Bella", breed: "Golden Retriever", status: "Playtime", statusColor: "text-green-400", inKennel: false, feedTime: "18:00", img: "/api/placeholder/400/320" },
    { id: 3, name: "Luna", breed: "French Bulldog", status: "Needs Meds", statusColor: "text-red-400", inKennel: true, feedTime: "17:30", img: "/api/placeholder/400/320" },
    { id: 4, name: "Max", breed: "Husky", status: "Eating", statusColor: "text-yellow-400", inKennel: true, feedTime: "Done", img: "/api/placeholder/400/320" },
];

export default function Dashboard() {
    return (
        <div className="min-h-screen bg-premium-dark flex overflow-hidden">

            {/* Sidebar - Desktop */}
            <aside className="w-64 glass-panel border-r border-white/5 hidden md:flex flex-col z-20">
                <div className="p-6">
                    <div className="flex items-center gap-3 text-premium-gold mb-8">
                        <div className="w-8 h-8 rounded-lg bg-premium-gold/20 flex items-center justify-center border border-premium-gold/30">
                            <span className="font-bold">V</span>
                        </div>
                        <span className="font-bold tracking-wider text-sm uppercase">Vanguard</span>
                    </div>

                    <nav className="space-y-1">
                        <NavItem icon={<Home className="w-4 h-4" />} label="Overview" active />
                        <NavItem icon={<Dog className="w-4 h-4" />} label="Kennel Runs" />
                        <NavItem icon={<Calendar className="w-4 h-4" />} label="Bookings" />
                        <NavItem icon={<Activity className="w-4 h-4" />} label="Health Logs" />
                        <NavItem icon={<Utensils className="w-4 h-4" />} label="Kitchen" />
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-white/5">
                    <NavItem icon={<Settings className="w-4 h-4" />} label="Settings" />
                    <NavItem icon={<LogOut className="w-4 h-4 text-red-400" />} label="Sign Out" />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative overflow-hidden">
                {/* Mobile Header */}
                <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 glass-panel md:bg-transparent md:border-transparent z-10">
                    <div className="md:hidden text-premium-gold font-bold">VANGUARD</div>
                    <div className="flex items-center gap-4 ml-auto">
                        <div className="relative">
                            <Search className="w-4 h-4 text-premium-muted absolute left-3 top-2.5" />
                            <input
                                type="text"
                                placeholder="Search guest..."
                                className="bg-white/5 border border-white/10 rounded-full py-2 pl-9 pr-4 text-xs w-64 text-white focus:outline-none focus:border-premium-gold/50 transition-all hidden md:block"
                            />
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-premium-gold to-yellow-200 border border-white/10"></div>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-6 md:p-8">
                    <div className="max-w-6xl mx-auto space-y-8">

                        {/* KPI Headers */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatCard label="Occupancy" value="85%" sub="42/50 Runs" />
                            <StatCard label="Checking In" value="8" sub="Today" />
                            <StatCard label="Checking Out" value="12" sub="Today" />
                            <StatCard label="Alerts" value="2" sub="Attention Req" highlight />
                        </div>

                        {/* Active Runs Grid */}
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-light text-white tracking-wide">Live Kennel View</h2>
                                <div className="flex gap-2">
                                    <button className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs hover:bg-white/10 transition-colors">Wing A</button>
                                    <button className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs hover:bg-white/10 transition-colors">Wing B</button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {DOGS.map((dog) => (
                                    <div key={dog.id} className="group relative bg-white/[0.02] border border-white/5 hover:border-premium-gold/30 rounded-2xl overflow-hidden transition-all duration-300 hover:bg-white/[0.04]">
                                        {/* Status Dot */}
                                        <div className={`absolute top-4 right-4 flex items-center gap-2 px-2 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-medium ${dog.statusColor}`}>
                                            <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                                            {dog.status}
                                        </div>

                                        {/* Image Placeholder */}
                                        <div className="h-40 bg-black/40 flex items-center justify-center relative">
                                            <Camera className="w-6 h-6 text-white/20" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-premium-dark to-transparent opacity-90" />
                                        </div>

                                        <div className="p-5 relative z-10 -mt-10">
                                            <h3 className="text-lg font-medium text-white">{dog.name}</h3>
                                            <p className="text-xs text-premium-muted mb-4">{dog.breed}</p>

                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between text-xs py-2 border-t border-white/5">
                                                    <span className="text-premium-muted flex items-center gap-2">
                                                        <Utensils className="w-3 h-3" /> Next Feed
                                                    </span>
                                                    <span className="text-white font-mono">{dog.feedTime}</span>
                                                </div>

                                                <div className="flex gap-2 mt-4">
                                                    <button className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-premium-gold/10 hover:text-premium-gold border border-white/10 hover:border-premium-gold/30 text-xs transition-all">
                                                        Log Activity
                                                    </button>
                                                    <button className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs">
                                                        <ChevronRight className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}

function NavItem({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) {
    return (
        <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 ${active ? 'bg-premium-gold/10 text-premium-gold border border-premium-gold/20' : 'text-premium-muted hover:text-white hover:bg-white/5'}`}>
            {icon}
            <span>{label}</span>
        </button>
    );
}

function StatCard({ label, value, sub, highlight = false }: { label: string, value: string, sub: string, highlight?: boolean }) {
    return (
        <div className={`p-5 rounded-2xl glass-panel border ${highlight ? 'border-red-500/30' : 'border-white/5'}`}>
            <p className="text-xs text-premium-muted uppercase tracking-wider mb-1">{label}</p>
            <div className="flex items-end gap-2">
                <h3 className={`text-2xl font-light ${highlight ? 'text-red-400' : 'text-white'}`}>{value}</h3>
                <span className="text-[10px] text-white/30 mb-1">{sub}</span>
            </div>
        </div>
    );
}
