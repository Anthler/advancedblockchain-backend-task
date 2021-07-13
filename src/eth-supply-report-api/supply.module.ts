import { Module } from '@nestjs/common';
import { SupplyReportApiController } from "./supply-report-api.controller";
import { SupplyService } from "./supply.service";

@Module({
    controllers: [SupplyReportApiController],
    providers: [SupplyService]
})
export class SupplyModule {

}