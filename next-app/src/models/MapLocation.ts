import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMapLocation extends Document {
  _id: number;
  addr: string;
  road_address: string;
  lat: number;
  lng: number;
  notice: string;
  updated_at: Date;
}

const MapLocationSchema: Schema = new Schema({
  _id: { type: Number, default: 1 }, // 항상 1개의 문서만 유지 (ID 고정)
  addr: { type: String, required: true },
  road_address: { type: String },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  notice: { type: String },
  updated_at: { type: Date, default: Date.now }
});

// 모델이 이미 존재하면 재사용, 없으면 생성
const MapLocation: Model<IMapLocation> = mongoose.models.MapLocation || mongoose.model<IMapLocation>('MapLocation', MapLocationSchema);

export default MapLocation;