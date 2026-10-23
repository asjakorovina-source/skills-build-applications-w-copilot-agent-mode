import { useEffect, useState, type ReactNode } from 'react';
import { getJson } from '../api/client.js';

type Props<T> = {
  title: string;
  description: string;
  resourcePath: string;
  itemsKey: string;
  emptyText: string;
  renderItem: (item: T) => ReactNode;
};

export function CapabilityCard<T>({ title, description, resourcePath, itemsKey, emptyText, renderItem }: Props<T>) {
  const [items, setItems] = useState<T[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setItems(null);
    setError(null);
    getJson<Record<string, unknown>>(resourcePath)
      .then((payload) => {
        const result = payload[itemsKey];
        if (!Array.isArray(result)) throw new Error('The server returned an invalid response');
        if (active) setItems(result as T[]);
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Request failed');
      });
    return () => { active = false; };
  }, [itemsKey, resourcePath]);

  return <section className="card h-100"><div className="card-body">
    <h2 className="h4">{title}</h2>
    <p>{description}</p>
    {items === null && error === null && <p role="status">Loading {title.toLowerCase()}...</p>}
    {error !== null && <p role="alert">Unable to load {title.toLowerCase()}: {error}</p>}
    {items?.length === 0 && <p role="status">{emptyText}</p>}
    {items && items.length > 0 && <ul className="list-group list-group-flush">
      {items.map((item, index) => <li className="list-group-item px-0" key={index}>{renderItem(item)}</li>)}
    </ul>}
  </div></section>;
}
