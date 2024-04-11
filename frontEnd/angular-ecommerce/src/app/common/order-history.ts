export class OrderHistory {
    constructor(public id: String,
                public orderTrackingNumber: string,
                public totalPrice: number,
                public totalQuantity: number,
                public dateCreated: Date) {}
}
