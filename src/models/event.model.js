import mongoose, {Schema} from "mongoose";

const eventSchema = new Schema({

    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
  
}, { timestamps: true  });

export const Event = mongoose.model('Event', eventSchema);

