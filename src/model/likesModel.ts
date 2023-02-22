import { DataTypes, Model } from "sequelize";
import { db } from "../config/indexDB";

export interface LikeAtrributes {
  id: string;
  title: string,
  url: string,
  userId: string
  
}

export class LikeInstance extends Model<LikeAtrributes> {}

LikeInstance.init(
  {
    id: {
        type: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      title:{
        type:DataTypes.STRING,
        allowNull:false
    },
    url:{
        type: DataTypes.STRING,
        allowNull: false,
      },
      
      userId:{
        type: DataTypes.UUIDV4,
        allowNull: false,
      }
      
  },
{
    sequelize:db,
    tableName:"like"
}
);
