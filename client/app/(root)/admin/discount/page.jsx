import { CouponsTable } from "@/components/admin/coupons-table";
import { Button } from "@/components/ui/button";
import { IconPlus } from "@tabler/icons-react";
import Link from "next/link";

export default function DiscountPage() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <h1 className="text-2xl font-bold">Discount Coupons</h1>
          <p className="text-muted-foreground">
            Manage your discount coupons and promotions
          </p>
        </div>
        <Link href={"/admin/discount/add"}>
          <Button>
            <IconPlus className="mr-2 h-4 w-4" />
            Add Coupon
          </Button>
        </Link>
      </div>
      <CouponsTable />
    </div>
  );
}
