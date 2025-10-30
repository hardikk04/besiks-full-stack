"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  useGetSettingsQuery,
  useCreateSettingsMutation,
  useUpdateNavMenuMutation,
} from "@/features/appSettings/appSettingsApi";
import { useGetAllCategoriesQuery } from "@/features/category/categoryApi";
import { useGetAllProductsQuery } from "@/features/products/productApi";

function DropZone({ onDrop, path, position }) {
  return (
    <div
      className="h-2 my-1 rounded bg-transparent hover:bg-blue-100 transition-colors"
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      }}
      onDrop={(e) => onDrop(e, path, position)}
    />
  );
}

function LinkSelector({ value, onChange, categories, products }) {
  // options: Home, Shop, Category: <list>, Custom
  const onSelect = (val) => {
    if (val === "custom") return; // keep manual editing
    if (val === "home") return onChange("/");
    if (val === "shop") return onChange("/shop");
    if (val.startsWith("category:")) {
      const id = val.split(":")[1];
      return onChange(`/shop/category/${id}`);
    }
    if (val.startsWith("product:")) {
      const id = val.split(":")[1];
      return onChange(`/product/${id}`);
    }
  };
  return (
    <Select onValueChange={onSelect}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={value || "Choose destination or use Custom"} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Common</SelectLabel>
          <SelectItem value="home">Home</SelectItem>
          <SelectItem value="shop">Shop</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Categories</SelectLabel>
          {(categories || []).map((c) => (
            <SelectItem key={c._id} value={`category:${c._id}`}>{c.name}</SelectItem>
          ))}
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Products</SelectLabel>
          {(products || []).slice(0, 50).map((p) => (
            <SelectItem key={p._id} value={`product:${p._id}`}>{p.name}</SelectItem>
          ))}
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Other</SelectLabel>
          <SelectItem value="custom">Custom URL (edit field)</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

function TreeItem({ item, path, onChange, onAddSibling, onAddChild, onRemove, onDragStart, onDrop, categories, products }) {
  return (
    <div className="space-y-2 border p-3 rounded bg-white" draggable onDragStart={(e) => onDragStart(e, path)}>
      <DropZone onDrop={onDrop} path={path} position="before" />
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center">
        <Input
          placeholder="Label"
          value={item.label}
          onChange={(e) => onChange(path, { ...item, label: e.target.value })}
        />
        <Input
          placeholder="Custom URL (optional)"
          value={item.href || ""}
          onChange={(e) => onChange(path, { ...item, href: e.target.value })}
        />
        <LinkSelector value={item.href || ""} onChange={(href) => onChange(path, { ...item, href })} categories={categories} products={products} />
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={() => onAddSibling(path)}>Add Sibling</Button>
          <Button variant="outline" size="sm" onClick={() => onAddChild(path)}>Add Child</Button>
          <Button variant="secondary" size="sm" onClick={() => onRemove(path)}>Remove</Button>
        </div>
      </div>
      {/* Nesting drop zone: drop ON the card body to make it a child */}
      <div
        className="rounded border border-dashed p-2 text-xs text-muted-foreground hover:bg-blue-50 cursor-copy"
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "copy";
        }}
        onDrop={(e) => onDrop(e, [...path, 0], "into")}
      >
        Drop here to nest under “{item.label || "Untitled"}”
      </div>
      {(item.children || []).length > 0 && (
        <div className="pl-4 space-y-2">
          {item.children.map((child, idx) => (
            <TreeItem
              key={idx}
              item={child}
              path={[...path, idx]}
              onChange={onChange}
              onAddSibling={onAddSibling}
              onAddChild={onAddChild}
              onRemove={onRemove}
              onDragStart={onDragStart}
              onDrop={onDrop}
              categories={categories}
              products={products}
            />
          ))}
        </div>
      )}
      <DropZone onDrop={onDrop} path={path} position="after" />
    </div>
  );
}

export default function NavMenuSettingsPage() {
  const { data, isLoading, isError, error, refetch } = useGetSettingsQuery();
  const settings = data?.data;
  const [createSettings] = useCreateSettingsMutation();
  const [updateNavMenu] = useUpdateNavMenuMutation();
  const { data: categoriesData } = useGetAllCategoriesQuery();
  const categories = categoriesData?.categories || [];
  const { data: productsData } = useGetAllProductsQuery();
  const products = productsData?.products || [];

  const [navMenu, setNavMenu] = useState([{ label: "Home", href: "/", children: [] }]);

  useEffect(() => {
    if (settings) {
      const initial = settings.navMenu?.length ? settings.navMenu : settings.megaMenu?.length
        ? settings.megaMenu.map((m) => ({ label: m.title, children: (m.items || []).map((i) => ({ label: i.name, href: i.href, children: [] })) }))
        : [{ label: "", href: "", children: [] }];
      setNavMenu(JSON.parse(JSON.stringify(initial)));
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

  const updateAtPath = (path, newItem) => {
    const next = JSON.parse(JSON.stringify(navMenu));
    let parent = { children: next };
    for (let i = 0; i < path.length - 1; i++) parent = parent.children[path[i]];
    parent.children[path[path.length - 1]] = newItem;
    setNavMenu(next);
  };

  const removeAtPath = (path) => {
    const next = JSON.parse(JSON.stringify(navMenu));
    let parent = { children: next };
    for (let i = 0; i < path.length - 1; i++) parent = parent.children[path[i]];
    parent.children.splice(path[path.length - 1], 1);
    setNavMenu(next);
  };

  const addSibling = (path) => {
    const next = JSON.parse(JSON.stringify(navMenu));
    let parent = { children: next };
    for (let i = 0; i < path.length - 1; i++) parent = parent.children[path[i]];
    parent.children.splice(path[path.length - 1] + 1, 0, { label: "", href: "", children: [] });
    setNavMenu(next);
  };

  const addChild = (path) => {
    const next = JSON.parse(JSON.stringify(navMenu));
    let node = next[path[0]];
    for (let i = 1; i < path.length; i++) node = node.children[path[i]];
    node.children = node.children || [];
    node.children.push({ label: "", href: "", children: [] });
    setNavMenu(next);
  };

  // DnD handlers using HTML5 drag-n-drop with JSON path payloads
  const onDragStart = (e, path) => {
    e.dataTransfer.setData("application/json", JSON.stringify({ path }));
  };

  const onDrop = (e, targetPath, position) => {
    e.preventDefault();
    const payload = e.dataTransfer.getData("application/json");
    if (!payload) return;
    const { path: sourcePath } = JSON.parse(payload);
    // avoid dropping onto itself or descendant
    if (targetPath.join(",").startsWith(sourcePath.join(","))) return;

    const next = JSON.parse(JSON.stringify(navMenu));
    // extract source node
    let srcParent = { children: next };
    for (let i = 0; i < sourcePath.length - 1; i++) srcParent = srcParent.children[sourcePath[i]];
    const [moved] = srcParent.children.splice(sourcePath[sourcePath.length - 1], 1);

    if (position === "into") {
      // make it a child of targetPath's node
      let node = next[targetPath[0]];
      for (let i = 1; i < targetPath.length; i++) node = node.children[targetPath[i]] || node;
      node.children = node.children || [];
      node.children.push(moved);
    } else {
      // insert before/after as sibling of target's parent
      let tgtParent = { children: next };
      for (let i = 0; i < targetPath.length - 1; i++) tgtParent = tgtParent.children[targetPath[i]];
      let insertIndex = targetPath[targetPath.length - 1];
      if (position === "after") insertIndex += 1;
      tgtParent.children.splice(insertIndex, 0, moved);
    }
    setNavMenu(next);
  };

  const saveNavMenu = async () => {
    await ensureInitialized();
    const cleaned = (arr) =>
      (arr || [])
        .filter((n) => n.label)
        .map((n) => ({ label: n.label, href: n.href || undefined, children: cleaned(n.children || []) }));
    await updateNavMenu({ navMenu: cleaned(navMenu) }).unwrap();
    toast.success("Nav menu updated");
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError && error && error.status !== 404) return <div>Failed to load settings.</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/app-settings" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to App Settings
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Nav Menu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            {navMenu.map((item, idx) => (
              <TreeItem
                key={idx}
                item={item}
                path={[idx]}
                onChange={updateAtPath}
                onAddSibling={addSibling}
                onAddChild={addChild}
                onRemove={removeAtPath}
                onDragStart={onDragStart}
                onDrop={onDrop}
                categories={categories}
                products={products}
              />)
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setNavMenu([...navMenu, { label: "", href: "", children: [] }])}>
              Add Top Item
            </Button>
            <Button onClick={saveNavMenu}>Save</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


