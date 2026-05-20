import { UserRole, ROLE_CONFIG } from "../_utils/agenda_types";

/* ─── ADMIN IMPERSONATION SWITCHER ─── */
export default function DevRoleSwitcher({ currentRole, onRoleChange }: { currentRole: UserRole; onRoleChange: (role: UserRole) => void }) {
    return (
        <div className="fixed top-3 right-3 z-[1000] group">
            <div className="flex items-center gap-1 bg-[#111118]/80 backdrop-blur-md border border-white/10 rounded-full p-1 shadow-xl hover:bg-[#111118] transition-all duration-300">
                {(Object.keys(ROLE_CONFIG) as UserRole[]).map((role) => {
                    const config = ROLE_CONFIG[role];
                    const RoleIcon = config.icon;
                    const isActive = currentRole === role;
                    return (
                        <button
                            key={role}
                            onClick={() => onRoleChange(role)}
                            className={`p-2 rounded-full transition-all duration-200 relative group/btn ${isActive
                                ? `${config.bgColor} ${config.color} shadow-lg shadow-black/50`
                                : "text-gray-500 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            <RoleIcon className="w-3.5 h-3.5" />
                            {/* Minimal Tooltip */}
                            <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-black text-[9px] font-bold text-white rounded opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/10 shadow-2xl">
                                {config.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}