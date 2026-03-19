import { ShieldCheck, Users, Lock, Edit, MessageSquare } from 'lucide-react';

export function SidebarOrganizer({ project }) {
    const currentAmount = project?.currentAmount || 0;
    const targetAmount = project?.targetAmount || 1;
    const progressPercent = Math.min(Math.round((currentAmount / targetAmount) * 100), 100);

    return (
        <div className="sticky top-28 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xl flex flex-col gap-6">

            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <h2 className="font-bold text-lg text-gray-900">Command Center</h2>
                <div className="flex items-center gap-1.5 bg-gray-900 text-white px-3 py-1 rounded-full shadow-sm">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Organizer Mode</span>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-end">
                    <p className="text-sm font-medium text-gray-500">Funds in Escrow</p>
                </div>
                <div className="text-4xl font-extrabold text-gray-900 tracking-tight">
                    {currentAmount.toLocaleString()}đ
                </div>
                <div className="w-full h-3 bg-purple-100 rounded-full overflow-hidden mt-2">
                    <div className="h-full bg-purple-400 rounded-full relative transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 font-medium">
                    <span>{progressPercent}% Funded</span>
                    <span>Goal: {targetAmount.toLocaleString()}đ</span>
                </div>
            </div>

            <div className="bg-green-100/50 p-4 rounded-2xl flex items-center justify-between border border-green-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-green-700" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-green-800">Pending Volunteers</p>
                        <p className="text-xs text-green-600 mt-0.5">Review applications</p>
                    </div>
                </div>
                <div className="bg-green-500 text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center shadow-md">
                    5
                </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
                <button className="w-full py-4 text-base font-bold text-gray-500 bg-gray-100 rounded-2xl cursor-not-allowed flex justify-center items-center gap-2 border border-transparent">
                    <Lock className="w-5 h-5" /> Request Disbursement
                </button>
                <p className="text-xs text-center text-gray-500">Submit Phase 1 evidence to unlock.</p>

                <hr className="border-gray-100 my-2" />

                <button className="w-full py-3.5 text-sm font-bold text-gray-700 bg-white border-2 border-gray-200 rounded-2xl hover:border-gray-300 transition-colors flex justify-center items-center gap-2">
                    <Edit className="w-4 h-4" /> Edit Project Details
                </button>
                <button className="w-full py-3.5 text-sm font-bold text-gray-700 bg-white border-2 border-gray-200 rounded-2xl hover:border-gray-300 transition-colors flex justify-center items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Open Project Group Chat
                </button>
            </div>

        </div>
    );
}