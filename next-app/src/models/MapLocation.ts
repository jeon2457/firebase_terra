import mongoose, { Schema, Document } from 'mongoose';

export interface IMapLocation extends Document {
    addr: string;
    lat: number;
    lng: number;
    notice: string;
}

const MapLocationSchema = new Schema<IMapLocation>({
    addr: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    notice: { type: String, default: '' }
}, { 
    timestamps: true 
});

export default mongoose.models.MapLocation || mongoose.model<IMapLocation>('MapLocation', MapLocationSchema);