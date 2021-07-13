import { Controller, Get } from '@nestjs/common';
import { Request, Response } from "express";
import { ISupply } from 'src/eth-supply/supply.model';
import { SupplyService } from "./supply.service";

@Controller("supply")
export class SupplyReportApiController {
    constructor(private supplyService: SupplyService) {}

    @Get("lastday")
    async findAllByLastDay(): Promise<ISupply[]> {
        return this.supplyService.findAllByLastDay();
    }
}