"use client";

import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { Plus } from "lucide-react";
import AddProduct from "./AddProduct";
import { Button } from "./ui/button";

const AddProductButton = () => {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Create Product
                </Button>
            </SheetTrigger>
            <AddProduct />
        </Sheet>
    );
};

export default AddProductButton;
