import { useEffect, useState } from "react";

/* ═══════════════════════════════════════════
   EMAIL AUTOCOMPLETE FROM BACKEND
═══════════════════════════════════════════ */

export default function EmailAutocomplete({
    value,
    onChange,
    onSelect,
    currentUser,
    excludeEmails = []
}: {
    value: string;
    onChange: (v: string) => void;
    onSelect: (user: any) => void;
    currentUser: any;
    excludeEmails?: string[];
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            if (!value.trim() || value.length < 2) {
                setResults([]);
                return;
            }

            setIsLoading(true);
            try {
                const idToken = await currentUser?.getIdToken();
                const res = await fetch(`/api/users/search?q=${encodeURIComponent(value)}`, {
                    headers: {
                        "Authorization": `Bearer ${idToken}`
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    setResults(data.users || []);
                }
            } catch (err) {
                console.error("Search failed", err);
            } finally {
                setIsLoading(false);
            }
        };

        const debounce = setTimeout(fetchUsers, 300);
        return () => clearTimeout(debounce);
    }, [value, currentUser]);

    return (
        <div className="relative">
            <input
                type="email"
                value={value}
                onChange={e => {
                    onChange(e.target.value);
                    setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                placeholder="Search by email or name..."
                className={`w-full bg-white/[0.04] border rounded-lg text-white text-xs px-3 py-2.5 focus:outline-none transition-colors placeholder:text-gray-600 ${value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
                    ? "border-red-500/50 focus:border-red-500"
                    : "border-white/10 focus:border-[#007b8a]"
                    }`}
            />
            {isOpen && value && results.filter(u => !excludeEmails.includes(u.email)).length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-[#1a1a24] border border-white/10 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                    {results.filter(u => !excludeEmails.includes(u.email)).map(user => (
                        <div
                            key={user.email}
                            className="px-3 py-2 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0"
                            onMouseDown={(e) => {
                                e.preventDefault(); // Prevent input onBlur from firing first
                                onChange(user.email);
                                onSelect(user);
                                setIsOpen(false);
                            }}
                        >
                            <div className="text-xs text-white font-semibold">{user.name} <span className="text-gray-500 text-[10px] ml-1">({user.major})</span></div>
                            <div className="text-[10px] text-gray-400">{user.email}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}