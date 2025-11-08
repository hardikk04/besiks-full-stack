"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredGroup, setHoveredGroup] = useState(null);
  const subMenuRefs = {
    pages: useRef(null),
    categories: useRef(null),
    products: useRef(null),
  };
  const parentRefs = {
    pages: useRef(null),
    categories: useRef(null),
    products: useRef(null),
  };
  const [positions, setPositions] = useState({
    pages: 'right',
    categories: 'right',
    products: 'right',
  });

  const calculatePosition = (group) => {
    if (!parentRefs[group].current) return;
    
    const parentRect = parentRefs[group].current.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const subMenuMinWidth = group === 'pages' ? 150 : 200;
    const margin = 10; // Margin between parent and submenu
    const requiredSpace = subMenuMinWidth + margin;
    
    // Calculate available space
    const spaceOnRight = windowWidth - parentRect.right;
    const spaceOnLeft = parentRect.left;
    
    // Position on left if there's not enough space on right AND more space on left
    if (spaceOnRight < requiredSpace && spaceOnLeft > spaceOnRight) {
      setPositions(prev => ({ ...prev, [group]: 'left' }));
    } else {
      // Default to right (either enough space or more space on right)
      setPositions(prev => ({ ...prev, [group]: 'right' }));
    }
  };

  // Recalculate position when submenu becomes visible
  useEffect(() => {
    if (hoveredGroup) {
      // Wait for DOM to update, then recalculate
      const timer = setTimeout(() => {
        calculatePosition(hoveredGroup);
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [hoveredGroup]);

  const onSelect = (val) => {
    if (val === "home") {
      onChange("/");
      setIsOpen(false);
    } else if (val === "shop") {
      onChange("/shop");
      setIsOpen(false);
    } else if (val.startsWith("category:")) {
      const id = val.split(":")[1];
      const category = categories?.find(c => c._id === id);
      const categoryIdentifier = category?.slug || id;
      onChange(`/shop/category/${categoryIdentifier}`);
      setIsOpen(false);
    } else if (val.startsWith("product:")) {
      const id = val.split(":")[1];
      const product = products?.find(p => p._id === id);
      // Use slug if available, otherwise fall back to id
      const productIdentifier = product?.slug || id;
      onChange(`/product/${productIdentifier}`);
      setIsOpen(false);
    }
  };

  const getDisplayValue = () => {
    if (!value) return "Choose destination or use Custom";
    if (value === "/") return "Home";
    if (value === "/shop") return "Shop";
    if (value.startsWith("/shop/category/")) {
      const slug = value.split("/shop/category/")[1];
      const category = categories?.find(c => c.slug === slug || c._id === slug);
      return category ? category.name : value;
    }
    if (value.startsWith("/product/")) {
      const identifier = value.split("/product/")[1];
      // Try to find by slug first, then by id
      const product = products?.find(p => p.slug === identifier || p._id === identifier);
      return product ? product.name : value;
    }
    return value;
  };

  return (
    <div className="relative w-full">
      <Button
        type="button"
        variant="outline"
        className="w-full justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">{getDisplayValue()}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg">
            <div className="p-1">
              {/* Pages Group */}
              <div
                ref={parentRefs.pages}
                className="relative"
                onMouseEnter={(e) => {
                  setHoveredGroup('pages');
                  // Calculate position before showing submenu
                  setTimeout(() => calculatePosition('pages'), 0);
                }}
                onMouseLeave={() => setHoveredGroup(null)}
              >
                <div className="px-2 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded cursor-pointer">
                  Pages
                  <ChevronRight className="inline-block h-3 w-3 ml-1" />
                </div>
                {hoveredGroup === 'pages' && (
                  <div
                    ref={subMenuRefs.pages}
                    className={`absolute top-0 bg-white border rounded-md shadow-lg min-w-[150px] z-50 ${
                      positions.pages === 'right' ? 'left-full ml-1' : 'right-full mr-1'
                    }`}
                  >
                    <div className="p-1">
                      <div
                        className="px-2 py-1.5 text-sm hover:bg-gray-100 rounded cursor-pointer"
                        onClick={() => onSelect("home")}
                      >
                        Home
                      </div>
                      <div
                        className="px-2 py-1.5 text-sm hover:bg-gray-100 rounded cursor-pointer"
                        onClick={() => onSelect("shop")}
                      >
                        Shop
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Categories Group */}
              <div
                ref={parentRefs.categories}
                className="relative"
                onMouseEnter={(e) => {
                  setHoveredGroup('categories');
                  // Calculate position before showing submenu
                  setTimeout(() => calculatePosition('categories'), 0);
                }}
                onMouseLeave={() => setHoveredGroup(null)}
              >
                <div className="px-2 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded cursor-pointer">
                  Categories
                  <ChevronRight className="inline-block h-3 w-3 ml-1" />
                </div>
                {hoveredGroup === 'categories' && (
                  <div
                    ref={subMenuRefs.categories}
                    className={`absolute top-0 bg-white border rounded-md shadow-lg min-w-[200px] max-h-[300px] overflow-y-auto z-50 ${
                      positions.categories === 'right' ? 'left-full ml-1' : 'right-full mr-1'
                    }`}
                  >
                    <div className="p-1">
                      {categories && categories.length > 0 ? (
                        categories.map((c) => (
                          <div
                            key={c._id}
                            className="px-2 py-1.5 text-sm hover:bg-gray-100 rounded cursor-pointer"
                            onClick={() => onSelect(`category:${c._id}`)}
                          >
                            {c.name}
                          </div>
                        ))
                      ) : (
                        <div className="px-2 py-1.5 text-sm text-gray-500">
                          No categories available
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Products Group */}
              <div
                ref={parentRefs.products}
                className="relative"
                onMouseEnter={(e) => {
                  setHoveredGroup('products');
                  // Calculate position before showing submenu
                  setTimeout(() => calculatePosition('products'), 0);
                }}
                onMouseLeave={() => setHoveredGroup(null)}
              >
                <div className="px-2 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded cursor-pointer">
                  Products
                  <ChevronRight className="inline-block h-3 w-3 ml-1" />
                </div>
                {hoveredGroup === 'products' && (
                  <div
                    ref={subMenuRefs.products}
                    className={`absolute top-0 bg-white border rounded-md shadow-lg min-w-[200px] max-h-[300px] overflow-y-auto z-50 ${
                      positions.products === 'right' ? 'left-full ml-1' : 'right-full mr-1'
                    }`}
                  >
                    <div className="p-1">
                      {products && products.length > 0 ? (
                        products.slice(0, 50).map((p) => (
                          <div
                            key={p._id}
                            className="px-2 py-1.5 text-sm hover:bg-gray-100 rounded cursor-pointer"
                            onClick={() => onSelect(`product:${p._id}`)}
                          >
                            {p.name}
                          </div>
                        ))
                      ) : (
                        <div className="px-2 py-1.5 text-sm text-gray-500">
                          No products available
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function TreeItem({ item, path, onChange, onAddSibling, onAddChild, onRemove, onDragStart, onDrop, categories, products, expandedPaths, onToggleExpand }) {
  const hasChildren = (item.children || []).length > 0;
  const pathKey = path.join(',');
  const isExpanded = expandedPaths.has(pathKey);
  
  const handleToggle = () => {
    onToggleExpand(pathKey);
  };

  return (
    <div className="space-y-2 border p-3 rounded bg-white" draggable onDragStart={(e) => onDragStart(e, path)}>
      <DropZone onDrop={onDrop} path={path} position="before" />
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_1fr_1fr_auto] gap-2 items-center">
        {hasChildren ? (
          <Collapsible open={isExpanded} onOpenChange={handleToggle}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                type="button"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </Collapsible>
        ) : (
          <div className="w-8"></div>
        )}
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
        Drop here to nest under "{item.label || "Untitled"}"
      </div>
      {hasChildren && (
        <Collapsible open={isExpanded} onOpenChange={handleToggle}>
          <CollapsibleContent>
            <div className="pl-4 space-y-2 mt-2">
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
                  expandedPaths={expandedPaths}
                  onToggleExpand={onToggleExpand}
                />
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
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
  const [expandedPaths, setExpandedPaths] = useState(new Set());

  useEffect(() => {
    if (settings) {
      const initial = settings.navMenu?.length ? settings.navMenu : settings.megaMenu?.length
        ? settings.megaMenu.map((m) => ({ label: m.title, children: (m.items || []).map((i) => ({ label: i.name, href: i.href, children: [] })) }))
        : [{ label: "", href: "", children: [] }];
      setNavMenu(JSON.parse(JSON.stringify(initial)));
      
      // Auto-expand all items with children on load
      const expandAll = (items, parentPath = []) => {
        const newExpanded = new Set();
        items.forEach((item, idx) => {
          const currentPath = [...parentPath, idx];
          const pathKey = currentPath.join(',');
          if (item.children && item.children.length > 0) {
            newExpanded.add(pathKey);
            const childExpanded = expandAll(item.children, currentPath);
            childExpanded.forEach(key => newExpanded.add(key));
          }
        });
        return newExpanded;
      };
      const allExpanded = expandAll(JSON.parse(JSON.stringify(initial)));
      setExpandedPaths(allExpanded);
    }
  }, [settings]);

  const toggleExpand = (pathKey) => {
    setExpandedPaths((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(pathKey)) {
        newSet.delete(pathKey);
      } else {
        newSet.add(pathKey);
      }
      return newSet;
    });
  };

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
    
    // Auto-expand the parent when adding a child
    const pathKey = path.join(',');
    setExpandedPaths((prev) => {
      const newSet = new Set(prev);
      newSet.add(pathKey);
      return newSet;
    });
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
                expandedPaths={expandedPaths}
                onToggleExpand={toggleExpand}
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


