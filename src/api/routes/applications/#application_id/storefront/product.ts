import { Router, Request, Response } from "express";
import { route } from "@spacebar/api";
import { CreateApplicationSKUSchema, CreateApplicationSKUResponseSchema } from "@spacebar/schemas";

const router = Router({ mergeParams: true });

// this is the route the developer portal seems to use to create a sku for an app
router.post(
    "/",
    route({
        description: "Create a new SKU for an application",
        requestBody: "CreateApplicationSKUSchema",
        responses: {
            200: {
                body: "CreateApplicationSKUResponseSchema",
            },
        },
    }),
    async (req: Request, res: Response) => {
        const { application_id } = req.params;
        const { name, sku_type, product_line } = req.body as CreateApplicationSKUSchema;
        // TODO:
        res.json({
            skus: [],
            store_listings: [],
        } as CreateApplicationSKUResponseSchema);
    },
);

export default router;
