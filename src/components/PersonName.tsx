import React from 'react';

export const parsePersonName = (rawName: string) => {
  if (!rawName) return { color: undefined, cleanName: 'Desconhecido' };
  const match = rawName.match(/"([^"]+)"/);
  const color = match ? match[1] : undefined;
  const cleanName = rawName.replace(/"[^"]+"/g, '').trim();
  return { color, cleanName };
};

export const PersonName: React.FC<{ rawName: string; className?: string; defaultColor?: string }> = ({ rawName, className = '', defaultColor }) => {
  if (!rawName) return null;
  const { color, cleanName } = parsePersonName(rawName);
  const finalColor = color || defaultColor;
  
  const isThayna = cleanName.toLowerCase() === 'thayná' || cleanName.toLowerCase() === 'thayna';
  
  return (
    <span style={{ color: finalColor }} className={className}>
      {isThayna ? <span style={{ fontSize: '50%' }}>{cleanName}</span> : cleanName}
    </span>
  );
};
