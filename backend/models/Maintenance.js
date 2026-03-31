import mongoose from 'mongoose';

const maintenanceSchema = new mongoose.Schema({
    houseId: { type: mongoose.Schema.Types.ObjectId, ref: 'House', required: true },
    month: { type: String, required: true }, // e.g., "2023-10"
    subject: { type: String, default: 'Maintenance' },
    year: { type: Number, required: true },
    amount: { type: Number, required: true, default: 0 },
    status: { type: String, enum: ['Pending', 'Paid', 'Verification Pending'], default: 'Pending' },
    paidAmount: { type: Number, default: 0 },
    pendingAmount: { type: Number },
    paymentMode: { type: String, enum: ['Cash', 'Online', 'None', 'Cheque'], default: 'None' },
    chequeDetails: {
       bankName: String,
       chequeNumber: String,
       date: String
    },
    rebateApplied: { type: Boolean, default: false },
    rebateAmount: { type: Number, default: 0 },
    financialYear: { type: String },
    adminApproved: { type: Boolean, default: false },
    transactionDate: { type: Date }
}, { timestamps: true });

maintenanceSchema.pre('save', function(next) {
    const effectivelyPaid = this.paidAmount + (this.rebateAmount || 0);
    this.pendingAmount = this.amount - effectivelyPaid;
    if (this.pendingAmount <= 0) {
        if (this.paymentMode === 'Cash' || this.paymentMode === 'Cheque') {
            if (this.adminApproved) {
                this.status = 'Paid';
            } else {
                this.status = 'Verification Pending';
            }
        } else {
            this.status = 'Paid';
        }
    }
    next();
});

export default mongoose.model('Maintenance', maintenanceSchema);
