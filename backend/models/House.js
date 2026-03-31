import mongoose from 'mongoose';

const houseSchema = new mongoose.Schema({
    houseId: { type: String, required: true, unique: true },
    propertyType: { type: String, enum: ['Plot', 'House'], default: 'House' },
    ownerName: { type: String, required: true },
    contact: { type: String, required: true },
    address: { type: String, default: '' },
    clerkUserId: { type: String, default: null },
    livingStatus: { type: String, enum: ['Owner Living', 'Tenant Living'], default: 'Owner Living' },
    tenantDetails: { 
        name: { type: String, default: '' },
        contact: { type: String, default: '' }
    },
    ownerIdProof: { type: String, default: '' },
    tenantIdProof: { type: String, default: '' },
    familyMembers: [{
        name: { type: String, required: true },
        age: { type: Number, required: true },
        relation: { type: String, required: true }
    }],
    vehicles: {
        twoWheelers: [{ plateNumber: String, make: String }],
        fourWheelers: [{ plateNumber: String, make: String }]
    }
}, { timestamps: true });

export default mongoose.model('House', houseSchema);
