import { Get, Injectable } from '@nestjs/common';
import { ISupply, Supply } from "../eth-supply/supply.model";
 
@Injectable()
export class SupplyService {

    @Get()
    findAllByLastDay() : Promise<ISupply[]> {
        const lastDay = new Date(new Date().getTime() - (24 * 60 * 60 * 1000));
        return Supply.query("timestamp")
          .ge(lastDay)          
          .attributes(["timestamp", "totalSupply"])
          .exec();
    }
}