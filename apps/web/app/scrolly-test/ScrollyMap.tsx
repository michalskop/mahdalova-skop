'use client';
import React, { useState } from 'react';
import { Scrollama, Step } from 'react-scrollama';

const ScrollyMapDemo = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1); // Start with -1 for default state
  
  // Default image (shown before scrolling starts)
  const defaultImage = '/images/test/0.png';

  const steps = [
    {
      text: "1 During the 2018 election, all voters in 36 states and D.C. cast ballots on machines that produced paper records.",
      mapState: "initial",
      bgColor: '#ffe7eb',
      image: '/images/test/1.png' // Image for step 0
    },
    {
      text: "2 These 14 states used paperless machines in 2018.",
      mapState: "paperless",
      bgColor: '#e2ffe2',
      image: '/images/test/2.png' // Image for step 1
    },
    {
      text: "3 Others either don't plan to replace all their paperless machines or haven't responded to POLITICO's questions about their plans.",
      mapState: "plans",
      bgColor: '#e2e2ff',
      image: '/images/test/3.png' // Image for step 2
    },
    {
      text: "4 Some extra text here.",
      mapState: "extra",
      bgColor: '#abffab',
      image: '/images/test/4.png' // Image for step 3
    },
    {
      text: "5 This is the end of the scrollytelling demo.",
      mapState: "end-game",
      bgColor: '#888888',
      image: '/images/test/5.png' // Image for step 4
    }
  ];

  const onStepEnter = ({ data }: { data: number }) => {
    setCurrentStepIndex(data);
  };

  const onStepProgress = ({ data, progress }: { data: number; progress: number }) => {
    // If scrolling up and exiting the first step (index 0), reset to default state
    if (data === 0 && progress < 0.1) {
      setCurrentStepIndex(-1);
    }
  };

  const getCurrentImage = () => {
    // If no step is active (default state), show the default image
    if (currentStepIndex === -1) {
      return defaultImage;
    }
    // Otherwise, show the image corresponding to the current step
    return steps[currentStepIndex].image;
  };

  const getBackgroundColor = () => {
    // If no step is active (default state), use a default background color
    if (currentStepIndex === -1) {
      return '#ffffff'; // Default background color
    }
    // Otherwise, use the background color from the steps array
    return steps[currentStepIndex].bgColor;
  };

  return (
    <div>
      <div style={{
        position: 'sticky',
        top: 0,
        height: '100vh',
        marginBottom: '-70vh',
      }}>
        <div style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          backgroundColor: getBackgroundColor(),
        }}>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            maxWidth: '1200px'
          }}>
            <img
              src={getCurrentImage()}
              alt={`Map state: ${currentStepIndex === -1 ? 'default' : steps[currentStepIndex].mapState}`}
              style={{
                width: '100%',
                height: 'auto',
                transition: 'opacity 0.3s ease-in-out'
              }}
            />
          </div>
          {/* <div style={{ padding: '2rem' }}>
            Map State: {currentStepIndex === -1 ? 'default' : steps[currentStepIndex].mapState}
          </div> */}
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <Scrollama offset={0.1} onStepEnter={onStepEnter} onStepProgress={onStepProgress}>
          {steps.map((step, idx) => (
            <Step data={idx} key={idx}>
              <div style={{
                margin: '75vh 0',
                padding: '1rem',
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderRadius: '4px',
                maxWidth: '500px',
                marginLeft: 'auto',
                marginRight: 'auto',
              }}>
                {step.text}
              </div>
            </Step>
          ))}
        </Scrollama>
      </div>
    </div>
  );
};

export default ScrollyMapDemo;