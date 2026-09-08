"use client";

import {
  FormEvent,
  useEffect,
  useState,
  type ChangeEvent,
} from "react";

import { AppShell } from "@/components/layout/app-shell";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Asset = {
  id: number;
  name: string;
  type: string;
  target: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

const API_URL = "http://127.0.0.1:8000";

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [target, setTarget] = useState("");
  const [description, setDescription] = useState("");

  const [editingAssetId, setEditingAssetId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingAssetId, setDeletingAssetId] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAssets() {
      try {
        const response = await fetch(`${API_URL}/api/v1/assets`);

        if (!response.ok) {
          throw new Error("Failed to fetch assets");
        }

        const data: Asset[] = await response.json();
        setAssets(data);
      } catch {
        setError("Unable to load assets.");
      } finally {
        setLoading(false);
      }
    }

    fetchAssets();
  }, []);

  function resetForm() {
    setName("");
    setType("");
    setTarget("");
    setDescription("");
    setEditingAssetId(null);
    setFormError(null);
  }

  function startEditing(asset: Asset) {
    setEditingAssetId(asset.id);
    setName(asset.name);
    setType(asset.type);
    setTarget(asset.target);
    setDescription(asset.description ?? "");
    setFormError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setFormError(null);

    try {
      const isEditing = editingAssetId !== null;

      const response = await fetch(
        isEditing
          ? `${API_URL}/api/v1/assets/${editingAssetId}`
          : `${API_URL}/api/v1/assets`,
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            type,
            target,
            description: description || null,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to save asset");
      }

      const savedAsset: Asset = await response.json();

      if (isEditing) {
        setAssets((currentAssets) =>
          currentAssets.map((asset) =>
            asset.id === savedAsset.id ? savedAsset : asset,
          ),
        );
      } else {
        setAssets((currentAssets) => [savedAsset, ...currentAssets]);
      }

      resetForm();
    } catch {
      setFormError(
        editingAssetId !== null
          ? "Unable to update asset."
          : "Unable to create asset.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(asset: Asset) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${asset.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingAssetId(asset.id);
    setError(null);

    try {
      const response = await fetch(
        `${API_URL}/api/v1/assets/${asset.id}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete asset");
      }

      setAssets((currentAssets) =>
        currentAssets.filter(
          (currentAsset) => currentAsset.id !== asset.id,
        ),
      );

      if (editingAssetId === asset.id) {
        resetForm();
      }
    } catch {
      setError("Unable to delete asset.");
    } finally {
      setDeletingAssetId(null);
    }
  }

  return (
    <AppShell>
      <PageContainer>
        <PageHeader
          title="Assets"
          description="Manage and monitor your security assets."
        />

        <Card glow="blue">
          <CardHeader className="border-b border-border/60">
            <CardTitle>
              {editingAssetId !== null ? "Edit Asset" : "Add Asset"}
            </CardTitle>

            <CardDescription>
              {editingAssetId !== null
                ? "Update the selected security asset."
                : "Add a new asset to your Ceron security inventory."}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form
              onSubmit={handleSubmit}
              className="grid gap-6 sm:grid-cols-2"
            >
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="text-sm font-medium"
                >
                  Name
                </label>

                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setName(event.target.value)
                  }
                  placeholder="Production API"
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="type"
                  className="text-sm font-medium"
                >
                  Type
                </label>

                <Input
                  id="type"
                  type="text"
                  value={type}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setType(event.target.value)
                  }
                  placeholder="api"
                  required
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label
                  htmlFor="target"
                  className="text-sm font-medium"
                >
                  Target
                </label>

                <Input
                  id="target"
                  type="text"
                  value={target}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setTarget(event.target.value)
                  }
                  placeholder="https://api.example.com"
                  required
                />

                <p className="text-xs text-muted-foreground">
                  The URL, hostname, service, or other target associated
                  with this asset.
                </p>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label
                  htmlFor="description"
                  className="text-sm font-medium"
                >
                  Description
                </label>

                <textarea
                  id="description"
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="Production API endpoint"
                  rows={4}
                  className="w-full resize-none rounded-lg border border-input bg-background/60 px-3 py-2.5 text-sm outline-none transition-[border-color,box-shadow,background-color] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:bg-background focus-visible:ring-3 focus-visible:ring-ring/50"
                />

                <p className="text-xs text-muted-foreground">
                  Add useful context about the asset for security analysis
                  and monitoring.
                </p>
              </div>

              {formError && (
                <p className="sm:col-span-2 text-sm text-destructive">
                  {formError}
                </p>
              )}

              <div className="flex flex-wrap gap-2 sm:col-span-2">
                <Button
                  type="submit"
                  disabled={saving}
                >
                  {saving
                    ? editingAssetId !== null
                      ? "Updating..."
                      : "Creating..."
                    : editingAssetId !== null
                      ? "Update Asset"
                      : "Create Asset"}
                </Button>

                {editingAssetId !== null && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {loading && (
          <p className="mt-8 text-sm text-muted-foreground">
            Loading assets...
          </p>
        )}

        {error && (
          <p className="mt-8 text-sm text-destructive">
            {error}
          </p>
        )}

        {!loading && !error && assets.length === 0 && (
          <p className="mt-8 text-sm text-muted-foreground">
            No assets found.
          </p>
        )}

        {!loading && !error && assets.length > 0 && (
          <div className="mt-8 overflow-x-auto rounded-xl border border-border/70 bg-card/80 shadow-sm backdrop-blur-xl dark:bg-card/70">
            <div className="min-w-[900px]">
              <div className="grid grid-cols-[2fr_1fr_2fr_2fr_auto_auto] items-center gap-4 border-b border-border/70 bg-muted/40 px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <span>Name</span>
                <span>Type</span>
                <span>Target</span>
                <span>Description</span>
                <span>Edit</span>
                <span>Delete</span>
              </div>

              {assets.map((asset) => (
                <div
                  key={asset.id}
                  className="group grid grid-cols-[2fr_1fr_2fr_2fr_auto_auto] items-center gap-4 border-b border-border/60 px-4 py-4 text-sm transition-colors duration-200 last:border-b-0 hover:bg-primary/[0.04] dark:hover:bg-primary/[0.06]"
                >
                  <span className="min-w-0 truncate font-medium">
                    {asset.name}
                  </span>

                  <span className="font-mono text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {asset.type}
                  </span>

                  <span
                    className="min-w-0 truncate font-mono text-xs text-muted-foreground"
                    title={asset.target}
                  >
                    {asset.target}
                  </span>

                  <span
                    className="min-w-0 truncate text-muted-foreground"
                    title={asset.description || undefined}
                  >
                    {asset.description || "—"}
                  </span>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => startEditing(asset)}
                    disabled={deletingAssetId === asset.id}
                  >
                    Edit
                  </Button>

                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(asset)}
                    disabled={deletingAssetId === asset.id}
                  >
                    {deletingAssetId === asset.id
                      ? "Deleting..."
                      : "Delete"}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </PageContainer>
    </AppShell>
  );
}