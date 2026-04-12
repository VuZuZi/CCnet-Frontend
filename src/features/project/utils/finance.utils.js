export const calculateUnallocatedAmount = (targetAmount, milestones = []) => {
    const totalTarget = Number(targetAmount) || 0;

    const allocatedAmount = milestones.reduce((sum, milestone) => {
        return sum + (Number(milestone.targetAmount) || 0);
    }, 0);

    return totalTarget - allocatedAmount;
};


export const calculatePercentage = (current, total) => {
    if (!total || Number(total) <= 0) return 0;
    const numCurrent = Number(current) || 0;
    const percent = (numCurrent / Number(total)) * 100;
    return Math.min(Math.max(percent, 0), 100);
};