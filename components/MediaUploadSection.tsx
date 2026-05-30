'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, Loader2, ImageIcon, FileIcon } from 'lucide-react';
import { getSupabase } from '@/app/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';

type UploadedAsset = {
  name: string;
  url: string;
  timestamp: number;
};

const STORAGE_BUCKET = 'Photos';

function isImageFile(name: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp|svg|bmp|avif|heic)$/i.test(name);
}

export default function MediaUploadSection() {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [assets, setAssets] = useState<UploadedAsset[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const uploadFile = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.slice(file.name.lastIndexOf('.'));
      const uniqueName = `uploads/${crypto.randomUUID()}${ext}`;

      const { error: uploadError } = await getSupabase().storage
        .from(STORAGE_BUCKET)
        .upload(uniqueName, file, {
          contentType: file.type || 'image/jpeg',
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = getSupabase().storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(uniqueName);

      const newAsset: UploadedAsset = {
        name: file.name,
        url: urlData.publicUrl,
        timestamp: Date.now(),
      };

      setAssets((prev) => [newAsset, ...prev]);
    } catch (err) {
      console.error('[MediaUpload] Upload failed:', err);
    } finally {
      setUploading(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
      const files = Array.from(e.dataTransfer.files);
      files.forEach((f) => uploadFile(f));
    },
    [uploadFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      files.forEach((f) => uploadFile(f));
      e.target.value = '';
    },
    [uploadFile],
  );

  return (
    <>
      <section className="mb-12">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-[8px] p-12 text-center flex flex-col items-center justify-center cursor-pointer transition-colors duration-300 ${
            dragOver
              ? 'border-[#ffc107] bg-[#ffc107]/[0.08]'
              : 'border-gray-300 dark:border-[#3a3939] bg-gray-50 dark:bg-[#131313] hover:border-[#ffc107] hover:bg-[#ffc107]/5 dark:hover:bg-[#ffc107]/[0.05]'
          }`}
        >
          {uploading ? (
            <>
              <Loader2 className="mb-4 w-10 h-10 text-[#ffc107] animate-spin" strokeWidth={1.5} />
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                Uploading...
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 italic">
                {t('media.dropzone.subtitle')}
              </p>
            </>
          ) : (
            <>
              <Upload className="mb-4 w-10 h-10 text-[#ffc107]" strokeWidth={1.5} />
              <p
                className="text-lg font-semibold text-gray-900 dark:text-white"
                data-i18n="media.dropzone.title"
              >
                {t('media.dropzone.title')}
              </p>
              <p
                className="text-sm text-gray-500 dark:text-gray-400 mt-1 italic"
                data-i18n="media.dropzone.subtitle"
              >
                {t('media.dropzone.subtitle')}
              </p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.dwg,.dxf,.step,.stp"
            className="hidden"
            onChange={handleInputChange}
          />
        </div>
      </section>

      <section className="mb-8">
        <div className="flex justify-between items-end mb-6">
          <h2
            className="text-[11px] font-bold tracking-widest uppercase text-amber-600 dark:text-[#ffc107]"
            data-i18n="media.recent.title"
          >
            {t('media.recent.title')}
          </h2>
          {assets.length > 0 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {assets.length} {assets.length === 1 ? 'file' : 'files'}
            </span>
          )}
        </div>

        {assets.length === 0 ? (
          <div className="grid grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="relative aspect-square bg-gray-50 dark:bg-[#1c1b1b] rounded-[8px] overflow-hidden border border-gray-200 dark:border-[#3a3939] flex items-center justify-center"
              >
                <div className="text-gray-400 dark:text-zinc-600 flex flex-col items-center gap-2">
                  <ImageIcon className="w-6 h-6" strokeWidth={1} />
                  <span className="text-[10px] font-medium">No asset</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {assets.map((asset) => (
              <div
                key={`${asset.name}-${asset.timestamp}`}
                className="relative aspect-square bg-gray-50 dark:bg-[#1c1b1b] rounded-[8px] overflow-hidden border border-gray-200 dark:border-[#3a3939] group"
              >
                {isImageFile(asset.name) ? (
                  <img
                    alt={asset.name}
                    src={asset.url}
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileIcon className="w-10 h-10 text-zinc-500" strokeWidth={1} />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gray-900/70 dark:bg-[#0e0e0e]/70 p-2 flex justify-between items-end backdrop-blur-sm">
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-bold text-[#ffc107] truncate">
                      {asset.name}
                    </span>
                    <span className="text-[8px] text-gray-300 dark:text-gray-400">
                      just now
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
