"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { ALLOWED_EXTENSIONS } from "@/lib/s3";
import { formatCurrency, formatFileSize } from "@/lib/utils";

const MATERIALS = [
  { value: "PLA", label: "PLA", desc: "Best for most prints, affordable", price: "₹3.5/cm³" },
  { value: "ABS", label: "ABS", desc: "Strong, heat-resistant", price: "₹4/cm³" },
  { value: "PETG", label: "PETG", desc: "Flexible & tough", price: "₹4.5/cm³" },
  { value: "RESIN", label: "Resin", desc: "Ultra-high detail", price: "₹8/cm³" },
  { value: "SLS_NYLON", label: "SLS Nylon", desc: "Industrial grade", price: "₹12/cm³" },
  { value: "MJF_NYLON", label: "MJF Nylon", desc: "Pro finish, durable", price: "₹14/cm³" },
];

const FINISHES = [
  { value: "RAW", label: "Raw", desc: "As-printed, no post-process" },
  { value: "SANDED", label: "Sanded", desc: "Smooth surface (+30%)" },
  { value: "PAINTED", label: "Painted", desc: "Custom colour (+70%)" },
  { value: "POLISHED", label: "Polished", desc: "Mirror-smooth (+50%)" },
];

const COLOURS = ["White", "Black", "Gray", "Red", "Blue", "Green", "Yellow", "Orange", "Custom"];

export default function NewOrderPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [config, setConfig] = useState({
    material: "PLA",
    finish: "RAW",
    colour: "White",
    infillPercent: 20,
    quantity: 1,
    notes: "",
  });
  const [estimate, setEstimate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) {
      setFile(accepted[0]);
      // Rough estimate based on file size as proxy for volume
      // In production: parse STL volume with Three.js
      const approxVolumeCm3 = accepted[0].size / 50000;
      updateEstimate(approxVolumeCm3, config.material, config.finish, config.infillPercent, config.quantity);
    }
  }, [config]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/octet-stream": ALLOWED_EXTENSIONS },
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024,
  });

  const updateEstimate = (vol: number, mat: string, fin: string, infill: number, qty: number) => {
    const RATE: Record<string, number> = { PLA: 3.5, ABS: 4, PETG: 4.5, RESIN: 8, SLS_NYLON: 12, MJF_NYLON: 14 };
    const MULT: Record<string, number> = { RAW: 1, SANDED: 1.3, PAINTED: 1.7, POLISHED: 1.5 };
    const infillSurcharge = 1 + (Math.max(0, infill - 20) / 10) * 0.05;
    const perUnit = vol * (RATE[mat] ?? 3.5) * (MULT[fin] ?? 1) * infillSurcharge + 50;
    setEstimate(Math.max(Math.round(perUnit * qty), 200));
  };

  const handleConfigChange = (key: string, value: string | number) => {
    const next = { ...config, [key]: value };
    setConfig(next);
    if (file) {
      const approxVol = file.size / 50000;
      updateEstimate(approxVol, next.material, next.finish, next.infillPercent, next.quantity);
    }
  };

  const handleSubmit = async () => {
    if (!file) return setError("Please upload a 3D file");
    setLoading(true);
    setError("");

    try {
      const approxVolumeCm3 = file.size / 50000;
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...config, volumeCm3: approxVolumeCm3 }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Upload file via presigned URL
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: data.order.id,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type || "application/octet-stream",
          version: 1,
        }),
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error);

      // PUT file to S3
      await fetch(uploadData.uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type || "application/octet-stream" },
      });

      router.push(`/dashboard/orders/${data.order.id}?submitted=1`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0e0e12] px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <a href="/dashboard" className="text-gray-500 hover:text-white text-sm">← Dashboard</a>
          <span className="text-gray-700">/</span>
          <span className="text-sm text-gray-300">New Order</span>
        </div>

        <h1 className="text-2xl font-bold mb-8">Place a New Order</h1>

        {/* File Upload */}
        <div className="bg-[#16161d] border border-[#2a2a38] rounded-2xl p-6 mb-6">
          <h2 className="font-semibold mb-4">1. Upload Your 3D File</h2>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors
              ${isDragActive ? "border-violet-500 bg-violet-500/10" : "border-[#2a2a38] hover:border-violet-500/50"}`}
          >
            <input {...getInputProps()} />
            {file ? (
              <div>
                <div className="text-3xl mb-2">✅</div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-gray-500 mt-1">{formatFileSize(file.size)} · Click to replace</p>
              </div>
            ) : (
              <div>
                <div className="text-3xl mb-3">📤</div>
                <p className="font-medium mb-1">Drag & drop your 3D file</p>
                <p className="text-sm text-gray-500">STL, OBJ, STEP, STP, 3MF · Max 100MB</p>
              </div>
            )}
          </div>
        </div>

        {/* Configurator */}
        <div className="bg-[#16161d] border border-[#2a2a38] rounded-2xl p-6 mb-6">
          <h2 className="font-semibold mb-5">2. Configure Your Print</h2>

          {/* Material */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-3">Material</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {MATERIALS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => handleConfigChange("material", m.value)}
                  className={`text-left p-3 rounded-xl border transition-colors
                    ${config.material === m.value
                      ? "border-violet-500 bg-violet-500/10"
                      : "border-[#2a2a38] hover:border-violet-500/40"}`}
                >
                  <div className="font-semibold text-sm">{m.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{m.desc}</div>
                  <div className="text-xs text-violet-400 mt-1">{m.price}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Finish */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-3">Finish</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {FINISHES.map((f) => (
                <button
                  key={f.value}
                  onClick={() => handleConfigChange("finish", f.value)}
                  className={`text-left p-3 rounded-xl border transition-colors
                    ${config.finish === f.value
                      ? "border-sky-500 bg-sky-500/10"
                      : "border-[#2a2a38] hover:border-sky-500/40"}`}
                >
                  <div className="font-semibold text-sm">{f.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{f.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Colour, Infill, Qty */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Colour</label>
              <select
                value={config.colour}
                onChange={(e) => handleConfigChange("colour", e.target.value)}
                className="w-full bg-[#1e1e28] border border-[#2a2a38] text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500"
              >
                {COLOURS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Infill %</label>
              <input
                type="number"
                min={10} max={100} step={5}
                value={config.infillPercent}
                onChange={(e) => handleConfigChange("infillPercent", Number(e.target.value))}
                className="w-full bg-[#1e1e28] border border-[#2a2a38] text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Quantity</label>
              <input
                type="number"
                min={1} max={500}
                value={config.quantity}
                onChange={(e) => handleConfigChange("quantity", Number(e.target.value))}
                className="w-full bg-[#1e1e28] border border-[#2a2a38] text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Notes (optional)</label>
            <textarea
              value={config.notes}
              onChange={(e) => setConfig({ ...config, notes: e.target.value })}
              placeholder="Any special requirements, tolerances, colour codes..."
              rows={3}
              className="w-full bg-[#1e1e28] border border-[#2a2a38] text-white rounded-xl px-4 py-2.5 text-sm placeholder:text-gray-600 focus:outline-none focus:border-violet-500 resize-none"
            />
          </div>
        </div>

        {/* Estimate + Submit */}
        <div className="bg-[#16161d] border border-[#2a2a38] rounded-2xl p-6">
          {estimate !== null && (
            <div className="mb-5 bg-violet-500/10 border border-violet-500/20 rounded-xl p-4">
              <div className="text-sm text-violet-300 font-medium mb-1">⚡ Instant Estimate</div>
              <div className="text-3xl font-bold text-white">{formatCurrency(estimate)}</div>
              <p className="text-xs text-gray-500 mt-2">
                This is an <strong className="text-yellow-400">estimate only</strong> — not the final price.
                Our team will review your file for printability and complexity, then confirm the final price before you pay.
              </p>
            </div>
          )}

          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-2.5 rounded-xl">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!file || loading}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting..." : "Submit Order for Review →"}
          </button>
          <p className="text-center text-xs text-gray-600 mt-3">
            You won&apos;t be charged until our team confirms your final price
          </p>
        </div>
      </div>
    </div>
  );
}
