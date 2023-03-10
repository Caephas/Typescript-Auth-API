import { Request, Response } from "express"
import { omit } from "lodash"
import { userInfo } from "os"
import { CreateUserInput } from "../schema/user.schema"
import { createUser } from "../service/user.service"
import log from "../utils/logger"

export async function createUserHandler(req: Request<{}, {}, CreateUserInput['body']>, res: Response) {
    try {
        const user = await createUser(req.body)
        // return res.send(omit(user.toJSON(), "password"))
        return res.send(user)
    } catch (e: any) {
        log.error(e)
        return res.status(409).send(e.message)
    }
}