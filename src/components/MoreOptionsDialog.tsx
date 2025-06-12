import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import JumiaIcon from '../../assets/Pro Assets/Jumia-icon.png';
import KongaIcon from '../../assets/Pro Assets/konga-icon.png';
import JijiIcon from '../../assets/Pro Assets/Jiji-icon.png';
import AliExpressIcon from '../../assets/Pro Assets/aliexpress-logo.png';
import TemuIcon from '../../assets/Pro Assets/Temu_logo_icon.png';
import WhatsAppIcon from '../../assets/Pro Assets/WhatsApp.png';

interface MoreOptionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  position: { top: number; left: number } | null;
}

const MoreOptionsDialog: React.FC<MoreOptionsDialogProps> = ({
  isOpen,
  onClose,
  position
}) => {
  const [searchEnabled, setSearchEnabled] = useState(false);
  const [adjustedPosition, setAdjustedPosition] = useState<{ top: number; left: number } | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (position) {
      // Initial guess, will be corrected in useLayoutEffect
      setAdjustedPosition(position);
    } else {
      setAdjustedPosition(null);
    }
  }, [position]);

  useLayoutEffect(() => {
    if (position && modalRef.current) {
      const GAP = 4;
      const modalHeight = modalRef.current.offsetHeight;
      let top = position.top - modalHeight - GAP;
      if (top < 0) top = 0;
      setAdjustedPosition({ top, left: position.left });
    }
  }, [position, isOpen]);
  
  if (!isOpen || !adjustedPosition) return null;

  const handleOptionClick = (option: string) => {
    console.log(`Selected option: ${option}`);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };
  
  // No longer needed, as Enable Search is removed
  // const toggleSearch = () => {
  //   setSearchEnabled(!searchEnabled);
  // };

  return (
    <>
      {/* Invisible backdrop to capture clicks outside */}
      <div 
        className="fixed inset-0 z-40"
        onClick={handleBackdropClick}
      />
      
      {/* Dialog content */}
      <div 
        ref={modalRef}
        className="fixed z-50 w-64 bg-grok-light-secondary dark:bg-grok-dark-secondary rounded-lg shadow-lg border border-grok-light-border dark:border-grok-dark-border overflow-hidden"
        style={{
          top: adjustedPosition.top,
          left: adjustedPosition.left
        }}
      >
        <div className="p-1">
          <div className="px-2 py-1 text-xs font-medium text-grok-light-text-secondary dark:text-grok-dark-text-secondary">
            Oja PRIME &bull; Premium Features
          </div>
          
          {/* New Options */}
          <button 
            className="flex items-center gap-2 w-full p-2 text-sm rounded-md hover:bg-grok-light-button-hover dark:hover:bg-grok-dark-button-hover text-left"
            onClick={() => handleOptionClick('buy_jumia')}
          >
            <img src={JumiaIcon} alt="Jumia" className="h-4 w-4" />
            <span>Buy from Jumia</span>
          </button>

          <button 
            className="flex items-center gap-2 w-full p-2 text-sm rounded-md hover:bg-grok-light-button-hover dark:hover:bg-grok-dark-button-hover text-left"
            onClick={() => handleOptionClick('buy_konga')}
          >
            <img src={KongaIcon} alt="KONGA" className="h-4 w-4" />
            <span>Buy from KONGA</span>
          </button>

          <button 
            className="flex items-center gap-2 w-full p-2 text-sm rounded-md hover:bg-grok-light-button-hover dark:hover:bg-grok-dark-button-hover text-left"
            onClick={() => handleOptionClick('search_jiji')}
          >
            <img src={JijiIcon} alt="Jiji" className="h-4 w-4" />
            <span>Search Jiji</span>
          </button>

          <button 
            className="flex items-center gap-2 w-full p-2 text-sm rounded-md hover:bg-grok-light-button-hover dark:hover:bg-grok-dark-button-hover text-left"
            onClick={() => handleOptionClick('shop_aliexpress')}
          >
            <img src={AliExpressIcon} alt="AliExpress" className="h-4 w-4" />
            <span>Shop on AliExpress</span>
          </button>

          <button 
            className="flex items-center gap-2 w-full p-2 text-sm rounded-md hover:bg-grok-light-button-hover dark:hover:bg-grok-dark-button-hover text-left"
            onClick={() => handleOptionClick('buy_temu')}
          >
            <img src={TemuIcon} alt="TEMU" className="h-4 w-4" />
            <span>Buy from TEMU</span>
          </button>

          <button 
            className="flex items-center gap-2 w-full p-2 text-sm rounded-md hover:bg-grok-light-button-hover dark:hover:bg-grok-dark-button-hover text-left"
            onClick={() => handleOptionClick('whatsapp_mode')}
          >
            <img src={WhatsAppIcon} alt="WhatsApp" className="h-4 w-4" />
            <span>WhatsApp Mode</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default MoreOptionsDialog; 