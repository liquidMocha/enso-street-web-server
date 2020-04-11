import {OwnerBatchDto} from "./OwnerBatchDto";

export class CartDto {
    private ownerBatches: OwnerBatchDto[];

    constructor(ownerBatchDtos: OwnerBatchDto[]) {
        this.ownerBatches = ownerBatchDtos;
    }
}
