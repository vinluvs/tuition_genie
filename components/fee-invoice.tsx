import React from "react";
import type { FeeModel, StudentModel } from "@/lib/types";

type Props = {
    fee: FeeModel;
    student: StudentModel;
    centerName?: string | null;
};

export const FeeInvoice = React.forwardRef<HTMLDivElement, Props>(
    ({ fee, student, centerName }, ref) => {
        return (
            <div ref={ref} className="p-8 bg-white text-black hidden print:block">
                <div className="border-b-2 border-gray-200 pb-8 mb-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
                            <p className="text-gray-500 mt-1">#{fee._id.slice(-6).toUpperCase()}</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-xl font-semibold">{centerName || "Tuition Center"}</h2>
                            <p className="text-gray-500 text-sm mt-1">
                                Date: {new Date().toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mb-8">
                    <h3 className="text-gray-500 text-sm uppercase tracking-wider mb-2">
                        Bill To
                    </h3>
                    <div className="font-semibold text-lg">{student.name}</div>
                    <div className="text-gray-600">
                        {student.parentsName && <p>Parent: {student.parentsName}</p>}
                        {student.phone && <p>Phone: {student.phone}</p>}
                    </div>
                </div>

                <table className="w-full mb-8">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="text-left py-3 font-semibold text-gray-600">Description</th>
                            <th className="text-right py-3 font-semibold text-gray-600">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-gray-100">
                            <td className="py-4">
                                Tuition Fee -{" "}
                                {new Date(fee.month).toLocaleString("default", {
                                    month: "long",
                                    year: "numeric",
                                })}
                            </td>
                            <td className="text-right py-4">₹{fee.baseAmountINR}</td>
                        </tr>
                        {fee.discountINR > 0 && (
                            <tr className="border-b border-gray-100 text-emerald-600">
                                <td className="py-4">Discount</td>
                                <td className="text-right py-4">-₹{fee.discountINR}</td>
                            </tr>
                        )}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td className="pt-4 font-semibold text-right">Total</td>
                            <td className="pt-4 font-bold text-right text-xl">
                                ₹{fee.baseAmountINR - fee.discountINR}
                            </td>
                        </tr>
                        <tr>
                            <td className="pt-2 text-right text-gray-500">Paid</td>
                            <td className="pt-2 text-right text-gray-500">₹{fee.paidINR}</td>
                        </tr>
                        <tr>
                            <td className="pt-2 text-right font-semibold">Balance Due</td>
                            <td className="pt-2 text-right font-semibold text-rose-600">
                                ₹{fee.baseAmountINR - fee.discountINR - fee.paidINR}
                            </td>
                        </tr>
                    </tfoot>
                </table>

                <div className="border-t border-gray-200 pt-8 text-center text-gray-500 text-sm">
                    <p>Thank you for your business!</p>
                </div>
            </div>
        );
    }
);

FeeInvoice.displayName = "FeeInvoice";
