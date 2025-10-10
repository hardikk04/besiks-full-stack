import { ProductsTable } from "@/components/admin/products-table";
import { Button } from "@/components/ui/button";
import { IconPlus } from "@tabler/icons-react";
import Link from "next/link";

export default function ProductsPage() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Link href={"/admin/products/add"}>
          <Button>
            <IconPlus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>
      <ProductsTable />
    </div>
  );
}
