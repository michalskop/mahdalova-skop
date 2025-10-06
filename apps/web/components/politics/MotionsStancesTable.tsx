import React, { useEffect, useState, useRef } from 'react';
import { PartyFace } from './PartyFace';
import type { QuestionData, Stance } from '@/types/politics';



const StanceCell: React.FC<{ stance: Stance; withBorder?: boolean }> = ({ stance, withBorder }) => {
  const cellStyle: React.CSSProperties = {
    padding: '8px',
    verticalAlign: 'top',
    textAlign: 'center',
  };

  if (withBorder) {
    cellStyle.borderLeft = '1px dashed #e0e0e0';
  }

  return (
    <td style={cellStyle}>
    <div style={{ fontWeight: 'bold', minHeight: '24px' }}>
      {stance.seats > 0 ? stance.seats : ''}
    </div>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center', paddingTop: '4px' }}>
      {stance.parties.map(party => <PartyFace key={party} party={party} size={36} />)}
    </div>
  </td>
  )
};

interface MotionsStancesTableProps {
  data?: string; // Inline data as a JSON string
  fileData?: QuestionData[]; // Data from file via scope
  maxHeight?: string;
}

export const MotionsStancesTable: React.FC<MotionsStancesTableProps> = ({ data: inlineData, fileData = [], maxHeight: initialMaxHeight }) => {
  let data: QuestionData[] = fileData;
  if (inlineData) {
    try {
      data = JSON.parse(inlineData);
    } catch (e) {
      console.error("Failed to parse inline data for KalkulackaTable", e);
      data = []; // Fallback to empty array on parse error
    }
  }
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState(initialMaxHeight);

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const isAtBottom = scrollHeight - scrollTop <= clientHeight + 1;
      setIsScrolledToBottom(isAtBottom);
    }
  };

  useEffect(() => {
    if (!initialMaxHeight) {
      setMaxHeight('calc(100vh - 100px)');
    }

    // Initial check in case the content is not scrollable from the start
    handleScroll();
  }, [initialMaxHeight, data]);

  const containerStyle: React.CSSProperties = {
    margin: '2rem 0',
    position: 'relative', // Required for positioning the shadow
  };

  if (maxHeight) {
    containerStyle.maxHeight = maxHeight;
    containerStyle.overflow = 'auto';
    // Apply mask for fade-out effect, remove it when scrolled to bottom
    containerStyle.maskImage = isScrolledToBottom
      ? 'none'
      : 'linear-gradient(to bottom, black calc(100% - 60px), transparent 100%)';
  }

  const thStyle: React.CSSProperties = {
    padding: '8px',
    textAlign: 'left',
    position: 'sticky',
    top: 0,
    backgroundColor: 'white',
    borderBottom: '2px solid #333',
    zIndex: 1,
  };
  return (
    <div style={containerStyle} ref={containerRef} onScroll={handleScroll}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
        <thead>
          <tr>
            <th style={thStyle}>Většina</th>
            <th style={thStyle}>Otázka</th>
            <th style={{ ...thStyle, borderLeft: '1px dashed #e0e0e0' }}>Pro</th>
            <th style={{ ...thStyle, borderLeft: '1px dashed #e0e0e0' }}>Neutrální</th>
            <th style={{ ...thStyle, borderLeft: '1px dashed #e0e0e0' }}>Proti</th>
          </tr>
        </thead>
        <tbody>
          {(data || []).map((row, index) => {
            let majorityText: string;
            let majorityColor: string;

            if (row.yes.seats > 100) {
              majorityText = 'Pro';
              majorityColor = '#0e926a';
            } else if (row.no.seats > 100) {
              majorityText = 'Proti';
              majorityColor = '#de1743';
            } else {
              majorityText = 'Žádná';
              majorityColor = 'gray';
            }

            return (
              <tr key={index} style={{ borderBottom: '1px solid #e0e0e0' }}>
                <td style={{ padding: '8px', fontWeight: 'bold', color: majorityColor, verticalAlign: 'top' }}>
                  {majorityText}
                </td>
                <td style={{ padding: '8px', fontWeight: 500, verticalAlign: 'top' }}>{row.motion}</td>
                <StanceCell stance={row.yes} withBorder />
                <StanceCell stance={row.neutral} withBorder />
                <StanceCell stance={row.no} withBorder />
              </tr>
            );
          })}
                </tbody>
      </table>
          </div>
  );
};
