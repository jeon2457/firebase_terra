import mongoose, { Schema, model, models } from 'mongoose';

const ImageSchema = new Schema({
    url: { type: String, required: true },
    date: { type: String, required: true },
    notice: { type: String },
}, {
    timestamps: true,
    collection: 'images'
});

const Image = models.Image || model('Image', ImageSchema);

export default Image;
