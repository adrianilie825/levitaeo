"use client";

import BuyButton, {
  SignInToPurchaseLink,
  ViewInLibraryLink,
} from "@/components/BuyButton";

type EditionCardPurchaseProps = {
  productSlug: string;
  productPath: string;
  canPurchase: boolean;
  isAuthenticated: boolean;
  isOwned: boolean;
  isAvailable: boolean;
};

const compactButtonClassName =
  "inline-flex w-full items-center justify-center border border-[#111111] bg-[#111111] px-6 py-2.5 text-[10px] uppercase tracking-[0.16em] text-white transition-colors duration-300 hover:bg-transparent hover:text-[#111111] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111111] disabled:cursor-not-allowed disabled:border-neutral-300 disabled:bg-neutral-200 disabled:text-neutral-500 disabled:hover:bg-neutral-200 disabled:hover:text-neutral-500 motion-reduce:transition-none";

export default function EditionCardPurchase({
  productSlug,
  productPath,
  canPurchase,
  isAuthenticated,
  isOwned,
  isAvailable,
}: EditionCardPurchaseProps) {
  if (isOwned) {
    return <ViewInLibraryLink className={compactButtonClassName} />;
  }

  if (!isAvailable) {
    return (
      <p className="text-[11px] uppercase tracking-[0.14em] text-neutral-400">
        Coming Soon
      </p>
    );
  }

  if (!isAuthenticated) {
    return (
      <SignInToPurchaseLink
        loginReturnPath={productPath}
        className={compactButtonClassName}
      />
    );
  }

  if (canPurchase) {
    return (
      <BuyButton
        productSlug={productSlug}
        loginReturnPath={productPath}
        label="Acquire Edition"
        className={compactButtonClassName}
      />
    );
  }

  return (
    <p className="text-[11px] uppercase tracking-[0.14em] text-neutral-400">
      Unavailable
    </p>
  );
}
