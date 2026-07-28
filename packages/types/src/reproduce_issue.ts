
import { ProductFormSchema } from "./product";
import { z } from "zod";

const testSchema = () => {
    console.log("Testing ProductFormSchema...");

    const validData = {
        name: "Test Product",
        shortDescription: "Short desc",
        description: "Long description",
        price: 100,
        inventory: 10,
        categorySlug: "phones",
        variantType: "Size",
        variants: [
            {
                name: "Variant 1",
                price: 100,
                stock: 5,
                variantName: "Overridden Name",
                variantDescription: "Overridden Desc"
            }
        ],
        sizes: [],
        colors: ["black"],
        images: {
            "black": ["http://example.com/image.png"]
        }
    };

    try {
        ProductFormSchema.parse(validData);
        console.log("✅ Valid data passed");
    } catch (e) {
        if (e instanceof z.ZodError) {
            console.error("❌ Valid data failed:", JSON.stringify(e.format(), null, 2));
        } else {
            console.error("❌ Valid data failed with unknown error", e);
        }
    }

    // Test with variants that might be problematic
    const problematicVariants = {
        ...validData,
        variants: [
            {
                name: "", // Invalid if empty string is not allowed? Schema says z.string() which allows empty
                price: 0,
                stock: 0
            }
        ]
    };

    try {
        ProductFormSchema.parse(problematicVariants);
        console.log("✅ Empty name variant passed (unexpected?)");
    } catch (e) {
         if (e instanceof z.ZodError) {
             console.log("ℹ️ Empty name variant failed (expected?)");
             console.error(JSON.stringify(e.format(), null, 2));
        }
    }

     // Test with missing images
    const missingImages = {
        ...validData,
        images: {}
    };

    try {
        ProductFormSchema.parse(missingImages);
        console.log("❌ Missing images passed (unexpected)");
    } catch (e) {
          if (e instanceof z.ZodError) {
             console.log("✅ Missing images failed (expected)");
            //  console.error(JSON.stringify(e.format(), null, 2));
        }
    }
    
    // Test with missing fields in variants
    // The UI adds variants with { name: "", price: price, stock: 0 } initially.
    // Let's see if that passes.
    const initialUiVariant = {
        ...validData,
         variants: [
            {
                name: "", 
                price: 100,
                stock: 0
            }
        ]
    };
    
    try {
        ProductFormSchema.parse(initialUiVariant);
        console.log("✅ Initial UI variant passed");
    } catch (e) {
        if (e instanceof z.ZodError) {
             console.error("❌ Initial UI variant failed:", JSON.stringify(e.format(), null, 2));
        }
    }

};

testSchema();
