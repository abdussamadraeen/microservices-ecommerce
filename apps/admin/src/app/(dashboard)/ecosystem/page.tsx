import EcosystemManager from "@/components/EcosystemManager";

export default function EcosystemPage() {
    return (
        <div className="p-6 space-y-6">
            <div className="glass-panel max-w-4xl mx-auto rounded-xl px-6 py-4 flex flex-col items-center justify-center text-center">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Homepage 3D Showcase
                </h1>
                <p className="text-sm text-muted-foreground mt-1">Customize the 3D showcase section on the homepage.</p>
            </div>
            <EcosystemManager />
        </div>
    );
}
