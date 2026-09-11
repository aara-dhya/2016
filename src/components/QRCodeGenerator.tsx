'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Printer } from 'lucide-react';

interface QRCodeGeneratorProps {
  serialNumber: string;
  assetName: string;
  category: string;
  ownerDID?: string;
  qrPayload?: string;
  onClose?: () => void;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  serialNumber,
  assetName,
  category,
  ownerDID = 'did:nexus:user:0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
  qrPayload,
  onClose
}) => {
  const payload = qrPayload || `https://nexus.corp/verify-asset?id=${serialNumber}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-black border-2 border-[#77DD77] rounded-none p-6 text-white max-w-sm w-full mx-auto shadow-[8px_8px_0px_#77DD77] relative font-mono select-none">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-[#A0A0A0] hover:text-[#77DD77] p-1 rounded-none hover:bg-[#111111] transition-colors border border-transparent hover:border-[#77DD77]"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Header */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-none bg-black border border-[#77DD77] text-[10px] font-bold text-[#77DD77] mb-2 uppercase tracking-widest">
          <span>// PHYSICAL STICKER LABEL</span>
        </div>
        <h3 className="text-sm font-extrabold text-white tracking-wider uppercase">{assetName}</h3>
        <p className="text-xs text-[#A0A0A0] font-mono mt-0.5 uppercase">{category}</p>
      </div>

      {/* Printable Sticker Box */}
      <div id="printable-qr-sticker" className="bg-white p-4 rounded-none shadow-none flex flex-col items-center justify-center border-2 border-black">
        <div className="p-2 bg-white rounded-none">
          <QRCodeSVG
            value={payload}
            size={160}
            bgColor="#FFFFFF"
            fgColor="#000000"
            level="H"
            includeMargin={true}
          />
        </div>

        <div className="mt-3 text-center w-full border-t-2 border-black pt-2 font-mono">
          <p className="text-xs font-extrabold text-black font-mono tracking-wider uppercase">{serialNumber}</p>
          <p className="text-[9px] text-black font-mono truncate max-w-[220px] mx-auto mt-0.5 font-bold">
            {ownerDID}
          </p>
          <div className="mt-1 flex items-center justify-center space-x-1 text-[9px] text-black font-extrabold uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-none bg-black animate-pulse" />
            <span>NEXUS VERIFIED ENCLAVE</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-5 flex space-x-3">
        <button
          onClick={handlePrint}
          className="w-full btn-primary justify-center text-xs font-bold"
        >
          <Printer className="w-4 h-4" />
          <span>PRINT QR STICKER</span>
        </button>
      </div>
    </div>
  );
};
