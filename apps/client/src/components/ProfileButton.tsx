"use client";

import { UserButton } from "@clerk/nextjs";
import { ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const ProfileButton = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <UserButton>
      <UserButton.MenuItems>
        <UserButton.Action
          label="See Orders"
          labelIcon={<ShoppingBag className="w-4 h-4" />}
          onClick={() => router.push("/orders")}
        />
      </UserButton.MenuItems>
    </UserButton>
  );
};

export default ProfileButton;
