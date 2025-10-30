"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useGetSettingsQuery,
  useCreateSettingsMutation,
  useUpdateLogoMutation,
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

export default function AppSettingsPage() {
  const { data, isLoading, isError, error, refetch } = useGetSettingsQuery();
  const settings = data?.data;

  const [createSettings] = useCreateSettingsMutation();
  const [updateLogo] = useUpdateLogoMutation();
  const [updateHeroBanners] = useUpdateHeroBannersMutation();
  const [updateWeeklyHighlights] = useUpdateWeeklyHighlightsMutation();
  const [updatePromoBanner] = useUpdatePromoBannerMutation();
  const [updateCTA] = useUpdateCTAMutation();
  const [updateMegaMenu] = useUpdateMegaMenuMutation();

  const [logo, setLogo] = useState("");
  const [heroBanners, setHeroBanners] = useState([{ image: "", text: "", link: "" }]);
  const [weeklyHighlights, setWeeklyHighlights] = useState([{ image: "", text: "", link: "" }]);
  const [promoBanner, setPromoBanner] = useState({ image: "", text: "", link: "" });
  const [cta, setCta] = useState({ text: "", link: "" });
  const [megaMenu, setMegaMenu] = useState([{ title: "", items: [{ name: "", href: "" }] }]);
  const [activeSection, setActiveSection] = useState("logo");

  useEffect(() => {
    if (settings) {
      setLogo(settings.logo || "");
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
              variant="outline"
              size="sm"
              onClick={() => setActiveSection(s.id)}
            >
              {s.label}
            </Button>
          ))}
        </div>
      </div>
      {activeSection === "logo" && (
      <Card id="logo">
        <CardHeader>
          <CardTitle>Logo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt="Logo" className="h-12 w-auto" />
          )}
          <div className="flex items-center gap-2">
            <Input type="url" placeholder="Logo URL" value={logo} onChange={(e) => setLogo(e.target.value)} />
            <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0], setLogo)} />
            <Button onClick={saveLogo}>Save</Button>
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <Input
                  placeholder="Image URL"
                  value={b.image}
                  onChange={(e) => {
                    const next = [...heroBanners];
                    next[idx] = { ...next[idx], image: e.target.value };
                    setHeroBanners(next);
                  }}
                />
                <Input
                  placeholder="Text"
                  value={b.text}
                  onChange={(e) => {
                    const next = [...heroBanners];
                    next[idx] = { ...next[idx], text: e.target.value };
                    setHeroBanners(next);
                  }}
                />
                <Input
                  placeholder="Link"
                  value={b.link}
                  onChange={(e) => {
                    const next = [...heroBanners];
                    next[idx] = { ...next[idx], link: e.target.value };
                    setHeroBanners(next);
                  }}
                />
                <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && onArrayUpload(e.target.files[0], idx, "image", heroBanners, setHeroBanners)} />
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <Input
                  placeholder="Image URL"
                  value={b.image}
                  onChange={(e) => {
                    const next = [...weeklyHighlights];
                    next[idx] = { ...next[idx], image: e.target.value };
                    setWeeklyHighlights(next);
                  }}
                />
                <Input
                  placeholder="Text"
                  value={b.text}
                  onChange={(e) => {
                    const next = [...weeklyHighlights];
                    next[idx] = { ...next[idx], text: e.target.value };
                    setWeeklyHighlights(next);
                  }}
                />
                <Input
                  placeholder="Link"
                  value={b.link}
                  onChange={(e) => {
                    const next = [...weeklyHighlights];
                    next[idx] = { ...next[idx], link: e.target.value };
                    setWeeklyHighlights(next);
                  }}
                />
                <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && onArrayUpload(e.target.files[0], idx, "image", weeklyHighlights, setWeeklyHighlights)} />
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <Input
              placeholder="Image URL"
              value={promoBanner.image || ""}
              onChange={(e) => setPromoBanner({ ...promoBanner, image: e.target.value })}
            />
            <Input
              placeholder="Text"
              value={promoBanner.text || ""}
              onChange={(e) => setPromoBanner({ ...promoBanner, text: e.target.value })}
            />
            <Input
              placeholder="Link"
              value={promoBanner.link || ""}
              onChange={(e) => setPromoBanner({ ...promoBanner, link: e.target.value })}
            />
            <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && onArrayUpload(e.target.files[0], 0, "image", [promoBanner], (arr) => setPromoBanner(arr[0]))} />
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
            <Input placeholder="CTA Link" value={cta.link || ""} onChange={(e) => setCta({ ...cta, link: e.target.value })} />
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


