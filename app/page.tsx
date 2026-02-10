        {/* Planet Effect - Updated for Higher Position */}
        <div className="absolute inset-0 pointer-events-none select-none z-10">
          <div className="absolute left-1/2 -translate-x-1/2 w-[180vw] h-[65%] sm:h-[45%] bottom-0 bg-emerald-900/20 blur-[80px] rounded-t-[100%] z-0"></div>

          {/* Changed top to 55% on mobile (lower) and 45% on sm+ (desktop) */}
          <div className="absolute left-1/2 -translate-x-1/2 z-10 w-[200vw] h-[200vh] top-[55%] sm:top-[45%]">
            {/* Layer 1: Ambient Outer Glow */}
            <div className="absolute inset-0 rounded-[100%] bg-emerald-500/10 blur-[80px] animate-pulse"></div>
            
            {/* Layer 2: Stronger Rim Glow */}
            <div className="absolute inset-[5%] rounded-[100%] bg-emerald-500/20 blur-[40px]"></div>
            
            {/* Layer 3: The "Solid" Planet with Inner Glow & Soft Edge */}
            <div className="absolute inset-[10%] rounded-[100%] bg-black overflow-hidden shadow-[0_-20px_100px_-10px_rgba(16,185,129,0.5),inset_0_20px_80px_10px_rgba(16,185,129,0.3)]">
                {/* Blurred soft rim light */}
                <div className="absolute inset-0 rounded-[100%] border-t-2 border-emerald-400/60 blur-[6px]"></div>
                {/* Sharper (but still soft) inner rim definition */}
                <div className="absolute inset-0 rounded-[100%] border-t border-emerald-500/30 blur-[2px]"></div>
                
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-emerald-950/20 to-black opacity-90"></div>
            </div>
          </div>

          <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent blur-[1px] z-20 top-[55%] sm:top-[45%]"></div>
        </div>