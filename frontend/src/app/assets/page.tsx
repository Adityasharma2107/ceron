"use client";

import { FormEvent, useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";

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
        currentAssets.filter((currentAsset) => currentAsset.id !== asset.id),
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
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold tracking-tight">Assets</h1>

        <p className="mt-2 text-muted-foreground">
          Manage and monitor your security assets.
        </p>

        <div className="mt-8 rounded-lg border p-6">
          <h2 className="text-lg font-semibold">
            {editingAssetId !== null ? "Edit Asset" : "Add Asset"}
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {editingAssetId !== null
              ? "Update the selected security asset."
              : "Add a new asset to your Ceron security inventory."}
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-6 grid gap-4 sm:grid-cols-2"
          >
            <div>
              <label
                htmlFor="name"
                className="text-sm font-medium"
              >
                Name
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Production API"
                required
                className="mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label
                htmlFor="type"
                className="text-sm font-medium"
              >
                Type
              </label>

              <input
                id="type"
                type="text"
                value={type}
                onChange={(event) => setType(event.target.value)}
                placeholder="api"
                required
                className="mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="target"
                className="text-sm font-medium"
              >
                Target
              </label>

              <input
                id="target"
                type="text"
                value={target}
                onChange={(event) => setTarget(event.target.value)}
                placeholder="https://api.example.com"
                required
                className="mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="description"
                className="text-sm font-medium"
              >
                Description
              </label>

              <textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Production API endpoint"
                rows={3}
                className="mt-2 w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {formError && (
              <p className="sm:col-span-2 text-sm text-destructive">
                {formError}
              </p>
            )}

            <div className="flex gap-2 sm:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? editingAssetId !== null
                    ? "Updating..."
                    : "Creating..."
                  : editingAssetId !== null
                    ? "Update Asset"
                    : "Create Asset"}
              </button>

              {editingAssetId !== null && (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="rounded-md border px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

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
          <div className="mt-8 overflow-hidden rounded-lg border">
            <div className="grid grid-cols-6 border-b bg-muted/50 px-4 py-3 text-sm font-medium">
              <span>Name</span>
              <span>Type</span>
              <span>Target</span>
              <span>Description</span>
              <span>Actions</span>
              <span />
            </div>

            {assets.map((asset) => (
              <div
                key={asset.id}
                className="grid grid-cols-6 items-center border-b px-4 py-4 text-sm last:border-b-0"
              >
                <span className="font-medium">{asset.name}</span>

                <span>{asset.type}</span>

                <span className="truncate">{asset.target}</span>

                <span className="text-muted-foreground">
                  {asset.description || "—"}
                </span>

                <button
                  type="button"
                  onClick={() => startEditing(asset)}
                  disabled={deletingAssetId === asset.id}
                  className="w-fit rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(asset)}
                  disabled={deletingAssetId === asset.id}
                  className="w-fit rounded-md border px-3 py-1.5 text-sm font-medium text-destructive hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deletingAssetId === asset.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}