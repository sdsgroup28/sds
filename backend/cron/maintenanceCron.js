import cron from 'node-cron';
import House from '../models/House.js';
import Maintenance from '../models/Maintenance.js';

// Run on the 1st of every month at 00:00 (Midnight)
cron.schedule('0 0 1 * *', async () => {
    try {
        console.log("CRON JOB: Running monthly maintenance generation...");
        // Get current year and month in YYYY-MM format
        const today = new Date();
        const year = today.getFullYear();
        const monthStr = String(today.getMonth() + 1).padStart(2, '0');
        const period = `${year}-${monthStr}`;

        // Get all houses
        const houses = await House.find({});
        
        let generatedCount = 0;
        for (const house of houses) {
            // Check if already exists to prevent duplicates
            const existing = await Maintenance.findOne({ houseId: house._id, month: period });
            if (!existing) {
                const monthlyAmount = house.propertyType === 'Plot' ? 250 : 500;
                const newMaint = new Maintenance({
                    houseId: house._id,
                    month: period,
                    year: year,
                    amount: monthlyAmount // Based on property type
                });
                await newMaint.save(); // Schema pre-save hook handles pendingAmount
                generatedCount++;
            }
        }
        console.log(`CRON JOB: Successfully generated ${generatedCount} new maintenance bills for ${period}`);
    } catch (err) {
        console.error("CRON JOB Error:", err);
    }
});
