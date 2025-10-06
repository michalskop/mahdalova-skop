import React from 'react';

interface PartyFaceProps {
  size?: number;
  color?: string;
  text?: string;
  textColor?: string;
  party?: string;
}

export const PartyFace: React.FC<PartyFaceProps> = ({ 
  size = 42, 
  color, 
  text,
  textColor,
  party
}) => {
  // Predefined party colors
  const partyPresets: { [key: string]: { bg: string; text: string; displayText: string } } = {
    ANO: { bg: '#272A59', text: '#ffffff', displayText: 'ANO' },
    SPD: { bg: '#a47d03', text: '#ffffff', displayText: 'SPD' },
    Piráti: { bg: '#111111', text: '#ffffff', displayText: 'Pir' },
    SPOLU: { bg: '#5e66d5', text: '#ffffff', displayText: 'Spolu' },
    ODS: { bg: '#5e66d5', text: '#ffffff', displayText: 'ODS' },
    STAN: { bg: '#FF1A4A', text: '#ffffff', displayText: 'STAN' },
    KDU: { bg: '#FFB300', text: '#000000', displayText: 'KDU' },
    KSČM: { bg: '#C5143C', text: '#ffffff', displayText: 'KSČM' },
    TOP09: { bg: '#812840', text: '#ffffff', displayText: 'TOP' },
    Motoristé: {bg: '#1A9FBD', text: '#ffffff', displayText: 'Moto'}
  };

  // Function to calculate luminance and determine if color is light or dark
  const getContrastColor = (hexColor: string) => {
    // Remove # if present
    const hex = hexColor.replace('#', '');
    
    // Convert to RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return white for dark colors, black for light colors
    return luminance > 0.5 ? '#1a1a1a' : '#ffffff';
  };

  // Determine colors and text based on props
  let backgroundColor, finalTextColor, faceText;

  if (party && partyPresets[party]) {
    const preset = partyPresets[party];
    backgroundColor = preset.bg;
    finalTextColor = preset.text;
    faceText = text ?? preset.displayText; // Use explicit text prop, or preset text
  } else {
    // Use custom color or default
    backgroundColor = color || '#4a90e2';
    finalTextColor = textColor || getContrastColor(backgroundColor);
    faceText = text ?? ':-)'; // Use explicit text prop, or default
  }

  // Calculate font size based on icon size with better scaling for larger sizes
  // Use logarithmic scaling to prevent text from getting too large
  const calculateFontSize = (iconSize: number) => {
    if (iconSize <= 42) {
      // Linear scaling for small sizes
      return (iconSize / 42) * 9;
    } else {
      // Slower scaling for larger sizes
      // At 60px: ~10.5, at 80px: ~11.5
      return 9 + Math.log(iconSize / 42) * 3;
    }
  };

  const fontSize = calculateFontSize(size);

  return (
    <div 
      style={{ display: 'inline-block', fontFamily: "'Roboto Slab', serif" }}
      title={party} // Add tooltip with full party name
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 30 30"
        width={size}
        height={size}
        style={{ display: 'block' }}
      >
        <path 
          d="M 11.29 0 Q 0 0 0 11.29 L 0 18.71 Q 0 30 11.29 30 L 18.71 30 Q 30 30 30 18.71 L 30 0 L 11.29 0 Z" 
          fill={backgroundColor}
        />
        <text 
          x="15" 
          y="18" 
          fontFamily="Roboto Slab, serif" 
          fontSize={fontSize} 
          fontWeight="700" 
          fill={finalTextColor} 
          textAnchor="middle"
        >
          {faceText}
        </text>
      </svg>
    </div>
  );
};

export default PartyFace;