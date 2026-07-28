export const MiLoader = () => {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <div className="relative w-10 h-10">
                <div className="w-10 h-10 border-4 border-gray-200 rounded-full"></div>
                <div className="absolute top-0 left-0 w-10 h-10 border-4 border-[#FF6900] rounded-full animate-spin border-t-transparent"></div>
            </div>
        </div>
    );
};
