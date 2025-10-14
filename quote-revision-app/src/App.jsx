import React, { useState } from 'react';
import Home from './components/Home';
import TextEditor from './components/TextEditor';
import ReviseModal from './components/ReviseModal';
import PracticeSession from './components/PracticeSession';
import ResultsReview from './components/ResultsReview';
import Analytics from './components/Analytics';
import { getText } from './utils/storage';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [selectedTextId, setSelectedTextId] = useState(null);
  const [reviseSettings, setReviseSettings] = useState(null);
  const [sessionResults, setSessionResults] = useState([]);

  const handleSelectText = (textId) => {
    setSelectedTextId(textId);
    setCurrentView('editor');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setSelectedTextId(null);
  };

  const handleRevise = (textId) => {
    setSelectedTextId(textId);
    setCurrentView('reviseModal');
  };

  const handleStartPractice = (settings) => {
    setReviseSettings(settings);
    setCurrentView('practice');
  };

  const handlePracticeComplete = (results) => {
    setSessionResults(results);
    setCurrentView('results');
  };

  const handleBackFromPractice = () => {
    setCurrentView('editor');
    setReviseSettings(null);
  };

  const handleBackFromResults = () => {
    setCurrentView('editor');
    setSessionResults([]);
  };

  const handleViewAnalytics = () => {
    setCurrentView('analytics');
  };

  const handleBackFromAnalytics = () => {
    setCurrentView('home');
  };

  return (
    <div className="app">
      {currentView === 'home' && (
        <Home 
          onSelectText={handleSelectText}
          onViewAnalytics={handleViewAnalytics}
        />
      )}

      {currentView === 'editor' && (
        <TextEditor
          textId={selectedTextId}
          onBack={handleBackToHome}
          onRevise={handleRevise}
        />
      )}

      {currentView === 'reviseModal' && (
        <ReviseModal
          text={getText(selectedTextId)}
          onClose={() => setCurrentView('editor')}
          onStart={handleStartPractice}
        />
      )}

      {currentView === 'practice' && (
        <PracticeSession
          textId={selectedTextId}
          settings={reviseSettings}
          onBack={handleBackFromPractice}
          onComplete={handlePracticeComplete}
        />
      )}

      {currentView === 'results' && (
        <ResultsReview
          sessionResults={sessionResults}
          onBack={handleBackFromResults}
        />
      )}

      {currentView === 'analytics' && (
        <Analytics onBack={handleBackFromAnalytics} />
      )}
    </div>
  );
}

export default App;