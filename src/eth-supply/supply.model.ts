import * as dynamoose from "dynamoose";
import {Document} from "dynamoose/dist/Document";
import {SupplySchema} from "./supply.schema";

export interface ISupplyKey {
    id: string;
    timestamp: Date;
}

export interface ISupply extends ISupplyKey {
    totalSupply: string;
}

export class SupplyModel extends Document implements ISupply {
    id: string;
    totalSupply: string;
    timestamp: Date;
}

export const Supply = dynamoose.model<SupplyModel>("supply", SupplySchema);