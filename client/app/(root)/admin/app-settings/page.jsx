"use client";

import { useEffect, useState, useRef } from "react";
import {
  useGetSettingsQuery,
  useCreateSettingsMutation,
  useUpdateLogoMutation,
  useUpdateFaviconMutation,
  useUpdateHeroBannersMutation,
  useUpdateWeeklyHighlightsMutation,
  useUpdatePromoBannerMutation,
  useUpdateCTAMutation,
  useUpdateMegaMenuMutation,
} from "@/features/appSettings/appSettingsApi";
import { uploadToCloudinary } from "@/hooks/uploadImage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ChevronDown, ChevronRight, ArrowLeft } from "lucide-react";
import { useGetAllCategoriesQuery } from "@/features/category/categoryApi";
import { useGetAllProductsQuery } from "@/features/products/productApi";

function LinkSelector({ value, onChange, categories, products }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState("main"); // "main", "pages", "categories", "products", "custom"
  const [customUrl, setCustomUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const onSelect = (val) => {
    if (val === "home") {
      onChange("/");
      setIsOpen(false);
      setCurrentView("main");
    } else if (val === "shop") {
      onChange("/shop");
      setIsOpen(false);
      setCurrentView("main");
    } else if (val.startsWith("category:")) {
      const id = val.split(":")[1];
      const category = categories?.find(c => c._id === id);
      const categoryIdentifier = category?.slug || id;
      onChange(`/shop/category/${categoryIdentifier}`);
      setIsOpen(false);
      setCurrentView("main");
    } else if (val.startsWith("product:")) {
      const id = val.split(":")[1];
      const product = products?.find(p => p._id === id);
      const productIdentifier = product?.slug || id;
      onChange(`/product/${productIdentifier}`);
      setIsOpen(false);
      setCurrentView("main");
    } else if (val === "custom") {
      if (customUrl) {
        onChange(customUrl);
        setIsOpen(false);
        setCurrentView("main");
        setCustomUrl("");
      }
    }
  };

  const getDisplayValue = () => {
    if (!value) return "Choose destination";
    if (value === "/") return "Home";
    if (value === "/shop") return "Shop";
    if (value.startsWith("/shop/category/")) {
      const slug = value.split("/shop/category/")[1];
      const category = categories?.find(c => c.slug === slug || c._id === slug);
      return category ? category.name : value;
    }
    if (value.startsWith("/product/")) {
      const identifier = value.split("/product/")[1];
      const product = products?.find(p => p.slug === identifier || p._id === identifier);
      return product ? product.name : value;
    }
    return value;
  };

  const handleBack = () => {
    setCurrentView("main");
    setSearchQuery("");
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
    setSearchQuery("");
  };

  const filteredCategories = categories?.filter(c => 
    c.name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const filteredProducts = products?.filter(p => 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="relative w-full">
      <Button
        type="button"
        variant="outline"
        className="w-full justify-between"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            setCurrentView("main");
            setSearchQuery("");
          }
        }}
      >
        <span className="truncate">{getDisplayValue()}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => {
              setIsOpen(false);
              setCurrentView("main");
              setSearchQuery("");
            }}
          />
          <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-[400px] overflow-hidden flex flex-col">
            {/* Header with back button */}
            {currentView !== "main" && (
              <div className="flex items-center gap-2 p-2 border-b">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="h-8 px-2"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                <span className="text-sm font-semibold">
                  {currentView === "pages" && "Pages"}
                  {currentView === "categories" && "Categories"}
                  {currentView === "products" && "Products"}
                  {currentView === "custom" && "Custom URL"}
                </span>
              </div>
            )}

            {/* Main Menu */}
            {currentView === "main" && (
              <div className="p-1 overflow-y-auto">
                <div
                  className="px-2 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded cursor-pointer flex items-center justify-between"
                  onClick={() => handleViewChange("pages")}
                >
                  <span>Pages</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
                <div
                  className="px-2 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded cursor-pointer flex items-center justify-between"
                  onClick={() => handleViewChange("categories")}
                >
                  <span>Categories</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
                <div
                  className="px-2 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded cursor-pointer flex items-center justify-between"
                  onClick={() => handleViewChange("products")}
                >
                  <span>Products</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
                <div
                  className="px-2 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded cursor-pointer flex items-center justify-between"
                  onClick={() => handleViewChange("custom")}
                >
                  <span>Custom URL</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            )}

            {/* Pages View */}
            {currentView === "pages" && (
              <div className="p-1 overflow-y-auto flex-1">
                <div
                  className="px-2 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer"
                  onClick={() => onSelect("home")}
                >
                  Home
                </div>
                <div
                  className="px-2 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer"
                  onClick={() => onSelect("shop")}
                >
                  Shop
                </div>
              </div>
            )}

            {/* Categories View */}
            {currentView === "categories" && (
              <div className="p-1 overflow-y-auto flex-1 flex flex-col">
                <Input
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mb-2"
                />
                <div className="flex-1 overflow-y-auto">
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((c) => (
                      <div
                        key={c._id}
                        className="px-2 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer"
                        onClick={() => onSelect(`category:${c._id}`)}
                      >
                        {c.name}
                      </div>
                    ))
                  ) : (
                    <div className="px-2 py-2 text-sm text-gray-500">
                      {searchQuery ? "No categories found" : "No categories available"}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Products View */}
            {currentView === "products" && (
              <div className="p-1 overflow-y-auto flex-1 flex flex-col">
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mb-2"
                />
                <div className="flex-1 overflow-y-auto">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.slice(0, 100).map((p) => (
                      <div
                        key={p._id}
                        className="px-2 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer"
                        onClick={() => onSelect(`product:${p._id}`)}
                      >
                        {p.name}
                      </div>
                    ))
                  ) : (
                    <div className="px-2 py-2 text-sm text-gray-500">
                      {searchQuery ? "No products found" : "No products available"}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Custom URL View */}
            {currentView === "custom" && (
              <div className="p-1 overflow-y-auto flex flex-col gap-2">
                <Input
                  placeholder="Enter custom URL (e.g., /about, /contact)"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && customUrl) {
                      onSelect("custom");
                    }
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => onSelect("custom")}
                  disabled={!customUrl}
                  className="w-full"
                >
                  Use Custom URL
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function AppSettingsPage() {
  const { data, isLoading, isError, error, refetch } = useGetSettingsQuery();
  const settings = data?.data;
  const { data: categoriesData } = useGetAllCategoriesQuery();
  const categories = categoriesData?.categories || [];
  const { data: productsData } = useGetAllProductsQuery();
  const products = productsData?.products || [];

  const [createSettings] = useCreateSettingsMutation();
  const [updateLogo] = useUpdateLogoMutation();
  const [updateFavicon] = useUpdateFaviconMutation();
  const [updateHeroBanners] = useUpdateHeroBannersMutation();
  const [updateWeeklyHighlights] = useUpdateWeeklyHighlightsMutation();
  const [updatePromoBanner] = useUpdatePromoBannerMutation();
  const [updateCTA] = useUpdateCTAMutation();
  const [updateMegaMenu] = useUpdateMegaMenuMutation();

  const [logo, setLogo] = useState("");
  const [favicon, setFavicon] = useState("");
  const [heroBanners, setHeroBanners] = useState([{ image: "", text: "", link: "" }]);
  const [weeklyHighlights, setWeeklyHighlights] = useState([{ image: "", text: "", link: "" }]);
  const [promoBanner, setPromoBanner] = useState({ image: "", text: "", link: "" });
  const [cta, setCta] = useState({ text: "", link: "" });
  const [megaMenu, setMegaMenu] = useState([{ title: "", items: [{ name: "", href: "" }] }]);
  const [activeSection, setActiveSection] = useState("logo");

  useEffect(() => {
    if (settings) {
      setLogo(settings.logo || "");
      setFavicon(settings.favicon || "");
      setHeroBanners(settings.heroBanners?.length ? settings.heroBanners : [{ image: "", text: "", link: "" }]);
      setWeeklyHighlights(
        settings.weeklyHighlights?.length ? settings.weeklyHighlights : [{ image: "", text: "", link: "" }]
      );
      setPromoBanner(settings.promoBanner || { image: "", text: "", link: "" });
      setCta(settings.cta || { text: "", link: "" });
      // Deep clone to avoid mutating frozen objects from RTK cache
      const initialMega = settings.megaMenu?.length ? settings.megaMenu : [{ title: "", items: [{ name: "", href: "" }] }];
      setMegaMenu(JSON.parse(JSON.stringify(initialMega)));
    }
  }, [settings]);

  const ensureInitialized = async () => {
    if (!settings) {
      const payload = {
        logo: logo || "",
        favicon: favicon || "",
        heroBanners: heroBanners?.length ? heroBanners : [],
        weeklyHighlights: weeklyHighlights?.length ? weeklyHighlights : [],
        promoBanner,
        cta,
        megaMenu,
      };
      try {
        await createSettings(payload).unwrap();
        await refetch();
        toast.success("Settings initialized");
      } catch (e) {
        // ignore if already created by a race
      }
    }
  };

  const onUpload = async (file, setter) => {
    const url = await uploadToCloudinary({ file });
    if (url) setter(url);
  };

  const onArrayUpload = async (file, index, key, array, setArray) => {
    const url = await uploadToCloudinary({ file });
    if (!url) return;
    const next = [...array];
    next[index] = { ...next[index], [key]: url };
    setArray(next);
  };

  const saveLogo = async () => {
    await ensureInitialized();
    await updateLogo({ logo }).unwrap();
    toast.success("Logo updated");
  };

  const saveFavicon = async () => {
    await ensureInitialized();
    await updateFavicon({ favicon }).unwrap();
    toast.success("Favicon updated");
  };

  const saveHeroBanners = async () => {
    await ensureInitialized();
    const filtered = heroBanners.filter((b) => b.image);
    await updateHeroBanners({ heroBanners: filtered }).unwrap();
    toast.success("Hero banners updated");
  };

  const saveWeeklyHighlights = async () => {
    await ensureInitialized();
    const filtered = weeklyHighlights.filter((b) => b.image);
    await updateWeeklyHighlights({ weeklyHighlights: filtered }).unwrap();
    toast.success("Weekly highlights updated");
  };

  const savePromoBanner = async () => {
    await ensureInitialized();
    await updatePromoBanner({ promoBanner }).unwrap();
    toast.success("Promo banner updated");
  };

  const saveCTA = async () => {
    await ensureInitialized();
    await updateCTA({ cta }).unwrap();
    toast.success("CTA updated");
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

  const addItem = (list, setList) => setList([...list, { image: "", text: "", link: "" }]);
  const removeItem = (list, setList, idx) => setList(list.filter((_, i) => i !== idx));

  if (isLoading) return <div>Loading...</div>;
  // Allow 404 (no settings yet) to render the form with defaults
  if (isError && error && error.status !== 404) return <div>Failed to load settings.</div>;

  return (
    <div className="space-y-6 p-6">
      {/* Top Nav for sections */}
      <div className="sticky top-16 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex flex-wrap gap-2 px-1 py-2">
          {[
            { id: "logo", label: "Logo" },
            { id: "hero-banners", label: "Hero Banners" },
            { id: "weekly-highlights", label: "Weekly Highlights" },
            { id: "promo-banner", label: "Promo Banner" },
            { id: "cta", label: "CTA" },
            { id: "nav-menu", label: "Nav Menu" },
          ].map((s) => (
            <Button
              key={s.id}
              variant={activeSection === s.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveSection(s.id)}
              className={activeSection === s.id ? "bg-primary text-primary-foreground" : ""}
            >
              {s.label}
            </Button>
          ))}
        </div>
      </div>
      {activeSection === "logo" && (
      <Card id="logo">
        <CardHeader>
          <CardTitle>Logo & Favicon</CardTitle>
          <p className="text-sm text-muted-foreground">Update your website logo and favicon</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Logo</h3>
            {logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt="Logo" className="h-12 w-auto" />
            )}
            <div className="flex items-center gap-2">
              <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0], setLogo)} />
              <Button onClick={saveLogo}>Save Logo</Button>
            </div>
          </div>

          {/* Favicon Section */}
          <div className="space-y-3 border-t pt-6">
            <h3 className="text-lg font-semibold">Favicon</h3>
            <p className="text-sm text-muted-foreground">Recommended size: 32x32px or 16x16px. Formats: .ico, .png, .svg</p>
            {favicon && (
              <div className="flex items-center gap-4">
                
                <img src={favicon} alt="Favicon" className="h-8 w-8" />
                <span className="text-sm text-muted-foreground">Current favicon preview</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Input type="file" accept="image/x-icon,image/png,image/svg+xml,image/*" onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0], setFavicon)} />
              <Button onClick={saveFavicon}>Save Favicon</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      )}

      {activeSection === "hero-banners" && (
      <Card id="hero-banners">
        <CardHeader>
          <CardTitle>Hero Banners (max 5)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {heroBanners.map((b, idx) => (
            <div key={idx} className="space-y-2 border p-3 rounded">
              {b.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={b.image} alt="banner" className="h-24 w-auto" />
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && onArrayUpload(e.target.files[0], idx, "image", heroBanners, setHeroBanners)} />
                <Input
                  placeholder="Text"
                  value={b.text}
                  onChange={(e) => {
                    const next = [...heroBanners];
                    next[idx] = { ...next[idx], text: e.target.value };
                    setHeroBanners(next);
                  }}
                />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <LinkSelector 
                  value={b.link || ""} 
                  onChange={(link) => {
                    const next = [...heroBanners];
                    next[idx] = { ...next[idx], link };
                    setHeroBanners(next);
                  }} 
                  categories={categories} 
                  products={products} 
                />
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => removeItem(heroBanners, setHeroBanners, idx)}>
                  Remove
                </Button>
              </div>
            </div>
          ))}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => heroBanners.length < 5 && addItem(heroBanners, setHeroBanners)}
              disabled={heroBanners.length >= 5}
            >
              Add Banner
            </Button>
            <Button onClick={saveHeroBanners}>Save</Button>
          </div>
        </CardContent>
      </Card>
      )}

      {activeSection === "weekly-highlights" && (
      <Card id="weekly-highlights">
        <CardHeader>
          <CardTitle>Weekly Highlights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {weeklyHighlights.map((b, idx) => (
            <div key={idx} className="space-y-2 border p-3 rounded">
              {b.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={b.image} alt="highlight" className="h-24 w-auto" />
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && onArrayUpload(e.target.files[0], idx, "image", weeklyHighlights, setWeeklyHighlights)} />
                <Input
                  placeholder="Text"
                  value={b.text}
                  onChange={(e) => {
                    const next = [...weeklyHighlights];
                    next[idx] = { ...next[idx], text: e.target.value };
                    setWeeklyHighlights(next);
                  }}
                />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <LinkSelector 
                  value={b.link || ""} 
                  onChange={(link) => {
                    const next = [...weeklyHighlights];
                    next[idx] = { ...next[idx], link };
                    setWeeklyHighlights(next);
                  }} 
                  categories={categories} 
                  products={products} 
                />
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => removeItem(weeklyHighlights, setWeeklyHighlights, idx)}>
                  Remove
                </Button>
              </div>
            </div>
          ))}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => addItem(weeklyHighlights, setWeeklyHighlights)}>
              Add Highlight
            </Button>
            <Button onClick={saveWeeklyHighlights}>Save</Button>
          </div>
        </CardContent>
      </Card>
      )}

      {activeSection === "promo-banner" && (
      <Card id="promo-banner">
        <CardHeader>
          <CardTitle>Promo Banner</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {promoBanner?.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={promoBanner.image} alt="promo" className="h-24 w-auto" />
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && onArrayUpload(e.target.files[0], 0, "image", [promoBanner], (arr) => setPromoBanner(arr[0]))} />
            <Input
              placeholder="Text"
              value={promoBanner.text || ""}
              onChange={(e) => setPromoBanner({ ...promoBanner, text: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 gap-2">
            <LinkSelector 
              value={promoBanner.link || ""} 
              onChange={(link) => setPromoBanner({ ...promoBanner, link })} 
              categories={categories} 
              products={products} 
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={savePromoBanner}>Save</Button>
          </div>
        </CardContent>
      </Card>
      )}

      {activeSection === "cta" && (
      <Card id="cta">
        <CardHeader>
          <CardTitle>CTA</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Input placeholder="CTA Text" value={cta.text || ""} onChange={(e) => setCta({ ...cta, text: e.target.value })} />
            <LinkSelector 
              value={cta.link || ""} 
              onChange={(link) => setCta({ ...cta, link })} 
              categories={categories} 
              products={products} 
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={saveCTA}>Save</Button>
          </div>
        </CardContent>
      </Card>
      )}

      {activeSection === "nav-menu" && (
      <Card id="nav-menu">
        <CardHeader>
          <CardTitle>Nav Menu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Manage your full navigation menu, including nested dropdowns.</p>
          <Button asChild>
            <a href="/admin/app-settings/nav-menu">Open Nav Menu Editor</a>
          </Button>
        </CardContent>
      </Card>
      )}
    </div>
  );
}


