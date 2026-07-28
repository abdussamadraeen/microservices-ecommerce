"use client";

import { SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import UserOrders from "./UserOrders";
import { ShoppingBag, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "react-toastify";

interface UserDetailsPanelProps {
    user: any;
}

const UserDetailsPanel = ({ user }: UserDetailsPanelProps) => {
    const [copied, setCopied] = useState(false);

    const handleCopyId = () => {
        navigator.clipboard.writeText(user.id);
        setCopied(true);
        toast.success("User ID copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <SheetContent className="w-full sm:max-w-[700px] sm:w-[700px] overflow-y-auto">
            <SheetHeader className="mb-6">
                <SheetTitle>User Details</SheetTitle>
                <SheetDescription>View user information and order history.</SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-6">
                {/* User Profile Header */}
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-primary/10">
                        <AvatarImage src={user.imageUrl} alt={user.firstName} />
                        <AvatarFallback className="text-lg">
                            {user.firstName?.charAt(0) || user.username?.charAt(0) || "?"}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="text-xl font-bold">
                            {user.firstName} {user.lastName}
                        </h3>
                        <p className="text-sm text-muted-foreground">{user.emailAddresses?.[0]?.emailAddress}</p>
                        <div className="flex gap-2 mt-2">
                            <Badge variant={user.banned ? "destructive" : "default"} className="uppercase text-[10px]">
                                {user.banned ? "Banned" : "Active"}
                            </Badge>
                            <Badge variant="outline" className="uppercase text-[10px]">
                                {user.publicMetadata?.role || "User"}
                            </Badge>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* User Info Section */}
                <div className="space-y-4">
                    {/* User ID Row - Full Width with Copy */}
                    <div className="bg-muted/30 p-3 rounded-md border">
                        <span className="text-muted-foreground block text-xs uppercase mb-1.5 font-semibold tracking-wider">User ID</span>
                        <div className="flex items-center gap-2">
                            <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold break-all">
                                {user.id}
                            </code>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 shrink-0"
                                onClick={handleCopyId}
                            >
                                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                            </Button>
                        </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-4 text-sm px-1">
                        <div>
                            <span className="text-muted-foreground block text-xs uppercase mb-1 font-semibold tracking-wider">Joined</span>
                            <span>{user.createdAt ? format(new Date(user.createdAt), "PPP") : "-"}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block text-xs uppercase mb-1 font-semibold tracking-wider">Phone</span>
                            <span>{user.phoneNumbers?.[0]?.phoneNumber || "-"}</span>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Order History Section */}
                <div>
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-primary" />
                        Order History
                    </h4>
                    <UserOrders userId={user.id} compact={true} />
                </div>
            </div>
        </SheetContent>
    );
};

export default UserDetailsPanel;
