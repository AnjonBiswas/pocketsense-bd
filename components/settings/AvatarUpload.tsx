"use client";

import { useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Camera, LoaderCircle } from "lucide-react";
import { getCroppedImageBlob } from "@/lib/utils/cropImage";
import { Button } from "@/components/ui/button";

type AvatarUploadProps = {
  avatarUrl: string | null;
  onUploaded: (avatarUrl: string) => void;
};

export function AvatarUpload({ avatarUrl, onUploaded }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setImageSrc(objectUrl);
    setError("");
  }

  async function handleUpload() {
    if (!imageSrc || !croppedAreaPixels) {
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels);
      const formData = new FormData();
      formData.append("avatar", new File([blob], "avatar.jpg", { type: "image/jpeg" }));

      const response = await fetch("/api/settings", {
        method: "POST",
        body: formData
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.avatar_url) {
        throw new Error(payload?.error || "Avatar upload failed.");
      }

      onUploaded(payload.avatar_url);
      setImageSrc(null);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Avatar upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="relative h-24 w-24 overflow-hidden rounded-[28px] border border-white/70 bg-secondary/60 shadow-sm"
          onClick={() => inputRef.current?.click()}
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="Profile avatar" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <Camera className="h-8 w-8" />
            </div>
          )}
        </button>
        <div>
          <p className="font-semibold text-slate-900 dark:text-slate-50">Profile photo</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload a square photo for your dashboard and squad avatar.
          </p>
          <Button type="button" variant="outline" className="mt-3 rounded-full" onClick={() => inputRef.current?.click()}>
            Choose photo
          </Button>
        </div>
      </div>

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      {imageSrc ? (
        <div className="space-y-4 rounded-[28px] border border-white/70 bg-white/90 p-4 dark:border-slate-700 dark:bg-slate-900">
          <div className="relative h-72 overflow-hidden rounded-[24px] bg-slate-950">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, croppedPixels) => setCroppedAreaPixels(croppedPixels)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Zoom</label>
            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
              className="w-full"
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <div className="flex flex-wrap gap-3">
            <Button type="button" className="rounded-full" disabled={isUploading} onClick={handleUpload}>
              {isUploading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isUploading ? "Uploading..." : "Crop & upload"}
            </Button>
            <Button type="button" variant="outline" className="rounded-full" onClick={() => setImageSrc(null)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
