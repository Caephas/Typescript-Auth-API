import { Express, Request, Response } from "express";
import {
    createProductHandler,
    getProductHandler,
    updateProductHandler,
    deleteProductHandler,
} from "./controller/product.controller";
import {
    createSessionHandler,
    getUserSessionsHandler,
    deleteSessionHandler,
} from "./controller/session.controller";
import { createUserHandler } from "./controller/user.controller";
import requireUser from "./middleware/requireUser";

import {
    createProductSchema,
    deleteProductSchema,
    getProductSchema,
    updateProductSchema,
} from "./schema/product.schema";
import { createSessionSchema } from "./schema/session.schema";
import { createUserSchema } from "./schema/user.schema";
import validate from "./middleware/validateResource";

function routes(app: Express) {

    app.get("/healthcheck", (req: Request, res: Response) => res.sendStatus(200));

    app.post("/api/users", validate(createUserSchema), createUserHandler) 

    app.post(
        "/api/sessions",
        validate(createSessionSchema),
        createSessionHandler
    );

    app.get("/api/sessions", requireUser, getUserSessionsHandler);

    app.delete("/api/sessions", requireUser, deleteSessionHandler);

    app.post("/api/products", [requireUser, validate(createProductSchema)], createProductHandler)

    app.get(
        "/api/products/:productId",
        validate(getProductSchema),
        getProductHandler
    );

    app.put(
        "/api/products/:productId",
        [requireUser, validate(updateProductSchema)],
        updateProductHandler
    );  

    app.delete(
        "/api/products/:productId",
        [requireUser, validate(deleteProductSchema)],
        deleteProductHandler
    );
}

export default routes