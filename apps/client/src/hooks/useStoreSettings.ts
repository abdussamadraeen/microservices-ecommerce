import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const SETTINGS_URL = `${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL}/settings`;

export interface StoreSettings {
    storeName: string;
    storeLogo: string;
    storeAddress: string;
    currency: string;
    language: string;
}

export const useStoreSettings = () => {
    // Client-side fetch only, no auth required for viewing invoice settings
    const { data: settings, isLoading } = useQuery({
        queryKey: ["storeSettings"],
        queryFn: async () => {
            const res = await axios.get(SETTINGS_URL);
            return res.data as StoreSettings;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    return {
        settings,
        isLoading,
    };
};
