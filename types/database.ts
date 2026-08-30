export type OrderStatus =
  | "pending"
  | "paid"
  | "failed"
  | "expired"
  | "refunded"
  | "partially_refunded";

export type EntitlementStatus = "active" | "revoked" | "refunded";

export type CatalogCollectionRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  sort_order: number;
  created_at: string;
};

export type CatalogVolumeRow = {
  id: string;
  collection_id: string;
  slug: string;
  name: string;
  description: string;
  sort_order: number;
  created_at: string;
};

export type CatalogProductRow = {
  id: string;
  collection_id: string;
  volume_id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  price_cents: number;
  currency: string;
  image_url: string;
  thumbnail_url: string;
  edition: string;
  resolution: string;
  file_type: string;
  status: string;
  is_featured: boolean;
  stripe_price_id: string | null;
  stripe_product_id: string | null;
  sort_order: number;
  download_storage_path: string | null;
  download_filename: string | null;
  download_mime_type: string | null;
  download_size_bytes: number | null;
  download_version: string | null;
  created_at: string;
};

export type DownloadEventRow = {
  id: string;
  user_id: string;
  product_id: string | null;
  entitlement_id: string | null;
  created_at: string;
  outcome: string;
  ip_hash: string | null;
  user_agent: string | null;
};

export type DownloadEventInsert = {
  user_id: string;
  product_id?: string | null;
  entitlement_id?: string | null;
  outcome: string;
  ip_hash?: string | null;
  user_agent?: string | null;
};

export type StripeEventRow = {
  id: string;
  event_type: string;
  livemode: boolean;
  stripe_created_at: string | null;
  processed_at: string;
  payload: Record<string, unknown> | null;
  processing_error: string | null;
};

export type StripeEventInsert = {
  id: string;
  event_type: string;
  livemode?: boolean;
  stripe_created_at?: string | null;
  payload?: Record<string, unknown> | null;
  processing_error?: string | null;
};

export type OrderRow = {
  id: string;
  user_id: string | null;
  stripe_checkout_session_id: string;
  stripe_payment_intent_id: string | null;
  stripe_customer_id: string | null;
  customer_email: string | null;
  status: OrderStatus;
  currency: string;
  amount_subtotal: number;
  amount_total: number;
  amount_discount: number;
  amount_tax: number;
  payment_status: string | null;
  purchase_type: string;
  livemode: boolean;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderInsert = {
  stripe_checkout_session_id: string;
  stripe_payment_intent_id?: string | null;
  stripe_customer_id?: string | null;
  customer_email?: string | null;
  status?: OrderStatus;
  currency: string;
  amount_subtotal?: number;
  amount_total?: number;
  amount_discount?: number;
  amount_tax?: number;
  payment_status?: string | null;
  purchase_type?: string;
  livemode?: boolean;
  paid_at?: string | null;
  user_id?: string | null;
};

export type OrderUpdate = Partial<
  Pick<
    OrderRow,
    | "status"
    | "payment_status"
    | "customer_email"
    | "stripe_payment_intent_id"
    | "stripe_customer_id"
    | "amount_subtotal"
    | "amount_total"
    | "amount_discount"
    | "amount_tax"
    | "paid_at"
    | "updated_at"
  >
>;

export type OrderItemRow = {
  id: string;
  order_id: string;
  product_slug: string;
  product_title: string;
  product_edition: string | null;
  collection: string | null;
  stripe_price_id: string | null;
  product_id: string | null;
  quantity: number;
  unit_amount: number;
  currency: string;
  created_at: string;
};

export type OrderItemInsert = {
  order_id: string;
  product_slug: string;
  product_title: string;
  product_edition?: string | null;
  collection?: string | null;
  stripe_price_id?: string | null;
  quantity?: number;
  unit_amount?: number;
  currency: string;
};

export type EntitlementRow = {
  id: string;
  user_id: string | null;
  customer_email: string | null;
  order_id: string;
  order_item_id: string;
  product_slug: string;
  product_id: string | null;
  status: EntitlementStatus;
  granted_at: string;
  revoked_at: string | null;
  created_at: string;
  updated_at: string;
};

export type EntitlementInsert = {
  user_id?: string | null;
  customer_email?: string | null;
  order_id: string;
  order_item_id: string;
  product_slug: string;
  status?: EntitlementStatus;
};

export type EntitlementUpdate = Partial<
  Pick<
    EntitlementRow,
    "status" | "revoked_at" | "customer_email" | "user_id" | "updated_at"
  >
>;

export type FulfillmentResult = {
  processed: boolean;
  already_processed: boolean;
  order_id: string | null;
  entitlement_id: string | null;
};

export type CheckoutStatusResult = {
  processed: boolean;
  already_processed: boolean;
  order_id: string | null;
};

export type OrderSummary = {
  status: OrderStatus;
  persisted: boolean;
  productSlug: string | null;
  productTitle: string | null;
  productEdition: string | null;
  currency: string | null;
  amountTotal: number | null;
};

export type Database = {
  public: {
    Tables: {
      collections: {
        Row: CatalogCollectionRow;
        Insert: Partial<CatalogCollectionRow>;
        Update: Partial<CatalogCollectionRow>;
        Relationships: [];
      };
      volumes: {
        Row: CatalogVolumeRow;
        Insert: Partial<CatalogVolumeRow>;
        Update: Partial<CatalogVolumeRow>;
        Relationships: [];
      };
      products: {
        Row: CatalogProductRow;
        Insert: Partial<CatalogProductRow>;
        Update: Partial<CatalogProductRow>;
        Relationships: [];
      };
      stripe_events: {
        Row: StripeEventRow;
        Insert: StripeEventInsert;
        Update: Partial<StripeEventInsert>;
        Relationships: [];
      };
      orders: {
        Row: OrderRow;
        Insert: OrderInsert;
        Update: OrderUpdate;
        Relationships: [];
      };
      order_items: {
        Row: OrderItemRow;
        Insert: OrderItemInsert;
        Update: Partial<OrderItemInsert>;
        Relationships: [];
      };
      entitlements: {
        Row: EntitlementRow;
        Insert: EntitlementInsert;
        Update: EntitlementUpdate;
        Relationships: [];
      };
      download_events: {
        Row: DownloadEventRow;
        Insert: DownloadEventInsert;
        Update: Partial<DownloadEventInsert>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      fulfill_stripe_checkout: {
        Args: {
          p_stripe_event_id: string;
          p_event_type: string;
          p_livemode: boolean;
          p_stripe_created_at: string | null;
          p_sanitized_event_payload: Record<string, unknown> | null;
          p_stripe_checkout_session_id: string;
          p_stripe_payment_intent_id: string | null;
          p_stripe_customer_id: string | null;
          p_customer_email: string | null;
          p_currency: string;
          p_amount_subtotal: number;
          p_amount_total: number;
          p_amount_discount: number;
          p_amount_tax: number;
          p_payment_status: string | null;
          p_paid_at: string | null;
          p_purchase_type: string;
          p_product_slug: string;
          p_product_title: string;
          p_product_edition: string | null;
          p_collection_name: string | null;
          p_stripe_price_id: string | null;
          p_quantity: number;
          p_unit_amount: number;
          p_user_id?: string | null;
          p_product_id?: string | null;
        };
        Returns: FulfillmentResult[];
      };
      record_stripe_checkout_status: {
        Args: {
          p_stripe_event_id: string;
          p_event_type: string;
          p_livemode: boolean;
          p_stripe_created_at: string | null;
          p_sanitized_event_payload: Record<string, unknown> | null;
          p_stripe_checkout_session_id: string;
          p_stripe_payment_intent_id: string | null;
          p_stripe_customer_id: string | null;
          p_customer_email: string | null;
          p_currency: string;
          p_amount_subtotal: number;
          p_amount_total: number;
          p_amount_discount: number;
          p_amount_tax: number;
          p_payment_status: string | null;
          p_purchase_type: string;
          p_order_status: OrderStatus;
          p_product_slug: string;
          p_product_title: string;
          p_product_edition: string | null;
          p_collection_name: string | null;
          p_stripe_price_id: string | null;
          p_quantity: number;
          p_unit_amount: number;
        };
        Returns: CheckoutStatusResult[];
      };
      link_customer_purchases_to_user: {
        Args: {
          p_user_id: string;
          p_customer_email: string;
        };
        Returns: {
          orders_linked: number;
          entitlements_linked: number;
        }[];
      };
    };
    Enums: {
      order_status: OrderStatus;
      entitlement_status: EntitlementStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
