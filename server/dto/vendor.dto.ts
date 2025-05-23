import { IFoodItem } from "../models/fooditem.model";
import { Length, IsString, IsNotEmpty, IsEmail } from 'class-validator';
import { IOrder } from "../models/order.model";

class MainEntity{
    @IsString()
    @IsNotEmpty()
    phone:string;

    @IsString()
    @IsNotEmpty()
    name:string;

    @IsString()
    @IsNotEmpty() 
    pinCode:string;

    @IsString()
    @IsNotEmpty()
    address:string; 

    menu: IFoodItem[];
}
export class CreateVendorDto extends MainEntity{ 

    @IsString()
    @IsEmail()
    email:string;

    @IsString()
    @IsNotEmpty()
    ownerName:string; 

    @IsString()
    @Length(6,12)
    password:string;
      
    orders: IOrder[]; 
}


export class UpdateVendorDto extends MainEntity{
    
}

