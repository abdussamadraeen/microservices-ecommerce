import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "@clerk/nextjs";

const SETTINGS_URL = `${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL}/settings`;

export interface StoreSettings {
    storeName: string;
    storeLogo: string;
    storeAddress: string;
    currency: string;
    language: string;
}

export const useStoreSettings = () => {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();

    const { data: settings, isLoading } = useQuery({
        queryKey: ["storeSettings"],
        queryFn: async () => {
            // Fetching settings doesn't strictly need auth for guests (invoices), 
            // but editing does. The backend GET is public (no `shouldBeUser` middleware), 
            // which is good for the Invoice page.
            const res = await axios.get(SETTINGS_URL);
            return res.data as StoreSettings;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const mutation = useMutation({
        mutationFn: async (newSettings: StoreSettings) => {
            const token = await getToken();
            const res = await axios.put(SETTINGS_URL, newSettings, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["storeSettings"] });
            toast.success("Settings saved successfully!");
            // Dispatch event for non-React listeners if any
            window.dispatchEvent(new Event("settingsUpdated"));
        },
        onError: () => {
            toast.error("Failed to save settings");
        }
    });

    return {
        settings,
        isLoading,
        updateSettings: mutation.mutateAsync,
        isUpdating: mutation.isPending
    };
};
