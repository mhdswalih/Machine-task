
export interface IUser {
    _id:string;
    name : string;
    email : string;
    phone : string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface OrderData {
  userId: string;
  products: OrderItem[];
}