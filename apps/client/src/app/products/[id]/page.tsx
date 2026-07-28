import ProductInteraction from "@/components/ProductInteraction";
import { ProductType } from "@repo/types";
import Image from "next/image";
import ImageSlider from "@/components/ImageSlider";


import { notFound } from "next/navigation";

/**
 * Fetches product details from the backend service.
 * 
 * @param id - The product ID to fetch.
 * @returns The ProductType object or null if not found/error.
 * 
 * NOTE: We use cache: 'no-store' to ensure we always get the latest data 
 * from the backend, especially important for "Admin added values".
 */
const fetchProduct = async (id: string) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL}/products/${id}`,
      { cache: 'no-store' }
    );



    // If the server returns 404 or 500, we explicitly return null
    // so we can handle it gracefully in the UI (show notFound() page).
    if (!res.ok) return null;
    const data: ProductType = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
};

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  try {
    const { id } = await params;

    const product = await fetchProduct(id);

    // Check if product exists. If not, return fallback metadata.
    // This prevents the "Cannot read properties of null" crash.
    if (!product) {
      return {
        title: "Product Not Found",
        description: "The requested product could not be found."
      }
    }

    // Safely extract image
    let imageUrl = "/placeholder.png";
    if (Array.isArray(product.images) && product.images.length > 0) {
      imageUrl = product.images[0] as string;
    } else if (product.images && typeof product.images === 'object') {
      const values = Object.values(product.images);
      if (values.length > 0) {
        const val = values[0];
        if (Array.isArray(val)) imageUrl = val[0] as string;
        else if (typeof val === 'string') imageUrl = val;
      }
    }

    return {
      title: product.name,
      description: product.description,
      openGraph: {
        title: product.name,
        description: product.description,
        images: [imageUrl],
      },
      twitter: {
        card: "summary_large_image",
        title: product.name,
        description: product.description,
        images: [imageUrl],
      },
    };
  } catch (error) {
    console.error("Failed to generate metadata:", error);
    return {
      title: "Product Details",
      description: "View product details on Xiaomi Wearable Store.",
    };
  }
};

const ProductPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ color: string; size: string }>;
}) => {
  const { size, color } = await searchParams;
  const { id } = await params;

  const product = await fetchProduct(id);

  if (!product) {
    return notFound();
  }

  const selectedSize = size || (product.sizes?.[0] as string) || "";
  const selectedColor = color || (product.colors?.[0] as string) || "";

  // Robust image extraction for slider
  let currentImages: string[] = [];
  if (product.images) {
    let tempImages: string | string[] | undefined;
    if (Array.isArray(product.images)) {
      tempImages = product.images as string[];
    } else {
      tempImages = (product.images as Record<string, string | string[]>)?.[selectedColor];
    }

    if (tempImages) {
      if (Array.isArray(tempImages)) {
        currentImages = tempImages;
      } else {
        currentImages = [tempImages];
      }
    } else if (product.images && !Array.isArray(product.images)) {
      // Fallback to any images if selectedColor didn't yield results
      const map = product.images as Record<string, string | string[]>;
      const firstVal = Object.values(map)[0];
      if (firstVal) {
        if (Array.isArray(firstVal)) currentImages = firstVal as string[];
        else if (typeof firstVal === 'string') currentImages = [firstVal];
      }
    }
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row md:gap-12 mt-12">
      {/* IMAGE */}
      <div className="w-full lg:w-5/12 relative aspect-[2/3]">
        <ImageSlider images={currentImages!} />
      </div>
      {/* DETAILS */}
      <div className="w-full lg:w-7/12 flex flex-col gap-4">
        <ProductInteraction
          product={product}
          selectedSize={selectedSize}
          selectedColor={selectedColor}
        />
        {/* CARD INFO */}
        <div className="flex items-center gap-2 mt-4">
          <Image
            src="/klarna.png"
            alt="klarna"
            width={50}
            height={25}
            className="rounded-md"
          />
          <Image
            src="/cards.png"
            alt="cards"
            width={50}
            height={25}
            className="rounded-md"
          />
          <Image
            src="/stripe.png"
            alt="stripe"
            width={50}
            height={25}
            className="rounded-md"
          />
        </div>
        <p className="text-gray-500 text-xs">
          By clicking Pay Now, you agree to our{" "}
          <span className="underline hover:text-black">Terms & Conditions</span>{" "}
          and <span className="underline hover:text-black">Privacy Policy</span>
          . You authorize us to charge your selected payment method for the
          total amount shown. All sales are subject to our return and{" "}
          <span className="underline hover:text-black">Refund Policies</span>.
        </p>
      </div>
    </div>
  );
};

export default ProductPage;
