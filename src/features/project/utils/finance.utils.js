import {
  calculatePercentage as calculateSharedPercentage,
  calculateUnallocatedAmount as calculateSharedUnallocatedAmount,
} from "./projectDraft.utils";

export const calculateUnallocatedAmount = (targetAmount, milestones = []) =>
  calculateSharedUnallocatedAmount(targetAmount, milestones);

export const calculatePercentage = (current, total) =>
  calculateSharedPercentage(current, total);