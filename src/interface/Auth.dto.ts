import {UserPayload} from "./User.dto"
import {VendorPayload} from './vendor.dto' 

//THE PAYLOADS WAS MERGED HERE TO ENABLE US USE EITHER OF THE TWO IN OUR CODE
//THIS A WAY OF JOINING INTERFACES TOGETHER USING TYPE
export type AutoPayload =  UserPayload | VendorPayload   