import mongoose from 'mongoose';

const MapLocationSchema = new mongoose.Schema({
  addr: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  notice: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.models.MapLocation || mongoose.model('MapLocation', MapLocationSchema);
