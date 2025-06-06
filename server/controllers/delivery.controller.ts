import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response } from "express";
import { CreateDeliveryDto, UpdateDeliveryDto } from "../dto/delivery.dto";
import { Delivery } from "../models/delivery.model";
import { GenerateSalt, hashingPassword } from "../utilities/security"; 
import { checkUser } from "../utilities/getUser";

export const CreateDelivey = async (req: Request, res: Response): Promise<void> => {
    try {   
        const deliveryData = plainToClass(CreateDeliveryDto, req.body);
        const errors = await validate(deliveryData, { skipMissingProperties: false });

        if(errors.length > 0){
            res.status(400).json({ success: false, message: 'All fields are required', errors });
            return;
        };
        
        const { email, password, driverName, phone, address, pincode, vehicleType } = deliveryData;
        const exists = await Delivery.findOne({email: email});

        if(exists){
            res.status(400).json({ success: false, message: 'Delivery is already exists'});
            return;
        };

        const salt = await GenerateSalt();
        const hashedPassword = await hashingPassword(password, salt); 
 
        const newDelivery = await Delivery.create({
            email: email,
            password: hashedPassword,
            driverName: driverName, 
            phone: phone,
            address: address,
            salt: salt,
            pincode: pincode,
            vehicleType: vehicleType
        }); 

        if(!newDelivery || !newDelivery._id){
            res.status(400).json({ success: false, message: 'Delivery could not be created'});
            return;
        }

        res.status(201).json({ success: true, message: "Delivery account was created successfully" });

    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
    return;
};

export const getDeliveryProfile = async (req: Request, res: Response): Promise<void> => {
     try {     
            const profile = await checkUser(req, res, String(process.env.DELIVERY)) 

            res.status(200).json({ success: true, profile});
    
        } catch (error) {
            res.status(500).json({ message: 'Internal server error' });
        }
        return;
};

export const updateDeliveryProfile = async (req: Request, res: Response): Promise<void> => {
    try {   
        const profile = await checkUser(req, res, String(process.env.DELIVERY))    
 
        const deliveryData = plainToClass(UpdateDeliveryDto, req.body);
        const errors = await validate(deliveryData, { skipMissingProperties: false });

        if(errors.length > 0){
            res.status(400).json({ success: false, message: 'All fields are required', errors });
            return;
        };

        const { driverName, phone, address, pincode, vehicleType, estimatedTime } = deliveryData;
        profile.driverName = driverName;
        profile.pincode =pincode;
        profile.phone =phone;
        profile.address =address;
        profile.estimatedTime =estimatedTime; 
        if (vehicleType === "Bike" || vehicleType === "Car" || vehicleType === "Van") profile.vehicleType = vehicleType;
  
        if (!profile.isModified()) {
            res.status(400).json({ success: false, message: 'No changes detected' });
            return ;
        }

        await profile.save();

        res.status(200).json({ success: true, message: "Profile is updated successfully" });

    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
    return;
};

export const updateDeliveyStatus = async (req: Request, res: Response) : Promise<void> =>  {
    try {  
            const delivery = await checkUser(req, res, String(process.env.DELIVERY))
        
            if(!delivery){
                res.status(404).json({ success: false, message: 'User was not found'});
                return;
            };     
            
            delivery.status = !delivery.status;

            if (!delivery.isModified()){
                res.status(400).json({ success: false, message: 'No changes detected' });
                return;
            }
            
            await delivery.save();

            res.status(200).json({success:true, message: "Delivery status was updated successfully"});  
            
        } catch (error) {
            res.status(500).json({ message: 'Internal server error'});
        }
        return;
};

 
