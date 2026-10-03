import React, { useState, useEffect, useRef } from 'react';
import { Calendar } from 'lucide-react';

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  containerClassName?: string;
  placeholder?: string;
  required?: boolean;
  title?: string;
}

export const DateInput: React.FC<DateInputProps> = ({ 
  value, 
  onChange, 
  className = '', 
  containerClassName = '', 
  placeholder = 'DD/MM/AAAA', 
  required, 
  title
}) => {
  const [displayValue, setDisplayValue] = useState('');
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!value) {
      setDisplayValue('');
    } else {
      const parts = value.split('-');
      if (parts.length === 3) {
        setDisplayValue(`${parts[2]}/${parts[1]}/${parts[0]}`);
      }
    }
  }, [value]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayValue(e.target.value);
  };

  const handleBlur = () => {
    if (!displayValue.trim()) {
      onChange('');
      return;
    }

    const raw = displayValue.replace(/[^\d]/g, '');
    let d = 0, m = 0, y = 0;

    if (displayValue.includes('/') || displayValue.includes('-') || displayValue.includes('.')) {
       const parts = displayValue.split(/[/.-]/);
       if (parts.length >= 3) {
          d = parseInt(parts[0], 10);
          m = parseInt(parts[1], 10);
          let yStr = parts[2];
          if (yStr.length === 2) {
             yStr = (parseInt(yStr, 10) > 50 ? '19' : '20') + yStr;
          }
          y = parseInt(yStr, 10);
       } else if (parts.length === 2) {
          // If only day and month given, assume current year
          d = parseInt(parts[0], 10);
          m = parseInt(parts[1], 10);
          y = new Date().getFullYear();
       }
    } else if (raw.length === 8) {
       d = parseInt(raw.substring(0, 2), 10);
       m = parseInt(raw.substring(2, 4), 10);
       y = parseInt(raw.substring(4, 8), 10);
    } else if (raw.length === 6) {
       d = parseInt(raw.substring(0, 2), 10);
       m = parseInt(raw.substring(2, 4), 10);
       let yStr = raw.substring(4, 6);
       yStr = (parseInt(yStr, 10) > 50 ? '19' : '20') + yStr;
       y = parseInt(yStr, 10);
    } else if (raw.length === 4) {
       d = parseInt(raw.substring(0, 2), 10);
       m = parseInt(raw.substring(2, 4), 10);
       y = new Date().getFullYear();
    }
    
    if (d > 0 && d <= 31 && m > 0 && m <= 12 && y >= 1900 && y <= 2100) {
      onChange(`${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`);
    } else {
      if (value) {
        const parts = value.split('-');
        if (parts.length === 3) {
          setDisplayValue(`${parts[2]}/${parts[1]}/${parts[0]}`);
        }
      } else {
        setDisplayValue('');
      }
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={`relative flex items-center ${containerClassName}`}>
      <input
        type="text"
        value={displayValue}
        onChange={handleTextChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        title={title}
        className={`${className} pr-10`}
      />
      <div 
        className="absolute right-3 w-5 h-5 flex items-center justify-center text-white/50 hover:text-white cursor-pointer" 
        onClick={() => {
          try {
            dateInputRef.current?.showPicker();
          } catch (e) { /* ignore */ }
        }}
      >
        <Calendar className="w-4 h-4 pointer-events-none" />
        <input
          ref={dateInputRef}
          type="date"
          value={value}
          onChange={handleDateChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer [color-scheme:dark]"
        />
      </div>
    </div>
  );
};
