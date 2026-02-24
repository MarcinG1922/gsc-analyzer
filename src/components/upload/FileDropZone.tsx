'use client';

import { useState, useCallback, useRef } from 'react';
import { parseGscZip, parseGscCsvFiles } from '@/lib/parser/parse-gsc';
import { useGscDispatch } from '@/store/gsc-store';
import { detectBrandTerms } from '@/lib/analysis/brand-detection';
import { useRouter } from 'next/navigation';

export function FileDropZone() {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const dispatch = useGscDispatch();
  const router = useRouter();

  const processFiles = useCallback(async (files: File[]) => {
    setLoading(true);
    setError(null);
    try {
      const zipFile = files.find(f => f.name.toLowerCase().endsWith('.zip'));
      const csvFiles = files.filter(f => f.name.toLowerCase().endsWith('.csv'));

      let data;
      if (zipFile) {
        data = await parseGscZip(zipFile);
      } else if (csvFiles.length > 0) {
        data = await parseGscCsvFiles(csvFiles);
      } else {
        throw new Error('Wgraj plik ZIP lub pliki CSV z Google Search Console');
      }

      if (data.queries.length === 0) {
        throw new Error('Nie znaleziono danych zapytań w przesłanych plikach. Upewnij się, że CSV zawiera dane zapytań.');
      }

      dispatch({ type: 'SET_RAW_DATA', payload: data });

      const detection = detectBrandTerms(data.queries);
      dispatch({ type: 'SET_BRAND_DETECTION', payload: detection });

      router.push('/analyze');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udało się przetworzyć plików');
    } finally {
      setLoading(false);
    }
  }, [dispatch, router]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length) processFiles(files);
  }, [processFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length) processFiles(files);
  }, [processFiles]);

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => fileRef.current?.click()}
      className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all ${
        dragging
          ? 'border-[var(--accent)] bg-[var(--accent)]/5 scale-[1.02]'
          : 'border-[var(--border-color)] hover:border-[var(--accent)]/50 hover:bg-[var(--surface)]'
      }`}
    >
      <input
        ref={fileRef}
        type="file"
        accept=".zip,.csv"
        multiple
        onChange={handleFileInput}
        className="hidden"
      />

      {loading ? (
        <div className="space-y-3">
          <div className="mx-auto w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          <p className="text-[var(--text-secondary)]">Przetwarzanie danych GSC...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-[var(--surface-elevated)] flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-medium text-[var(--foreground)]">
              Upuść eksport z GSC tutaj
            </p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Plik ZIP lub pliki CSV z Google Search Console
            </p>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-4 text-sm text-[var(--danger)]">{error}</p>
      )}
    </div>
  );
}
