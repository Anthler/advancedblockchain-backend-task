import { Schema } from 'dynamoose';

export const SupplySchema = new Schema({

  id: {
    type: String,
    hashKey: true
  },
  
  totalSupply: {
    type: String,
  }
}, { 
    "timestamps": {
      "createdAt": "timestamp", 
      "updatedAt": null 
    }
  }
);
