"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  useGetSettingsQuery,
  useCreateSettingsMutation,
  useUpdateMegaMenuMutation,
} from "@/features/appSettings/appSettingsApi";

export default function MegaMenuSettingsPage() {
  const { data, isLoading, isError, error, refetch } = useGetSettingsQuery();
  const settings = data?.data;
  const [createSettings] = useCreateSettingsMutation();
  const [updateMegaMenu] = useUpdateMegaMenuMutation();

  const [megaMenu, setMegaMenu] = useState([{ title: "", items: [{ name: "", href: "" }] }]);

  useEffect(() => {
    if (settings) {
      const initialMega = settings.megaMenu?.length ? settings.megaMenu : [{ title: "", items: [{ name: "", href: "" }] }];
      setMegaMenu(JSON.parse(JSON.stringify(initialMega)));
    }
  }, [settings]);

  const ensureInitialized = async () => {
    if (!settings) {
      try {
        await createSettings({}).unwrap();
        await refetch();
      } catch {}
    }
  };

  const saveMegaMenu = async () => {
    await ensureInitialized();
    const cleaned = megaMenu
      .filter((m) => m.title && (m.items?.length ?? 0) > 0)
      .map((m) => ({
        title: m.title,
        items: (m.items || []).filter((i) => i.name && i.href),
      }));
    await updateMegaMenu({ megaMenu: cleaned }).unwrap();
    toast.success("Mega menu updated");
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError && error && error.status !== 404) return <div>Failed to load settings.</div>;

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Mega Menu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {megaMenu.map((cat, cIdx) => (
            <div key={cIdx} className="space-y-3 border p-3 rounded">
              <div className="flex gap-2">
                <Input
                  placeholder="Category title"
                  value={cat.title}
                  onChange={(e) => {
                    const next = megaMenu.map((c) => ({ ...c, items: [...(c.items || [])] }));
                    next[cIdx] = { ...next[cIdx], title: e.target.value };
                    setMegaMenu(next);
                  }}
                />
                <Button
                  variant="secondary"
                  onClick={() => setMegaMenu(megaMenu.filter((_, i) => i !== cIdx))}
                >
                  Remove
                </Button>
              </div>
              <div className="space-y-2">
                {(cat.items || []).map((item, iIdx) => (
                  <div key={iIdx} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2">
                    <Input
                      placeholder="Item name"
                      value={item.name}
                      onChange={(e) => {
                        const next = megaMenu.map((c) => ({ ...c, items: [...(c.items || [])] }));
                        const updatedCat = { ...next[cIdx] };
                        updatedCat.items[iIdx] = { ...updatedCat.items[iIdx], name: e.target.value };
                        next[cIdx] = updatedCat;
                        setMegaMenu(next);
                      }}
                    />
                    <Input
                      placeholder="Item href (/shop/...)"
                      value={item.href}
                      onChange={(e) => {
                        const next = megaMenu.map((c) => ({ ...c, items: [...(c.items || [])] }));
                        const updatedCat = { ...next[cIdx] };
                        updatedCat.items[iIdx] = { ...updatedCat.items[iIdx], href: e.target.value };
                        next[cIdx] = updatedCat;
                        setMegaMenu(next);
                      }}
                    />
                    <Button
                      variant="secondary"
                      onClick={() => {
                        const next = megaMenu.map((c) => ({ ...c, items: [...(c.items || [])] }));
                        const updatedCat = { ...next[cIdx] };
                        updatedCat.items = updatedCat.items.filter((_, j) => j !== iIdx);
                        next[cIdx] = updatedCat;
                        setMegaMenu(next);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => {
                    const next = megaMenu.map((c) => ({ ...c, items: [...(c.items || [])] }));
                    const updatedCat = { ...next[cIdx] };
                    updatedCat.items = [...(updatedCat.items || []), { name: "", href: "" }];
                    next[cIdx] = updatedCat;
                    setMegaMenu(next);
                  }}
                >
                  Add Item
                </Button>
              </div>
            </div>
          ))}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setMegaMenu([...megaMenu, { title: "", items: [{ name: "", href: "" }] }])}
            >
              Add Category
            </Button>
            <Button onClick={saveMegaMenu}>Save</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


