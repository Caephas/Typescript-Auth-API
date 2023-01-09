import {omit} from 'lodash'
import { DocumentDefinition } from "mongoose";
import UserModel, { UserDocument } from "../models/user.model";

export async function createUser(input: DocumentDefinition<Omit<UserDocument, "createdAt" | "updatedAt" | "comparePassword">>) {
    try {
        const user = await UserModel.create(input)
        return omit(user.toJSON(), 'password')
    } catch (e: any) {
        throw new Error(e)
    }
}
