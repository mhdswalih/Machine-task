import mongoose  from "mongoose";

export interface IUser {
    name : string;
    email : string;
    phone : string;
}

const userSchema = new mongoose.Schema<IUser>({
    name : {type: String,required : true},
    email : {type : String ,required:true},
    phone : {type : String,required :true}
})


export default mongoose.model<IUser>("User",userSchema)