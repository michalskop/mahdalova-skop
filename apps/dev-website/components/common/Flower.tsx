const AnimatedFlower = ({ size = 200, color = '#6666ff', strokeWidth = 2 }) => {
  const petals = 9;
  const baseRadius = size * 0.35;
  const centerRadius = size * 0.09; // Center circle size

  const createPetal = (angle: number) => {
    const randomLength = baseRadius * (0.5 + Math.random() * 0.8);
    const randomWidth = (Math.random() * 0.15 + 0.05) * Math.PI;
    
    // Start from edge of center circle
    const startX = Math.cos(angle) * centerRadius;
    const startY = Math.sin(angle) * centerRadius;
    const endX = Math.cos(angle) * randomLength;
    const endY = Math.sin(angle) * randomLength;
    
    const cp1x = Math.cos(angle - randomWidth) * randomLength * 0.8;
    const cp1y = Math.sin(angle - randomWidth) * randomLength * 0.8;
    const cp2x = Math.cos(angle + randomWidth) * randomLength * 0.8;
    const cp2y = Math.sin(angle + randomWidth) * randomLength * 0.8;
    
    const tipCp1x = Math.cos(angle - 0.1) * randomLength;
    const tipCp1y = Math.sin(angle - 0.1) * randomLength;
    const tipCp2x = Math.cos(angle + 0.1) * randomLength;
    const tipCp2y = Math.sin(angle + 0.1) * randomLength;

    return `M ${startX},${startY} 
            C ${cp1x},${cp1y} ${tipCp1x},${tipCp1y} ${endX},${endY} 
            C ${tipCp2x},${tipCp2y} ${cp2x},${cp2y} ${startX},${startY}`;
  };

  return (
    <svg width={size} height={size} viewBox={`${-size/2} ${-size/2} ${size} ${size}`}>
      <style>
        {`
          .petal {
            animation: growFromCenter 6s infinite;
          }
          .petal:nth-child(even) {
            animation-delay: 3s;
          }
          @keyframes growFromCenter {
            0%, 100% {
              transform: scale(0.7);
            }
            50% {
              transform: scale(1);
            }
          }
        `}
      </style>
      
      {/* Center circle */}
      <circle r={centerRadius} fill={color} />

      {[...Array(petals)].map((_, i) => (
        <path
          key={i}
          className="petal"
          d={createPetal((i * 2 * Math.PI) / petals)}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          style={{ transformOrigin: '0 0' }}
        />
      ))}
    </svg>
  );
};

export default AnimatedFlower;