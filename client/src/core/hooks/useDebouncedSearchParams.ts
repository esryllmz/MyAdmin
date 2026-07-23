import { useCallback, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDebouncedCallback } from "use-debounce";

interface DebouncedSearchParamOptions {
  delay?: number;
  resetKeys?: string[];
}

/**
 * Bir arama/metin girdisini debounce ile URL searchParams'a senkronize eder.
 * Input her keystroke'ta anında güncellenir, URL (ve dolayısıyla filtreleme) `delay` ms sonra güncellenir.
 * `resetKeys` verilirse (örn. "page"), değer değiştiğinde bu parametreler URL'den silinir.
 */
export const useDebouncedSearchParam = (
  key: string,
  { delay = 300, resetKeys = [] }: DebouncedSearchParamOptions = {}
) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlValue = searchParams.get(key) ?? "";
  const [value, setValue] = useState(urlValue);

  // URL dışarıdan değişirse (geri/ileri gezinme) local state'i render sırasında senkronize et.
  // useEffect yerine bu pattern tercih edildi: ekstra bir render turu yaratmıyor.
  const [syncedUrlValue, setSyncedUrlValue] = useState(urlValue);
  if (urlValue !== syncedUrlValue) {
    setSyncedUrlValue(urlValue);
    setValue(urlValue);
  }

  const commit = useDebouncedCallback((next: string) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      if (next) {
        params.set(key, next);
      } else {
        params.delete(key);
      }
      resetKeys.forEach((resetKey) => params.delete(resetKey));
      return params;
    });
  }, delay);

  const setDebouncedValue = useCallback(
    (next: string) => {
      setValue(next);
      commit(next);
    },
    [commit]
  );

  return [value, setDebouncedValue] as const;
};

/**
 * Sayfalama/filtre gibi anında (debounce'suz) senkronize edilmesi gereken searchParams değerleri için.
 */
export const useSearchParamState = (key: string, defaultValue: string) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const value = searchParams.get(key) ?? defaultValue;

  const setValue = useCallback(
    (next: string) => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        if (next && next !== defaultValue) {
          params.set(key, next);
        } else {
          params.delete(key);
        }
        return params;
      });
    },
    [key, defaultValue, setSearchParams]
  );

  return [value, setValue] as const;
};
