// app/salesroom-avatar/RightPanelProduct.tsx
type RightPanelProductProps = {
  title: string;
  subtitle?: string;
  price?: number;
  oldPrice?: number;
  currency?: string;
  bullets?: string[];
  ctaText?: string;
};

export function RightPanelProduct({
  title,
  subtitle,
  price,
  oldPrice,
  currency = "CAD",
  bullets = [],
  ctaText = "Textez VENDU pour réserver maintenant.",
}: RightPanelProductProps) {
  const hasDiscount =
    typeof price === "number" &&
    typeof oldPrice === "number" &&
    oldPrice > price;

  return (
    <aside className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {subtitle && (
          <p className="text-sm text-gray-600 mt-1">
            {subtitle}
          </p>
        )}
      </div>

      {(price || oldPrice) && (
        <div className="space-y-1">
          {hasDiscount && (
            <div className="text-sm text-gray-500 line-through">
              {oldPrice?.toFixed(2)} {currency}
            </div>
          )}
          {typeof price === "number" && (
            <div className="text-xl font-bold text-green-700">
              {price.toFixed(2)} {currency}
            </div>
          )}
          {hasDiscount && (
            <div className="text-xs text-green-700">
              Vous économisez {(oldPrice! - price!).toFixed(2)} {currency}
            </div>
          )}
        </div>
      )}

      {bullets.length > 0 && (
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
          {bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      )}

      <div className="mt-2 rounded bg-blue-50 px-3 py-2 text-sm text-blue-900">
        {ctaText}
      </div>
    </aside>
  );
}
