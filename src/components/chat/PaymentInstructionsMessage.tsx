import { PaymentInstructions } from "@/types/chat";
import { Copy } from "lucide-react";
import { useState } from "react";

interface PaymentInstructionsMessageProps {
  instructions: PaymentInstructions;
}

export default function PaymentInstructionsMessage({ instructions }: PaymentInstructionsMessageProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const CopyButton = ({ text, field }: { text: string; field: string }) => (
    <button
      onClick={() => handleCopy(text, field)}
      className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 transition-colors"
    >
      <Copy className="h-3.5 w-3.5" />
      {copiedField === field && (
        <span className="absolute bg-gray-800 text-white text-xs px-2 py-1 rounded -top-8 left-1/2 transform -translate-x-1/2">
          Copied!
        </span>
      )}
    </button>
  );

  return (
    <div className="w-full rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="font-medium text-gray-900">Payment Instructions</h3>
      
      <div className="mt-4 space-y-4">
        <div>
          <div className="flex justify-between items-center text-sm text-gray-600 mb-1">
            <span>Amount to Pay</span>
          </div>
          <div className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-md">
            <span className="font-medium text-gray-900">₦{instructions.amount.toLocaleString()}</span>
            <CopyButton text={instructions.amount.toString()} field="amount" />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center text-sm text-gray-600 mb-1">
            <span>Payment Reference</span>
          </div>
          <div className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-md">
            <span className="font-medium text-gray-900">{instructions.reference}</span>
            <CopyButton text={instructions.reference} field="reference" />
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Bank Account Details</h4>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-md">
              <div>
                <span className="text-sm text-gray-600">Bank Name</span>
                <p className="font-medium text-gray-900">{instructions.accountDetails.bank}</p>
              </div>
            </div>

            <div className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-md">
              <div>
                <span className="text-sm text-gray-600">Account Number</span>
                <p className="font-medium text-gray-900">{instructions.accountDetails.accountNumber}</p>
              </div>
              <CopyButton text={instructions.accountDetails.accountNumber} field="accountNumber" />
            </div>

            <div className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-md">
              <div>
                <span className="text-sm text-gray-600">Account Name</span>
                <p className="font-medium text-gray-900">{instructions.accountDetails.accountName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 